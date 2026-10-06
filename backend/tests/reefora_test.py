"""REEFORA backend tests: payments (demo), auth, monitoring, team, gallery, media, regression."""
import io
import os
import time
import pytest
import requests
from PIL import Image

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://coral-grow.preview.emergentagent.com").rstrip("/")
API = f"{BASE}/api"

ADMIN_TOKEN = os.environ["ADMIN_TOKEN"]
FIELD_TOKEN = os.environ["FIELD_TOKEN"]
NONE_TOKEN = os.environ["NONE_TOKEN"]

ADMIN_H = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
FIELD_H = {"Authorization": f"Bearer {FIELD_TOKEN}"}
NONE_H = {"Authorization": f"Bearer {NONE_TOKEN}"}


def _png_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (40, 40), (0, 128, 128)).save(buf, "PNG")
    return buf.getvalue()


# ---------- Payments ----------
def test_payments_config_demo():
    r = requests.get(f"{API}/payments/config")
    assert r.status_code == 200
    d = r.json()
    assert d["mode"] == "demo"
    assert d["client_key"] is None


def _create_adoption():
    # pick an available coral
    r = requests.get(f"{API}/corals", params={"status": "available"})
    assert r.status_code == 200
    coral = r.json()[0]
    r = requests.post(f"{API}/adoptions", json={
        "coral_id": coral["coral_id"], "package": "seed", "adoption_type": "individual",
        "coral_name": "TEST_coral", "adopter_name": "TEST_User", "email": "test_user@example.com",
    })
    assert r.status_code == 200, r.text
    return r.json(), coral["coral_id"]


