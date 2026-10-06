"""REEFORA backend API tests."""
import os
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://coral-grow.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

created_adoption_ids = []
created_coral_ids = set()
created_enquiry_ids = []


@pytest.fixture(scope="session", autouse=True)
def cleanup():
    yield
    # Cleanup: remove created adoptions, enquiries; reset coral status
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        if created_adoption_ids:
            db.adoptions.delete_many({"id": {"$in": created_adoption_ids}, "demo": {"$ne": True}})
        if created_enquiry_ids:
            db.enquiries.delete_many({"id": {"$in": created_enquiry_ids}})
        for cid in created_coral_ids:
            if cid != "RF-02481":
                db.corals.update_one({"coral_id": cid}, {"$set": {"adoption_status": "available"}})
        client.close()
    except Exception as e:
        print(f"Cleanup error: {e}")


# ---------- Meta / Sites / Stats ----------
def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert "REEFORA" in r.json()["message"]


def test_meta():
    r = requests.get(f"{API}/meta")
    assert r.status_code == 200
    d = r.json()
    assert "species" in d and "sites" in d and "packages" in d
    assert "seed" in d["packages"]


def test_sites():
    r = requests.get(f"{API}/sites")
    assert r.status_code == 200
    sites = r.json()
    assert len(sites) == 4
    assert {s["code"] for s in sites} == {"A", "B", "C", "D"}


def test_stats():
    r = requests.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ("corals_adopted", "restoration_sites", "coastal_workers", "research_collaborations", "people_reached"):
        assert k in d


def test_campaign_idol():
    r = requests.get(f"{API}/campaign/idol")
    assert r.status_code == 200
    d = r.json()
    assert d["goal"] == 5000
    assert len(d["fandoms"]) == 3


def test_science():
    r = requests.get(f"{API}/science")
    assert r.status_code == 200
    d = r.json()
    for k in ("growth", "survival", "bleaching", "water", "species", "recovery"):
        assert k in d and len(d[k]) > 0


# ---------- Corals ----------
def test_list_corals_all():
    r = requests.get(f"{API}/corals")
    assert r.status_code == 200
    corals = r.json()
    assert len(corals) == 24
    assert all("coral_id" in c for c in corals)


def test_filter_species():
    r = requests.get(f"{API}/corals", params={"species": "Acropora tenuis"})
    assert r.status_code == 200
    corals = r.json()
    assert len(corals) > 0
    assert all(c["scientific_name"] == "Acropora tenuis" for c in corals)


def test_filter_site():
    r = requests.get(f"{API}/corals", params={"site": "A"})
    assert r.status_code == 200
    assert all(c["site_code"] == "A" for c in r.json())


def test_filter_status_available():
    r = requests.get(f"{API}/corals", params={"status": "available"})
    assert r.status_code == 200
    assert all(c["adoption_status"] == "available" for c in r.json())


def test_filter_adoption_type():
    r = requests.get(f"{API}/corals", params={"adoption_type": "idol"})
    assert r.status_code == 200
    assert all("idol" in c["adoption_types"] for c in r.json())


def test_filter_q_search():
    r = requests.get(f"{API}/corals", params={"q": "RF-02481"})
    assert r.status_code == 200
    corals = r.json()
    assert any(c["coral_id"] == "RF-02481" for c in corals)


def test_get_coral_by_id():
    r = requests.get(f"{API}/corals/RF-02481")
    assert r.status_code == 200
    assert r.json()["coral_id"] == "RF-02481"


def test_get_coral_case_insensitive():
    r = requests.get(f"{API}/corals/rf-02481")
    assert r.status_code == 200


def test_get_coral_not_found():
    r = requests.get(f"{API}/corals/RF-99999")
    assert r.status_code == 404


# ---------- Profile / Lookup ----------
def test_profile_demo():
    r = requests.get(f"{API}/profile/RF-02481")
    assert r.status_code == 200
    d = r.json()
    assert d["coral"]["coral_id"] == "RF-02481"
    assert d["adoption"]["adopter_name"] == "Aidah"
    assert d["adoption"]["coral_name"] == "Lumi"
    assert "email" not in d["adoption"]
    assert "phone" not in d["adoption"]
    assert len(d["timeline"]) == 5
    assert d["monitoring"]["health"] == "Healthy"


def test_lookup_by_name():
    r = requests.get(f"{API}/lookup", params={"q": "Aidah"})
    assert r.status_code == 200
    docs = r.json()
    assert any(d["coral_id"] == "RF-02481" for d in docs)


