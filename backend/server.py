from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Form, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import hmac
import hashlib
import asyncio
import httpx
import requests
import random
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI()
api = APIRouter(prefix="/api")

SITES = [
    {"code": "A", "name": "Restoration Site A", "location": "Pulau Menjangan, Bali", "lat": -8.09, "lng": 114.51, "corals": 250, "years": 3, "depth": "3–12 m",
     "experiences": ["nursery", "restoration", "snorkeling", "diving", "community"], "image": "/img/hero_coral.jpg"},
    {"code": "B", "name": "Restoration Site B", "location": "Taman Nasional Wakatobi", "lat": -5.32, "lng": 123.59, "corals": 410, "years": 4, "depth": "4–15 m",
     "experiences": ["nursery", "restoration", "diving", "community"], "image": "/img/reef3.jpg"},
    {"code": "C", "name": "Restoration Site C", "location": "Pulau Derawan, Kalimantan", "lat": 2.28, "lng": 118.25, "corals": 180, "years": 2, "depth": "2–10 m",
     "experiences": ["nursery", "snorkeling", "community"], "image": "/img/reef1.jpg"},
    {"code": "D", "name": "Restoration Site D", "location": "Raja Ampat, Papua Barat", "lat": -0.23, "lng": 130.52, "corals": 360, "years": 3, "depth": "5–18 m",
     "experiences": ["nursery", "restoration", "diving", "snorkeling", "community"], "image": "/img/reef4.jpg"},
]

SPECIES = [
    {"common": "Table Acropora", "scientific": "Acropora tenuis", "image": "/img/acropora.jpg", "growth": "Fast", "depth": "3–15 m"},
    {"common": "Lobe Coral", "scientific": "Porites lutea", "image": "/img/reef2.jpg", "growth": "Slow", "depth": "1–20 m"},
    {"common": "Finger Coral", "scientific": "Montipora digitata", "image": "/img/fragment.jpg", "growth": "Fast", "depth": "1–8 m"},
    {"common": "Hyacinth Table Coral", "scientific": "Acropora hyacinthus", "image": "/img/reef1.jpg", "growth": "Fast", "depth": "2–12 m"},
    {"common": "Cauliflower Coral", "scientific": "Pocillopora damicornis", "image": "/img/polyps.jpg", "growth": "Medium", "depth": "1–10 m"},
    {"common": "Hood Coral", "scientific": "Stylophora pistillata", "image": "/img/reef3.jpg", "growth": "Medium", "depth": "2–14 m"},
]

RESTORATION = ["Nursery", "Transplanted", "Growing", "Established"]
ADOPTION_TYPES = ["individual", "corporate", "idol", "tourism"]

PACKAGES = {
    "seed": {"name": "Seed", "price": 150000},
    "guardian": {"name": "Guardian", "price": 350000},
    "legacy": {"name": "Legacy", "price": 750000},
}

