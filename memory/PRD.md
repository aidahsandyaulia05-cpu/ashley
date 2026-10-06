# REEFORA — PRD

## Original problem statement
Build a premium, immersive, interactive website for REEFORA, an Indonesian coral reef restoration and conservation platform centred on CORAL ADOPTION: Discover a Coral → Adopt → Certificate → QR Code → Track Growth → See Impact. Coral is the hero (not marine animals). Taglines "Adopt a Coral. Restore a Reef." / "Restoring Reefs, Reviving Life." Sections: cinematic hero w/ parallax, 3D coral experience, Choose Your Coral w/ filters, adoption types (Individual, Corporate CSR, Idol/Artist/Creator, Tourism Partner), online adoption flow (coral, package, name, info, payment placeholder, Coral ID, certificate, QR, My Coral), on-site adoption, My Coral dashboard + growth timeline, QR coral profile, Coral for Business (CSR/ESG + dashboard), IDOL × REEF campaign, coastal community, Science dashboard (sample data), Visit the Reef, Impact counters, Certificate, Stories, Get Involved, nav, mobile responsive. (Full brief in conversation; mockups attached.)

User choices: simulated QRIS payment demo (no real money); no accounts — QR opens coral profile, lookup by adopter name; bilingual EN/ID; stock + generated coral imagery; enquiries saved to DB.

## Architecture
- FastAPI + MongoDB (`corals`, `adoptions`, `enquiries`); seeds 24 corals + demo adoption RF-02481 "Lumi" by Aidah.
- React (CRA) + Tailwind + framer-motion + three.js (vanilla, OrbitControls) + recharts + qrcode.react. i18n via `useLang().L(en,id)`.
- Routes: /, /adopt, /adopt/:coralId, /certificate/:adoptionId, /coral/:coralId, /my-coral, /business, /idol, /science, /visit, /about.

## Implemented (2026-10-06)
- All pages/sections above; 3D nursery with hover/click species, growth stages, low-power mobile fallback.
- Adoption wizard with packages, extra donation (one-time/monthly), SIMULATED QRIS, certificate (print/PDF, share, QR PNG download), coral profile w/ timeline, My Coral lookup.
- Enquiry forms (CSR, partner, research, visit, idol, tourism) stored in DB.
- Tested: backend 34/34, frontend core flows pass.

## Placeholders
QRIS merchant: [Account Holder Name], [Bank Name], [NMID]; package prices (Rp150k/350k/750k); [Artist Name], [Fandom A/B/C]; corporate dashboard & science data are SAMPLE; monitoring photos are representative placeholders.

## Backlog
- P0: real QRIS gateway (e.g. Midtrans/Xendit) when user is ready
- P1: admin panel to upload monitoring photos & update coral health; email certificate (Resend)
- P2: real Indonesia map, campaign-specific pages per artist, full story articles