def test_lookup_empty():
    r = requests.get(f"{API}/lookup", params={"q": "ZZZNoSuch"})
    assert r.status_code == 200
    assert r.json() == []


def test_lookup_missing_query():
    r = requests.get(f"{API}/lookup", params={"q": ""})
    assert r.status_code == 400


# ---------- Adoption flow ----------
def _find_available_coral():
    r = requests.get(f"{API}/corals", params={"status": "available"})
    assert r.status_code == 200
    corals = r.json()
    assert len(corals) > 0, "No available corals for adoption test"
    return corals[0]["coral_id"]


def test_adoption_flow_complete():
    coral_id = _find_available_coral()
    created_coral_ids.add(coral_id)
    payload = {
        "coral_id": coral_id,
        "package": "guardian",
        "adoption_type": "individual",
        "coral_name": "TESTLumi",
        "adopter_name": "TEST_Adopter",
        "email": "test_adopter@example.com",
        "extra_donation": 50000,
    }
    r = requests.post(f"{API}/adoptions", json=payload)
    assert r.status_code == 200, r.text
    adopt = r.json()
    assert adopt["payment_status"] == "pending"
    assert adopt["amount"] == 350000 + 50000
    assert adopt["qris_ref"].startswith("QR")
    aid = adopt["id"]
    created_adoption_ids.append(aid)

    # Confirm
    r2 = requests.post(f"{API}/adoptions/{aid}/confirm")
    assert r2.status_code == 200
    confirmed = r2.json()
    assert confirmed["payment_status"] == "paid"
    assert confirmed["certificate_no"].startswith("REEF-")
    assert confirmed["adopted_at"]

    # GET adoption excludes PII
    r3 = requests.get(f"{API}/adoptions/{aid}")
    assert r3.status_code == 200
    d = r3.json()
    assert "email" not in d["adoption"]
    assert "phone" not in d["adoption"]
    assert d["coral"]["coral_id"] == coral_id
    assert d["coral"]["adoption_status"] == "adopted"


def test_second_adoption_same_coral_returns_409():
    # Use a fresh coral, adopt+confirm, then try adopting again
    coral_id = _find_available_coral()
    created_coral_ids.add(coral_id)
    payload = {
        "coral_id": coral_id, "package": "seed", "adoption_type": "individual",
        "adopter_name": "TEST_First", "email": "test1@example.com",
    }
    r = requests.post(f"{API}/adoptions", json=payload)
    assert r.status_code == 200
    aid = r.json()["id"]
    created_adoption_ids.append(aid)
    rc = requests.post(f"{API}/adoptions/{aid}/confirm")
    assert rc.status_code == 200

    # Second adoption attempt
    r2 = requests.post(f"{API}/adoptions", json={**payload, "adopter_name": "TEST_Second", "email": "test2@example.com"})
    assert r2.status_code == 409


def test_adoption_invalid_package():
    r = requests.post(f"{API}/adoptions", json={
        "coral_id": "RF-02482", "package": "invalid", "adopter_name": "x", "email": "x@y.com",
    })
    assert r.status_code in (400, 422)


def test_adoption_coral_not_found():
    r = requests.post(f"{API}/adoptions", json={
        "coral_id": "RF-99999", "package": "seed", "adopter_name": "x", "email": "x@y.com",
    })
    assert r.status_code == 404


def test_adoption_invalid_email():
    r = requests.post(f"{API}/adoptions", json={
        "coral_id": "RF-02482", "package": "seed", "adopter_name": "x", "email": "not-an-email",
    })
    assert r.status_code == 422


def test_confirm_nonexistent_adoption():
    r = requests.post(f"{API}/adoptions/does-not-exist/confirm")
    assert r.status_code == 404


# ---------- Enquiries ----------
@pytest.mark.parametrize("kind", ["partner", "csr", "research", "visit", "idol", "tourism", "general"])
def test_enquiry_create(kind):
    r = requests.post(f"{API}/enquiries", json={
        "kind": kind, "name": f"TEST_{kind}", "email": f"test_{kind}@example.com",
        "organization": "TestOrg", "message": "Hello",
    })
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["kind"] == kind
    created_enquiry_ids.append(d["id"])


def test_enquiry_invalid_kind():
    r = requests.post(f"{API}/enquiries", json={
        "kind": "spam", "name": "x", "email": "x@y.com",
    })
    assert r.status_code == 400


def test_enquiry_invalid_email():
    r = requests.post(f"{API}/enquiries", json={
        "kind": "general", "name": "x", "email": "bad",
    })
    assert r.status_code == 422
