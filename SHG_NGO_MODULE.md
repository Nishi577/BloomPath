# BloomPath – SHG-NGO Integrated Livelihood Enhancement Module

## Overview
This module adds a complete livelihood infrastructure to BloomPath, enabling Self-Help Groups (SHGs) and NGOs to work directly within the platform alongside regular employers.

---

## 🆕 New Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/shg-portal` | SHGPortal | Browse & apply for SHG microjobs; SHGs register & post jobs |
| `/ngo-portal` | NGOPortal | NGO training modules; users enroll & complete training |
| `/bulk-orders` | CompanyBulkOrders | Companies place bulk orders matched to verified SHGs |

---

## 🧠 ML Decision Layer (`src/lib/mlDecisionLayer.ts`)

Classifies each user in real-time into one of 3 categories:

### Classification Logic

| Classification | Trigger Conditions | Action |
|---|---|---|
| **Job Ready** | High skill score (5+ skills), verified, 50+ total ML score | Show regular job recommendations |
| **Needs Training** | No skills, not verified, <20 total score | Route to NGO training modules |
| **SHG Suitable** | Has craft skills (Tailoring/Embroidery/etc.) OR high family constraints OR moderate score with home constraints | Show SHG community microjobs |

### Score Breakdown (0–100)
- **Skill Score (0–40):** Number & type of skills (digital skills = bonus)
- **Readiness Score (0–30):** Verification status + education level + has location
- **Constraint Score (0–20):** Family constraints + available hours per day
- **Training Score (0–10):** NGO modules completed + total skill_score_boost

---

## 🏠 SHG Job Provider System

### Margin Model
```
Company pays → piece_rate (e.g., ₹120/piece)
SHG keeps   → margin (e.g., 15% = ₹18)
Woman earns → woman_rate = piece_rate × (1 - margin%) = ₹102/piece
```

### Flow
1. SHG registers with registration number
2. Admin verifies SHG
3. SHG posts microjobs (stitching, packaging, crafts, etc.)
4. Women apply → SHG approves → work begins
5. Woman uploads proof of completion
6. SHG approves → payment released

### Microjob Categories
- Stitching & Tailoring
- Packaging & Assembly
- Craftwork & Handicrafts
- Food Processing
- Embroidery & Needlework
- Candle & Soap Making
- Incense Making, Paper Products, Jute Products, Pottery & Terracotta

---

## 📚 NGO Training System

### Skill Score Integration
- Completing a module adds `skill_score_boost` points to user's profile
- Score boost updates ML classification in real-time
- Low-skill users auto-routed to training first

### Certificate Flow
1. User enrolls in verified NGO module (free)
2. User completes lessons (progress tracked)
3. Score reaches 100% → certificate generated
4. Skill score updated → better job recommendations unlocked

---

## 🏢 Company Bulk Order Flow

1. Company submits bulk order (product category, quantity, price, deadline)
2. BloomPath admin matches order with best-fit verified SHG
3. SHG accepts → distributes work to women network
4. Work completed → quality checked → delivered
5. Company pays → SHG distributes earnings

---

## 🗄️ Database (New Tables)

```
shg_profiles          - SHG registration & verification
microjobs             - Home-based jobs posted by SHGs
microjob_applications - Women applying for microjobs
ngo_profiles          - NGO registration & verification  
training_modules      - NGO-uploaded training content
training_enrollments  - User course progress & completion
bulk_orders           - Company ↔ SHG bulk production orders
ml_assessments        - Cached ML classification results
```

New columns added to `profiles`:
- `skill_score_boost` - Total points from NGO training
- `total_trainings_completed` - Count of completed modules
- `ml_classification` - Latest ML classification
- `shg_member` / `ngo_member` - Membership flags

---

## 🔒 Admin Controls (`/admin-portal` → SHG/NGO tab)

- Verify/reject SHG registrations
- Verify/reject NGO registrations
- Review & approve training modules
- View and manage bulk orders
- Monitor SHG ↔ company order assignments

---

## ♻️ Preserved Existing Features

All existing BloomPath flows are 100% preserved:
- ✅ Job browsing & ML recommendations
- ✅ User verification (Aadhar)
- ✅ Skills management & proof upload
- ✅ Work logs & earnings
- ✅ Employer portal
- ✅ Admin portal (with new SHG/NGO tab added)
- ✅ Community & counsellor
- ✅ Voice assistant