def test_adoption_confirm_qris_demo():
    a, cid = _create_adoption()
    r = requests.post(f"{API}/adoptions/{a['id']}/confirm", json={"method": "qris"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["payment_status"] == "paid"
    assert "QRIS" in d["payment_method"]
    # verify status endpoint
    s = requests.get(f"{API}/adoptions/{a['id']}/status")
    assert s.status_code == 200 and s.json()["payment_status"] == "paid"
    # cleanup
    requests.post(f"{BASE}/__cleanup", json={})  # ignored
    # Reset coral
    import pymongo
    cli = pymongo.MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    cli["test_database"]["corals"].update_one({"coral_id": cid}, {"$set": {"adoption_status": "available"}})
    cli["test_database"]["adoptions"].delete_one({"id": a["id"]})


def test_adoption_confirm_bank_va():
    a, cid = _create_adoption()
    r = requests.post(f"{API}/adoptions/{a['id']}/confirm", json={"method": "bca_va"})
    assert r.status_code == 200
    assert r.json()["payment_status"] == "paid"
    import pymongo
    cli = pymongo.MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    cli["test_database"]["corals"].update_one({"coral_id": cid}, {"$set": {"adoption_status": "available"}})
    cli["test_database"]["adoptions"].delete_one({"id": a["id"]})


def test_live_pay_blocked_in_demo():
    a, cid = _create_adoption()
    r = requests.post(f"{API}/adoptions/{a['id']}/pay")
    assert r.status_code == 400
    import pymongo
    cli = pymongo.MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    cli["test_database"]["adoptions"].delete_one({"id": a["id"]})


def test_notification_malformed():
    r = requests.post(f"{API}/payments/notification", json={})
    assert r.status_code in (400, 403)


def test_notification_bad_signature():
    r = requests.post(f"{API}/payments/notification", json={
        "order_id": "x", "status_code": "200", "gross_amount": "100", "signature_key": "bad"
    })
    assert r.status_code in (400, 403)


# ---------- Auth ----------
def test_auth_me_admin():
    r = requests.get(f"{API}/auth/me", headers=ADMIN_H)
    assert r.status_code == 200
    d = r.json()
    assert d["role"] == "admin"
    assert d["email"] == "aidahsandyaulia05@gmail.com"


def test_auth_me_field():
    r = requests.get(f"{API}/auth/me", headers=FIELD_H)
    assert r.status_code == 200
    assert r.json()["role"] == "field"


def test_auth_me_not_allowlisted():
    r = requests.get(f"{API}/auth/me", headers=NONE_H)
    assert r.status_code == 403


def test_auth_me_no_token():
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


# ---------- Monitoring ----------
def test_monitoring_create_requires_auth():
    r = requests.post(f"{API}/monitoring", data={"coral_id": "RF-02481", "health": "Healthy",
                                                  "survival": "Active", "growth_pct": "10", "date": "2026-10-06"})
    assert r.status_code == 401


def test_monitoring_create_and_list():
    files = [("files", ("t.png", _png_bytes(), "image/png"))]
    r = requests.post(f"{API}/monitoring", headers=ADMIN_H, data={
        "coral_id": "RF-02481", "health": "Healthy", "survival": "Active",
        "growth_pct": "22", "date": "2026-10-06", "water_temp": "28.4", "note": "TEST_ smoke new"
    }, files=files)
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["coral_id"] == "RF-02481"
    assert len(doc["media"]) == 1
    assert doc["media"][0]["kind"] == "image"
    media_url = doc["media"][0]["url"]

    # list
    l = requests.get(f"{API}/monitoring", headers=ADMIN_H, params={"coral_id": "RF-02481"})
    assert l.status_code == 200 and any(x["id"] == doc["id"] for x in l.json())

    # list requires auth
    l2 = requests.get(f"{API}/monitoring")
    assert l2.status_code == 401

    # media public with range
    full = requests.get(f"{BASE}{media_url}")
    assert full.status_code == 200
    rng = requests.get(f"{BASE}{media_url}", headers={"Range": "bytes=0-10"})
    assert rng.status_code == 206
    assert "Content-Range" in rng.headers

    # delete by owner
    d = requests.delete(f"{API}/monitoring/{doc['id']}", headers=ADMIN_H)
    assert d.status_code == 200

    # verify soft-deleted (not in list)
    l3 = requests.get(f"{API}/monitoring", headers=ADMIN_H, params={"coral_id": "RF-02481"})
    assert not any(x["id"] == doc["id"] for x in l3.json())


def test_monitoring_invalid_health():
    r = requests.post(f"{API}/monitoring", headers=ADMIN_H, data={
        "coral_id": "RF-02481", "health": "Bogus", "survival": "Active",
        "growth_pct": "10", "date": "2026-10-06"
    })
    assert r.status_code == 400


def test_monitoring_invalid_file_type():
    files = [("files", ("t.txt", b"hello", "text/plain"))]
    r = requests.post(f"{API}/monitoring", headers=ADMIN_H, data={
        "coral_id": "RF-02481", "health": "Healthy", "survival": "Active",
        "growth_pct": "10", "date": "2026-10-06"
    }, files=files)
    assert r.status_code == 400


def test_monitoring_field_can_only_delete_own():
    # admin creates
    files = [("files", ("t.png", _png_bytes(), "image/png"))]
    r = requests.post(f"{API}/monitoring", headers=ADMIN_H, data={
        "coral_id": "RF-02481", "health": "Healthy", "survival": "Active",
        "growth_pct": "11", "date": "2026-10-06", "note": "TEST_ admin-owned"
    }, files=files)
    assert r.status_code == 200
    mid = r.json()["id"]
    # field tries to delete admin's
    d = requests.delete(f"{API}/monitoring/{mid}", headers=FIELD_H)
    assert d.status_code == 403
    # admin cleans up
    requests.delete(f"{API}/monitoring/{mid}", headers=ADMIN_H)


# ---------- Team ----------
def test_team_admin_list_add_remove():
    r = requests.get(f"{API}/team", headers=ADMIN_H)
    assert r.status_code == 200
    assert "aidahsandyaulia05@gmail.com" in r.json()["admins"]
    # add
    a = requests.post(f"{API}/team", headers=ADMIN_H, json={"email": "test_newfield@example.com", "name": "TEST New"})
    assert a.status_code == 200
    r2 = requests.get(f"{API}/team", headers=ADMIN_H)
    assert any(m["email"] == "test_newfield@example.com" for m in r2.json()["members"])
    # remove
    rm = requests.delete(f"{API}/team/test_newfield@example.com", headers=ADMIN_H)
    assert rm.status_code == 200


def test_team_non_admin_forbidden():
    r = requests.get(f"{API}/team", headers=FIELD_H)
    assert r.status_code == 403


# ---------- Gallery ----------
def test_gallery_empty_or_items():
    r = requests.get(f"{API}/gallery")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Coral profile with field updates ----------
def test_coral_profile_rf02481():
    r = requests.get(f"{API}/profile/RF-02481")
    assert r.status_code == 200
    d = r.json()
    assert d["coral"]["coral_id"] == "RF-02481"
    assert d["adoption"] is not None
    assert d["monitoring"] is not None
    assert "updates" in d
    assert isinstance(d["updates"], list)


# ---------- Logout ----------
def test_logout_clears_session():
    # create disposable session
    import pymongo
    cli = pymongo.MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
    db = cli["test_database"]
    from datetime import datetime, timezone, timedelta
    tok = f"test_logout_{int(time.time()*1000)}"
    db.user_sessions.insert_one({"user_id": "user_smoke1", "session_token": tok,
                                 "expires_at": datetime.now(timezone.utc)+timedelta(days=1), "created_at": datetime.now(timezone.utc)})
    s = requests.Session()
    s.cookies.set("session_token", tok, domain="coral-grow.preview.emergentagent.com")
    r = s.post(f"{API}/auth/logout")
    assert r.status_code == 200
    # token removed
    assert db.user_sessions.find_one({"session_token": tok}) is None


# ---------- Regression ----------
def test_regression_core():
    assert requests.get(f"{API}/").status_code == 200
    assert requests.get(f"{API}/corals").status_code == 200
    assert requests.get(f"{API}/stats").status_code == 200
    assert requests.get(f"{API}/meta").status_code == 200
    assert requests.get(f"{API}/sites").status_code == 200
