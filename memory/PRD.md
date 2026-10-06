# REEFORA — PRD

## Original problem statement
Build a premium, immersive, interactive website for REEFORA, an Indonesian coral reef restoration and conservation platform centred on CORAL ADOPTION: Discover a Coral → Adopt → Certificate → QR Code → Track Growth → See Impact. Coral is the hero (not marine animals). Taglines "Adopt a Coral. Restore a Reef." / "Restoring Reefs, Reviving Life." Sections: cinematic hero, 3D coral experience, Choose Your Coral w/ filters, adoption types, online + on-site adoption, My Coral dashboard, QR coral profile, Coral for Business, IDOL × REEF, coastal community, Science dashboard, Visit the Reef, Impact, Certificate, Stories, Get Involved, nav, mobile.

Follow-up (iteration 2): "Live QRIS Payments: connect a real QRIS payment provider (ShopeePay and bank)" and "Monitoring Updates: let your field team upload new coral photos and health checks that appear instantly on each adopter's QR page" — field team signs in with Google; uploaded coral images/short videos also shown in a separate menu; add Instagram link (@reefora).

## Architecture
- FastAPI + MongoDB (corals, adoptions, enquiries, users, user_sessions, team_members, monitoring, files)
- Payments: Midtrans Snap (QRIS, ShopeePay, bank VAs) via MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY / MIDTRANS_IS_PRODUCTION; webhook /api/payments/notification (SHA512 signature); status polling; demo simulation only when keys are empty
- Auth: Emergent Google Auth; access only for ADMIN_EMAILS (aidahsandyaulia05@gmail.com) + admin-managed team_members
- Media: Emergent object storage, served via /api/media/{path} (Range support)
- React + Tailwind + framer-motion + three.js + recharts + qrcode.react; EN/ID i18n

## Implemented
- 2026-10-06: Full site MVP (all sections/pages, 3D nursery, adoption wizard, certificate + QR, coral profile, My Coral lookup, CSR/Idol/Science/Visit/About, enquiries)
- 2026-10-06: Midtrans integration (demo fallback w/ QRIS / ShopeePay / Bank VA selector), /field console (Google login, monitoring updates w/ photos+videos, admin team allow-list), field updates on coral QR page, /gallery menu, Instagram @reefora links

## Placeholders
QRIS merchant [Account Holder Name]/[Bank Name]/[NMID]; package prices; [Artist Name]/[Fandom]; sample science/corporate data.

## Backlog
- P0: add Midtrans keys + set Payment Notification URL to {domain}/api/payments/notification
- P1: email certificate to adopter on payment; notify adopters on new field updates
- P2: real Indonesia map, per-artist campaign pages, full story articles
