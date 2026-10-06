from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
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


@api.post("/adoptions/{adoption_id}/confirm")
async def confirm_adoption(adoption_id: str):
    adoption = await db.adoptions.find_one({"id": adoption_id}, {"_id": 0})
    if not adoption:
        raise HTTPException(404, "Adoption not found")
    if adoption["payment_status"] == "paid":
        return adoption
    res = await db.corals.update_one({"coral_id": adoption["coral_id"], "adoption_status": "available"},
                                     {"$set": {"adoption_status": "adopted"}})
    if res.modified_count == 0:
        raise HTTPException(409, "This coral was just adopted by someone else")
    count = await db.adoptions.count_documents({"payment_status": "paid"})
    update = {"payment_status": "paid", "adopted_at": now_iso(),
              "certificate_no": f"REEF-{datetime.now(timezone.utc).year}-{count + 1:06d}"}
    await db.adoptions.update_one({"id": adoption_id}, {"$set": update})
    adoption.update(update)
    return adoption


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
    monitoring = {
        "health": "Healthy", "growth": last["growth"], "survival": "Active",
        "last_monitoring": "2027-09-24" if demo else last["date"],
        "water_temp": 28.2, "photo": last["image"],
        "impact": {"reef_area_cm2": 120 + last["growth"] * 14, "polyps_est": 340 + last["growth"] * 60, "community_hours": 6},
    }
    return {"coral": coral, "adoption": adoption, "timeline": timeline, "monitoring": monitoring}


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