STAGES = [("Day 01", 0), ("Month 03", 90), ("Month 06", 180), ("Month 12", 365), ("Month 24", 730)]
STAGE_IMAGES = ["/img/fragment.jpg", "/img/nursery.jpg", "/img/polyps.jpg", "/img/acropora.jpg", "/img/hero_coral.jpg"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class Coral(BaseModel):
    coral_id: str
    species: str
    scientific_name: str
    site_code: str
    site_name: str
    location: str
    restoration_status: str
    adoption_status: str
    adoption_types: List[str]
    restoration_progress: int
    image: str
    depth: str
    growth_rate: str


class AdoptionCreate(BaseModel):
    coral_id: str
    package: str
    adoption_type: str = "individual"
    coral_name: Optional[str] = Field(default=None, max_length=40)
    adopter_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    phone: Optional[str] = None
    message: Optional[str] = Field(default=None, max_length=280)
    extra_donation: int = Field(default=0, ge=0)
    frequency: str = "one-time"
    project: Optional[str] = None
    campaign: Optional[str] = None


class Adoption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    certificate_no: str = ""
    coral_id: str
    package: str
    package_name: str
    adoption_type: str
    coral_name: Optional[str] = None
    adopter_name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    extra_donation: int = 0
    frequency: str = "one-time"
    project: Optional[str] = None
    campaign: Optional[str] = None
    amount: int
    payment_status: str = "pending"
    payment_method: str = "QRIS (simulated)"
    qris_ref: str
    created_at: str = Field(default_factory=now_iso)
    adopted_at: Optional[str] = None


class EnquiryCreate(BaseModel):
    kind: str
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    organization: Optional[str] = None
    message: Optional[str] = Field(default=None, max_length=2000)
    program: Optional[str] = None


class Enquiry(EnquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


def build_corals():
    rng = random.Random(42)
    corals = []
    for i in range(24):
        num = 2481 + i
        sp = SPECIES[i % len(SPECIES)]
        site = SITES[(i * 3 + i // 6) % len(SITES)]
        types = sorted(set(["individual"] + rng.sample(ADOPTION_TYPES, 2)), key=ADOPTION_TYPES.index)
        status = "adopted" if num == 2481 else ("reserved" if i % 9 == 5 else "available")
        corals.append(Coral(
            coral_id=f"RF-0{num}", species=sp["common"], scientific_name=sp["scientific"],
            site_code=site["code"], site_name=site["name"], location=site["location"],
            restoration_status=RESTORATION[i % 4], adoption_status=status, adoption_types=types,
            restoration_progress=rng.randint(25, 92), image=sp["image"], depth=sp["depth"], growth_rate=sp["growth"],
        ).model_dump())
    return corals


@app.on_event("startup")
async def seed():
    if await db.corals.count_documents({}) == 0:
        await db.corals.insert_many(build_corals())
    if not await db.adoptions.find_one({"coral_id": "RF-02481"}):
        demo = Adoption(
            certificate_no="REEF-2026-000001", coral_id="RF-02481", package="guardian", package_name="Guardian",
            adoption_type="individual", coral_name="Lumi", adopter_name="Aidah", email="aidah@example.com",
            amount=350000, payment_status="paid", qris_ref="DEMO-000001",
            adopted_at=datetime(2026, 10, 12, tzinfo=timezone.utc).isoformat(),
        )
        doc = demo.model_dump()
        doc["demo"] = True
        await db.adoptions.insert_one(doc)
    await db.corals.create_index("coral_id", unique=True)
    await db.adoptions.create_index("id", unique=True)


def clean(doc):
    doc.pop("_id", None)
    return doc


def timeline_for(adopted_at: str, demo: bool):
    start = datetime.fromisoformat(adopted_at)
    elapsed = (datetime.now(timezone.utc) - start).days
    growth = [0, 6, 11, 18, 34]
    notes = [
        "Fragment planted on nursery frame. Tagged and photographed.",
        "Polyps settled. First calcification visible at branch tips.",
        "New branches forming. Attached firmly to substrate.",
        "Healthy micro-colony with good colour and branching.",
        "Mature colony, contributing to reef structure.",
    ]
    out = []
    for idx, (label, days) in enumerate(STAGES):
        done = (idx <= 3) if demo else elapsed >= days
        out.append({"label": label, "date": (start + timedelta(days=days)).date().isoformat(),
                    "status": "done" if done else "upcoming", "growth": growth[idx],
                    "image": STAGE_IMAGES[idx], "note": notes[idx]})
    return out


@api.get("/")
async def root():
    return {"message": "REEFORA API"}


@api.get("/meta")
async def meta():
    return {"species": [{"common": s["common"], "scientific": s["scientific"]} for s in SPECIES],
            "sites": SITES, "adoption_types": ADOPTION_TYPES, "packages": PACKAGES}


@api.get("/sites")
async def sites():
    return SITES


@api.get("/corals", response_model=List[Coral])
async def list_corals(species: Optional[str] = None, site: Optional[str] = None, location: Optional[str] = None,
                      adoption_type: Optional[str] = None, status: Optional[str] = None, q: Optional[str] = None):
    query = {}
    if species:
        query["scientific_name"] = species
    if site:
        query["site_code"] = site
    if location:
        query["location"] = location
    if adoption_type:
        query["adoption_types"] = adoption_type
    if status:
        query["adoption_status"] = status
    if q:
        rx = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [{"coral_id": rx}, {"species": rx}, {"scientific_name": rx}, {"location": rx}]
    docs = await db.corals.find(query, {"_id": 0}).sort("coral_id", 1).to_list(200)
    return docs


@api.get("/corals/{coral_id}", response_model=Coral)
async def get_coral(coral_id: str):
    doc = await db.corals.find_one({"coral_id": coral_id.upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Coral not found")
    return doc


@api.post("/adoptions")
async def create_adoption(body: AdoptionCreate):
    if body.package not in PACKAGES:
        raise HTTPException(400, "Invalid package")
    if body.adoption_type not in ADOPTION_TYPES:
        raise HTTPException(400, "Invalid adoption type")
    coral = await db.corals.find_one({"coral_id": body.coral_id.upper()}, {"_id": 0})
    if not coral:
        raise HTTPException(404, "Coral not found")
    if coral["adoption_status"] != "available":
        raise HTTPException(409, "This coral is no longer available")
    pkg = PACKAGES[body.package]
    data = body.model_dump()
    data["coral_id"] = coral["coral_id"]
    adoption = Adoption(**data, package_name=pkg["name"], amount=pkg["price"] + body.extra_donation,
                        qris_ref=f"QR{uuid.uuid4().hex[:10].upper()}")
    await db.adoptions.insert_one(adoption.model_dump())
    return adoption.model_dump()


# ---------- Payments (Midtrans Snap, with simulated demo fallback) ----------
MT_SERVER_KEY = os.environ.get("MIDTRANS_SERVER_KEY", "").strip()
MT_CLIENT_KEY = os.environ.get("MIDTRANS_CLIENT_KEY", "").strip()
MT_PROD = os.environ.get("MIDTRANS_IS_PRODUCTION", "false").lower() == "true"
MT_SNAP = "https://app.midtrans.com" if MT_PROD else "https://app.sandbox.midtrans.com"
MT_API = "https://api.midtrans.com" if MT_PROD else "https://api.sandbox.midtrans.com"
MT_METHODS = ["qris", "shopeepay", "bca_va", "bni_va", "bri_va", "permata_va", "other_va"]
PAID_STATES = {"settlement", "capture"}


def live_payments():
    return bool(MT_SERVER_KEY and MT_CLIENT_KEY)


async def finalize_adoption(adoption: dict, method: str):
    if adoption["payment_status"] == "paid":
        return adoption
    res = await db.corals.update_one({"coral_id": adoption["coral_id"], "adoption_status": "available"},
                                     {"$set": {"adoption_status": "adopted"}})
    if res.modified_count == 0:
        await db.adoptions.update_one({"id": adoption["id"]}, {"$set": {"payment_status": "paid_conflict", "payment_method": method}})
        raise HTTPException(409, "This coral was just adopted by someone else")
    count = await db.adoptions.count_documents({"payment_status": "paid"})
    update = {"payment_status": "paid", "adopted_at": now_iso(), "payment_method": method,
              "certificate_no": f"REEF-{datetime.now(timezone.utc).year}-{count + 1:06d}"}
    await db.adoptions.update_one({"id": adoption["id"]}, {"$set": update})
    adoption.update(update)
    return adoption


async def get_adoption_or_404(adoption_id: str):
    adoption = await db.adoptions.find_one({"id": adoption_id}, {"_id": 0})
    if not adoption:
        raise HTTPException(404, "Adoption not found")
    return adoption


@api.get("/payments/config")
async def payments_config():
    return {"mode": "midtrans" if live_payments() else "demo", "client_key": MT_CLIENT_KEY if live_payments() else None,
            "snap_url": f"{MT_SNAP}/snap/snap.js", "is_production": MT_PROD}


class DemoConfirm(BaseModel):
    method: str = "qris"


@api.post("/adoptions/{adoption_id}/confirm")
async def confirm_adoption(adoption_id: str, body: Optional[DemoConfirm] = None):
    if live_payments():
        raise HTTPException(403, "Simulated confirmation is disabled when live payments are active")
    adoption = await get_adoption_or_404(adoption_id)
    method = (body.method if body else "qris")
    return await finalize_adoption(adoption, f"{method.upper()} (simulated)")


@api.post("/adoptions/{adoption_id}/pay")
async def start_payment(adoption_id: str):
    if not live_payments():
        raise HTTPException(400, "Live payments are not configured")
    adoption = await get_adoption_or_404(adoption_id)
    if adoption["payment_status"] != "pending":
        raise HTTPException(409, "Adoption is not awaiting payment")
    if adoption.get("snap_token"):
        return {"token": adoption["snap_token"]}
    payload = {
        "transaction_details": {"order_id": adoption["id"], "gross_amount": int(adoption["amount"])},
        "customer_details": {"first_name": adoption["adopter_name"][:50], "email": adoption["email"], "phone": adoption.get("phone") or ""},
        "item_details": [{"id": adoption["coral_id"], "price": int(adoption["amount"]), "quantity": 1,
                          "name": f"Coral Adoption {adoption['coral_id']} ({adoption['package_name']})"[:50]}],
        "enabled_payments": MT_METHODS,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(f"{MT_SNAP}/snap/v1/transactions", json=payload, auth=(MT_SERVER_KEY, ""), headers={"Accept": "application/json"})
    if r.status_code >= 300:
        logging.error("Midtrans checkout failed: %s", r.status_code)
        raise HTTPException(502, "Payment provider rejected the checkout")
    token = r.json()["token"]
    await db.adoptions.update_one({"id": adoption_id}, {"$set": {"snap_token": token, "payment_method": "Midtrans"}})
    return {"token": token}


async def apply_midtrans_status(adoption: dict, data: dict):
    status = data.get("transaction_status")
    await db.adoptions.update_one({"id": adoption["id"]}, {"$set": {"provider_status": status, "payment_type": data.get("payment_type")}})
    if status in PAID_STATES and data.get("fraud_status", "accept") == "accept":
        return await finalize_adoption(adoption, f"Midtrans · {data.get('payment_type', '')}")
    if status in {"deny", "cancel", "expire", "failure"} and adoption["payment_status"] == "pending":
        await db.adoptions.update_one({"id": adoption["id"]}, {"$set": {"payment_status": "failed"}})
        adoption["payment_status"] = "failed"
    return adoption


@api.post("/payments/notification")
async def payment_notification(request: Request):
    data = await request.json()
    parts = [str(data.get(k, "")) for k in ("order_id", "status_code", "gross_amount")]
    if not all(parts) or not MT_SERVER_KEY:
        raise HTTPException(400, "Malformed notification")
    expected = hashlib.sha512(("".join(parts) + MT_SERVER_KEY).encode()).hexdigest()
    if not hmac.compare_digest(expected, str(data.get("signature_key", ""))):
        raise HTTPException(403, "Invalid signature")
    adoption = await db.adoptions.find_one({"id": data["order_id"]}, {"_id": 0})
    if adoption:
        try:
            await apply_midtrans_status(adoption, data)
        except HTTPException:
            logging.warning("Paid adoption %s conflicts with an already adopted coral", adoption["id"])
    return {"ok": True}


@api.get("/adoptions/{adoption_id}/status")
async def adoption_status(adoption_id: str):
    adoption = await get_adoption_or_404(adoption_id)
    if adoption["payment_status"] == "pending" and live_payments() and adoption.get("snap_token"):
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(f"{MT_API}/v2/{adoption_id}/status", auth=(MT_SERVER_KEY, ""), headers={"Accept": "application/json"})
        if r.status_code == 200 and r.json().get("transaction_status"):
            adoption = await apply_midtrans_status(adoption, r.json())
    return {"id": adoption["id"], "payment_status": adoption["payment_status"]}


@api.get("/adoptions/{adoption_id}")
async def get_adoption(adoption_id: str):
    adoption = await db.adoptions.find_one({"id": adoption_id}, {"_id": 0, "email": 0, "phone": 0})
    if not adoption:
        raise HTTPException(404, "Adoption not found")
    coral = await db.corals.find_one({"coral_id": adoption["coral_id"]}, {"_id": 0})
    return {"adoption": adoption, "coral": coral}


@api.get("/profile/{coral_id}")
async def coral_profile(coral_id: str):
    coral = await db.corals.find_one({"coral_id": coral_id.upper()}, {"_id": 0})
    if not coral:
        raise HTTPException(404, "Coral not found")
    adoption = await db.adoptions.find_one({"coral_id": coral["coral_id"], "payment_status": "paid"},
                                           {"_id": 0, "email": 0, "phone": 0})
    if not adoption:
        return {"coral": coral, "adoption": None, "timeline": [], "monitoring": None}
    demo = bool(adoption.get("demo"))
    timeline = timeline_for(adoption["adopted_at"], demo)
    done = [s for s in timeline if s["status"] == "done"]
    last = done[-1]
    updates = await db.monitoring.find({"coral_id": coral["coral_id"], "is_deleted": False}, {"_id": 0, "created_by": 0}).sort("date", -1).to_list(50)
    growth, health, survival, temp, last_date, photo = last["growth"], "Healthy", "Active", 28.2, ("2027-09-24" if demo else last["date"]), last["image"]
    if updates:
        u = updates[0]
        growth, health, survival, last_date = u["growth_pct"], u["health"], u["survival"], u["date"]
        temp = u.get("water_temp") or temp
        img = next((m["url"] for x in updates for m in x["media"] if m["kind"] == "image"), None)
        photo = img or photo
    monitoring = {
        "health": health, "growth": growth, "survival": survival, "last_monitoring": last_date,
        "water_temp": temp, "photo": photo,
        "impact": {"reef_area_cm2": 120 + int(growth) * 14, "polyps_est": 340 + int(growth) * 60, "community_hours": 6 + 2 * len(updates)},
    }
    return {"coral": coral, "adoption": adoption, "timeline": timeline, "monitoring": monitoring, "updates": updates}


@api.get("/lookup")
async def lookup(q: str):
    q = q.strip()
    if not q:
        raise HTTPException(400, "Query required")
    rx = {"$regex": f"^{re.escape(q)}$", "$options": "i"}
    docs = await db.adoptions.find({"payment_status": "paid", "$or": [{"coral_id": rx}, {"adopter_name": rx}, {"certificate_no": rx}]},
                                   {"_id": 0, "coral_id": 1, "coral_name": 1, "adopter_name": 1, "adopted_at": 1}).to_list(20)
    return docs


@api.get("/stats")
async def stats():
    paid = await db.adoptions.count_documents({"payment_status": "paid", "demo": {"$ne": True}})
    return {"corals_adopted": 1200 + paid, "restoration_sites": 12, "coastal_workers": 50,
            "research_collaborations": 18, "people_reached": 3000}


@api.get("/campaign/idol")
async def idol_campaign():
    fans = await db.adoptions.count_documents({"payment_status": "paid", "adoption_type": "idol"})
    return {"artist": "[Artist Name]", "garden": "Official Coral Garden", "adopted": 2481 + fans, "goal": 5000,
            "fandoms": [{"name": "[Fandom A]", "count": 1120}, {"name": "[Fandom B]", "count": 846}, {"name": "[Fandom C]", "count": 515 + fans}]}


@api.get("/science")
async def science():
    months = ["M0", "M3", "M6", "M9", "M12", "M15", "M18", "M21", "M24"]
    return {
        "sample": True,
        "growth": [{"m": m, "acropora": round(2 + i * 2.1, 1), "porites": round(1 + i * 0.6, 1), "pocillopora": round(1.5 + i * 1.3, 1)} for i, m in enumerate(months)],
        "survival": [{"m": m, "rate": [100, 96, 93, 91, 89, 88, 87.6, 87.4, 87.4][i]} for i, m in enumerate(months)],
        "bleaching": [{"week": f"W{w}", "sst": round(28 + 1.6 * (1 if 6 <= w <= 10 else 0) + 0.15 * (w % 4), 2), "bleached": [2, 2, 3, 3, 4, 6, 9, 12, 10, 7, 5, 4][w - 1]} for w in range(1, 13)],
        "water": [{"param": "pH", "value": 8.1, "ok": "7.9–8.3"}, {"param": "Temp °C", "value": 28.4, "ok": "26–29"},
                  {"param": "Turbidity NTU", "value": 1.2, "ok": "< 3"}, {"param": "DO mg/L", "value": 6.4, "ok": "> 5"}],
        "species": [{"name": "Acropora", "value": 42}, {"name": "Porites", "value": 18}, {"name": "Montipora", "value": 15},
                    {"name": "Pocillopora", "value": 14}, {"name": "Stylophora", "value": 11}],
        "recovery": [{"site": s["location"].split(",")[0], "before": b, "after": a} for s, b, a in zip(SITES, [12, 18, 9, 21], [38, 46, 27, 52])],
    }


@api.post("/enquiries")
async def create_enquiry(body: EnquiryCreate):
    if body.kind not in ["partner", "csr", "research", "visit", "idol", "tourism", "general"]:
        raise HTTPException(400, "Invalid enquiry type")
    enq = Enquiry(**body.model_dump())
    await db.enquiries.insert_one(enq.model_dump())
    return enq.model_dump()


# ---------- Field team auth (Emergent-managed Google Auth, allow-listed emails) ----------
ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}
SESSION_DAYS = 7


async def role_for(email: str):
    email = email.lower()
    if email in ADMIN_EMAILS:
        return "admin"
    if await db.team_members.find_one({"email": email}):
        return "field"
    return None


class SessionIn(BaseModel):
    session_id: str


@api.post("/auth/session")
async def auth_session(body: SessionIn, response: Response):
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data", headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(401, "Invalid session")
    data = r.json()
    email = data["email"].lower()
    role = await role_for(email)
    if not role:
        raise HTTPException(403, "This Google account is not on the REEFORA field team list")
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    user_id = existing["user_id"] if existing else f"user_{uuid.uuid4().hex[:12]}"
    await db.users.update_one({"email": email}, {"$set": {"user_id": user_id, "email": email, "name": data.get("name", ""), "picture": data.get("picture", "")},
                                                 "$setOnInsert": {"created_at": now_iso()}}, upsert=True)
    await db.user_sessions.insert_one({"user_id": user_id, "session_token": data["session_token"],
                                       "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS), "created_at": now_iso()})
    response.set_cookie("session_token", data["session_token"], httponly=True, secure=True, samesite="none", path="/", max_age=SESSION_DAYS * 86400)
    return {"user_id": user_id, "email": email, "name": data.get("name", ""), "picture": data.get("picture", ""), "role": role}


async def current_user(request: Request):
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization", "")
    if not token and auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    s = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not s:
        raise HTTPException(401, "Invalid session")
    exp = s["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(401, "Session expired")
    user = await db.users.find_one({"user_id": s["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    role = await role_for(user["email"])
    if not role:
        raise HTTPException(403, "Access revoked")
    user["role"] = role
    return user


async def admin_user(user=Depends(current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin only")
    return user


@api.get("/auth/me")
async def auth_me(user=Depends(current_user)):
    return user


@api.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"ok": True}


class MemberIn(BaseModel):
    email: EmailStr
    name: Optional[str] = None


@api.get("/team")
async def list_team(_=Depends(admin_user)):
    members = await db.team_members.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"admins": sorted(ADMIN_EMAILS), "members": members}


@api.post("/team")
async def add_member(body: MemberIn, user=Depends(admin_user)):
    email = body.email.lower()
    await db.team_members.update_one({"email": email}, {"$set": {"email": email, "name": body.name or ""},
                                                        "$setOnInsert": {"created_at": now_iso(), "added_by": user["email"]}}, upsert=True)
    return {"ok": True}


@api.delete("/team/{email}")
async def remove_member(email: str, _=Depends(admin_user)):
    await db.team_members.delete_one({"email": email.lower()})
    return {"ok": True}


# ---------- Object storage + monitoring updates ----------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "reefora"
storage_key = None
IMAGE_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
VIDEO_TYPES = {"video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm"}
MAX_IMAGE = 10 * 1024 * 1024
MAX_VIDEO = 50 * 1024 * 1024


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30)
    r.raise_for_status()
    storage_key = r.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str):
    r = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage(), "Content-Type": content_type}, data=data, timeout=180)
    if r.status_code == 404:
        r = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage(True), "Content-Type": content_type}, data=data, timeout=180)
    r.raise_for_status()
    return r.json()


def get_object(path: str):
    r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage()}, timeout=120)
    r.raise_for_status()
    return r.content


@app.on_event("startup")
async def startup_storage():
    try:
        await asyncio.to_thread(init_storage)
    except Exception as e:
        logging.error("Storage init failed: %s", e)


HEALTH = ["Healthy", "Monitoring", "Bleaching", "Recovering"]
SURVIVAL = ["Active", "At Risk", "Lost"]


@api.post("/monitoring")
async def create_monitoring(coral_id: str = Form(...), health: str = Form(...), survival: str = Form(...),
                            growth_pct: float = Form(...), date: str = Form(...), water_temp: Optional[float] = Form(None),
                            note: Optional[str] = Form(None), files: List[UploadFile] = File(default=[]), user=Depends(current_user)):
    if health not in HEALTH or survival not in SURVIVAL:
        raise HTTPException(400, "Invalid health or survival value")
    coral = await db.corals.find_one({"coral_id": coral_id.upper()}, {"_id": 0, "coral_id": 1})
    if not coral:
        raise HTTPException(404, "Coral not found")
    try:
        datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(400, "Invalid date")
    if len(files) > 8:
        raise HTTPException(400, "Max 8 files per update")
    media = []
    for f in files:
        ctype = (f.content_type or "").lower()
        kind = "image" if ctype in IMAGE_TYPES else "video" if ctype in VIDEO_TYPES else None
        if not kind:
            raise HTTPException(400, f"Unsupported file type: {f.filename}")
        data = await f.read()
        if len(data) > (MAX_IMAGE if kind == "image" else MAX_VIDEO):
            raise HTTPException(400, f"File too large: {f.filename}")
        ext = (IMAGE_TYPES | VIDEO_TYPES)[ctype]
        path = f"{APP_NAME}/monitoring/{coral['coral_id']}/{uuid.uuid4()}.{ext}"
        res = await asyncio.to_thread(put_object, path, data, ctype)
        await db.files.insert_one({"id": str(uuid.uuid4()), "storage_path": res["path"], "original_filename": f.filename,
                                   "content_type": ctype, "size": res.get("size", len(data)), "is_deleted": False, "created_at": now_iso()})
        media.append({"kind": kind, "url": f"/api/media/{res['path']}", "content_type": ctype})
    doc = {"id": str(uuid.uuid4()), "coral_id": coral["coral_id"], "health": health, "survival": survival,
           "growth_pct": growth_pct, "water_temp": water_temp, "date": date, "note": (note or "")[:1000],
           "media": media, "created_by": user["email"], "author": user.get("name") or user["email"],
           "is_deleted": False, "created_at": now_iso()}
    await db.monitoring.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/monitoring")
async def list_monitoring(coral_id: Optional[str] = None, user=Depends(current_user)):
    q = {"is_deleted": False}
    if coral_id:
        q["coral_id"] = coral_id.upper()
    return await db.monitoring.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.delete("/monitoring/{mid}")
async def delete_monitoring(mid: str, user=Depends(current_user)):
    doc = await db.monitoring.find_one({"id": mid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Not found")
    if user["role"] != "admin" and doc["created_by"] != user["email"]:
        raise HTTPException(403, "You can only delete your own updates")
    await db.monitoring.update_one({"id": mid}, {"$set": {"is_deleted": True}})
    return {"ok": True}


@api.get("/gallery")
async def gallery(kind: Optional[str] = None):
    docs = await db.monitoring.find({"is_deleted": False, "media.0": {"$exists": True}}, {"_id": 0, "created_by": 0}).sort("date", -1).to_list(200)
    items = []
    for d in docs:
        for m in d["media"]:
            if not kind or m["kind"] == kind:
                items.append({**m, "coral_id": d["coral_id"], "date": d["date"], "health": d["health"], "note": d["note"], "author": d["author"]})
    return items


@api.get("/media/{path:path}")
async def media(path: str, request: Request):
    rec = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "File not found")
    data = await asyncio.to_thread(get_object, path)
    size = len(data)
    headers = {"Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400"}
    rng = request.headers.get("range")
    m = re.match(r"bytes=(\d*)-(\d*)", rng or "")
    if m and (m.group(1) or m.group(2)):
        start = int(m.group(1)) if m.group(1) else max(0, size - int(m.group(2)))
        end = int(m.group(2)) if m.group(1) and m.group(2) else size - 1
        end = min(end, size - 1)
        headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        return Response(content=data[start:end + 1], status_code=206, media_type=rec["content_type"], headers=headers)
    return Response(content=data, media_type=rec["content_type"], headers=headers)


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
