# BusiBldr - Food Business Financial Planner

## Product Requirements Document (PRD) — v2.0

**Last Updated:** February 10, 2026

---

## 1. Overview

**Product Name:** BusiBldr
**Target Users:** Entrepreneurs and small business owners starting or running bakeries, restaurants, cafes, cloud kitchens, and food trucks.
**Core Problem:** Most food-business founders lack financial literacy to understand whether their cost structure is healthy. They don't know if their rent is too high, if they're overstaffing, or if their ingredient costs are eating into margins — until it's too late.
**Solution:** An interactive financial planning tool with a built-in AI advisor that ingests business inputs, visualizes financial health, benchmarks against industry standards, and provides actionable recommendations.

**Live URL:** https://busi-production.up.railway.app

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Help founders understand financial viability before/during operations | User completes full form and receives actionable insights |
| Surface hidden cost problems early | System flags at least one issue per typical input set |
| Make financial planning accessible (no MBA required) | Users can complete the flow without external help |

---

## 3. User Personas

### Persona 1: First-time Bakery Owner
- Has a passion for baking, limited business experience
- Signed a lease, now wondering if the rent is sustainable
- Needs plain-language guidance, not spreadsheets

### Persona 2: Existing Restaurant Operator
- Running for 1-2 years, margins feel tight but can't pinpoint why
- Wants to compare their numbers against benchmarks
- Needs specific recommendations (cut staff? raise prices? renegotiate rent?)

### Persona 3: Investor / Advisor
- Evaluating a food-business pitch
- Wants a quick sanity check on the founder's cost structure

---

## 4. Tech Stack (Implemented)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack, standalone output) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma 6.19 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Charts | Recharts 3.7 |
| Forms | React Hook Form 7 + Zod 4 |
| State | Zustand 5 |
| AI Chat | Vercel AI SDK v6 + Groq (Llama 3.3 70B, free tier) |
| Auth | bcryptjs + jsonwebtoken (JWT, 7-day expiry) |
| Hosting | Railway (Docker + PostgreSQL) |
| Repo | github.com/rajeevamaha/busi |

---

## 5. Application Layout

### Desktop (3-Panel)
```
+----------------------------------------------------------+
|  Header: BusiBldr  |  Plan Name  |  Save Status  | User  |
+----------+---------+-------------+---------+------+------+
| Tabs: Business Plan | Baker's Ratio | Recipes | Resources |
+----------+---------+-------------------+------------------+
|                     |                   |                  |
|  FORM PANEL (380px) | DASHBOARD (flex)  | AI CHAT (360px)  |
|                     |                   |                  |
|  Sections A-H       | Health Score +    | Streaming chat   |
|  Accordion layout   | Insights Carousel | with Llama 3.3   |
|  Auto-save (2s)     | Cost Donut Chart  |                  |
|  Real-time calc     | P&L Table         |                  |
|                     | Benchmark Grid    |                  |
|                     | Break-Even Bar    |                  |
|                     | Owner's Draw Card |                  |
|                     | What-If Sliders   |                  |
+---------------------+-------------------+------------------+
```

### Mobile
- Tab-based panel switching (Form / Dashboard / Chat)
- Full-width single panel at a time

---

## 6. Feature Specification — IMPLEMENTED

### 6.1 Input Form (8 Sections)

#### Section A: Business Basics
| Field | Type | Notes |
|-------|------|-------|
| Business Name | Text | Optional |
| Business Type | Dropdown | Bakery, Restaurant, Cafe, Cloud Kitchen, Food Truck |
| Team Size | Dropdown | "Just me", "Family (2)", "Small team (3-5)", "Team (6+)" |
| City / Location | Text | |
| Floor Area (sq ft) | Number | For Revenue per Sq Ft |
| Seating Capacity | Number | 0 for takeaway-only |
| Operating Days per Month | Number | Default: 26 |
| Operating Hours per Day | Number | Default: 10 |

**Adaptive Logic:** Team Size controls whether Section E (Labor) or Section E-Alt (Owner's Draw) renders.

#### Section B: Revenue & Demand
**Two pricing modes** (toggle):

**Manual Mode:**
| Field | Type |
|-------|------|
| Average Selling Price / Item | Currency |
| Average Order Value (AOV) | Currency |

**Itemized Mode (new):**
| Field | Type |
|-------|------|
| Menu Item Name | Text (per item) |
| Category | Dropdown: Appetizer, Entree, Bread, Cake, Pastry, Cookie, Beverage, Side, Dessert, Other |
| Price | Currency (per item) |
| Avg Qty per Order | Number (per item) |

When using itemized mode, ASP and AOV are **auto-calculated**:
- ASP = average of all item prices
- AOV = sum of (price x avg qty per order)

**Common fields (both modes):**
| Field | Type |
|-------|------|
| Orders per Day | Number |
| Units Produced per Day | Number |
| Units Sold per Day | Number |
| Items Listed on Menu | Number (auto in itemized mode) |
| Revenue Month -1 | Currency (optional) |
| Revenue Month -2 | Currency (optional) |

**Calculated:** Monthly Revenue, Total Revenue, Demand Fulfillment Rate

#### Section C: Rent & Fixed Costs
| Field | Type |
|-------|------|
| Monthly Rent | Currency |
| Security Deposit | Currency (one-time) |
| Utilities | Currency (monthly) |
| Maintenance / CAM | Currency (monthly) |

**Calculated:** Total Occupancy Cost, Rent % of Revenue, Fixed Cost Ratio

#### Section D: Cost of Goods Sold (COGS)
| Field | Type |
|-------|------|
| Ingredient Cost per Unit | Currency |
| Packaging Cost per Unit | Currency |
| Wastage Estimate (%) | Percentage (default 5%) |

**Calculated (all auto):**
| Metric | Formula |
|--------|---------|
| Monthly Raw Material Cost | Ingredient cost x monthly units |
| Monthly Packaging Cost | Packaging cost x monthly units |
| COGS per Unit | Ingredient + packaging per unit |
| Total COGS | Materials + packaging + wastage |
| COGS % of Revenue | Total COGS / revenue |
| Wastage Cost | Wastage % x ingredient cost |
| Food Cost % | (Purchases) / Sales |
| **Prime Cost** | **Food Cost + Labor Cost** |
| **Prime Cost % of Revenue** | **Flags critical if > 50%** |

#### Section E: Labor & Staffing (teams of 3+)
| Field | Type |
|-------|------|
| Number of Employees | Number |
| Average Hourly Rate | Currency |
| Avg Hours per Employee/Month | Number |
| Total Monthly Salaries | Currency (auto or override) |
| Benefits / Insurance | Currency |
| Max Output per Staff Hour | Number |

**Calculated:** Total Labor Cost, Labor %, Revenue per Labor Hour, Capacity Utilization

#### Section E-Alt: Owner's Draw (solo/family)
| Field | Type |
|-------|------|
| Target Monthly Draw | Currency |
| Reinvestment % | Percentage (default 25%) |

**Calculated:** Sustainable Draw, Draw Budget, Reinvestment Reserve, Draw % of Revenue

#### Section F: Marketing & Customer Acquisition
| Field | Type |
|-------|------|
| Monthly Marketing Spend | Currency |
| Platform Commissions | Currency |
| Revenue Attributed to Marketing | Currency (optional) |

**Calculated:** Marketing % of Revenue, Marketing ROI

#### Section G: Other Operating Expenses
| Field | Type |
|-------|------|
| Licenses & Permits | Currency |
| Insurance | Currency |
| Technology / POS / Software | Currency |
| Loan EMI / Interest | Currency |
| Miscellaneous | Currency |

#### Section H: Investment & Capital
| Field | Type |
|-------|------|
| Total Initial Investment | Currency |
| Funding Source | Dropdown: Self-funded, Loan, Investor, Mixed |
| Loan Amount | Currency (conditional) |
| Interest Rate | Percentage (conditional) |

**Calculated:** Payback Period

---

### 6.2 Dashboard

| Widget | Description |
|--------|-------------|
| **Health Score Gauge** | Circular SVG gauge 0-100. Green (75+), Yellow (50-74), Red (<50). Weighted composite adapts for solo vs team. |
| **Insights Carousel** | Auto-detected issues from rule engine + compound rules. Carousel next to health gauge. Severity-coded badges. |
| **Cost Donut Chart** | Recharts pie showing COGS, Labor, Rent, Marketing, Other. Legend shows percentages. |
| **P&L Table** | Full profit & loss: Revenue → COGS → Gross Profit → Expenses → Net Profit. Amount + % columns. |
| **Benchmark Grid** | Cards comparing Rent%, COGS%, Labor%, Marketing%, Total OpEx% against industry thresholds. Color-coded severity. |
| **Break-Even Bar** | Current revenue vs break-even point. Margin of Safety percentage. |
| **Owner's Draw Card** | Solo/family only. Sustainable draw, target progress, reinvestment reserve, emergency runway. |
| **What-If Scenario Sliders** | Price (±30%), Volume (±30-50%), COGS (±30%), Labor (±30%), Rent (±$2000). **"Reset to Original" button** always visible. |

---

### 6.3 AI Advisor (Chat Panel)

**Provider:** Groq (Llama 3.3 70B) — free tier, 30 RPM
**Interface:** Streaming chat via Vercel AI SDK v6

**How it works:**
1. System prompt is dynamically built with full business context (all form data, metrics, alerts, insights)
2. User messages are converted from UIMessage (parts-based) to CoreMessage (content-based) for streamText
3. Model router detects complex queries (what-if, scenario, deep analysis) — currently both routes use same model
4. Responses stream in real-time
5. Messages saved to database asynchronously

**Rule Engine (zero AI cost):**
- Single-threshold alerts: Rent%, COGS%, Labor%, Marketing%, Capacity, Wastage, Margin of Safety
- Compound insights: scheduling problems, pricing opportunities, runway warnings, lease negotiation, upsell opportunities
- Displayed in Insights Carousel on dashboard

**Rate Limiting:** FREE tier = limited messages, PAID = unlimited

---

### 6.4 Baker's Ratio Calculator (Tab 2)

Interactive calculator for scaling baking recipes by weight.

| Feature | Description |
|---------|-------------|
| Ingredient list | Default: Flour, Water, Sugar, Butter, Eggs, Salt, Yeast |
| Baker's percentage | Auto-calculated: (weight / flour weight) x 100 |
| Add/remove ingredients | Dynamic list management |
| Summary | Total weight, flour weight, hydration % |
| Reference table | Common ratios for White Bread, Pizza, Croissant, Pound Cake, Cookie, Brioche |

---

### 6.5 Recipe Builder (Tab 3)

Card-based recipe management system.

| Feature | Description |
|---------|-------------|
| Card grid | Recipes displayed as cards with category badge, name, yield, time, temperature, ingredient count |
| Add recipe | Dialog with all baking fields |
| Edit recipe | Pre-populated dialog |
| Delete recipe | Available from card hover or detail view |
| View detail | Full recipe view in dialog |
| Storage | localStorage per plan (keyed by planId) |

**Recipe fields:**
- Name, Category (bread/cake/pastry/cookie/pie/other)
- Yield amount + unit (pieces/loaves/servings/dozen/slices)
- Prep time, Bake time (minutes)
- Temperature + unit (F/C)
- Ingredients list (name, quantity, unit: g/kg/oz/lb/ml/L/cup/tbsp/tsp/pcs)
- Instructions (freeform text)
- Notes (freeform text)

---

### 6.6 Resources (Tab 4)

Placeholder — "Coming Soon"

---

### 6.7 Authentication & Plans

| Feature | Details |
|---------|---------|
| Signup | Email + password, bcrypt hashing, JWT token |
| Login | Email + password verification, JWT |
| Session | JWT stored in localStorage, 7-day expiry |
| Plans | CRUD API. FREE: 1 plan, PAID: unlimited |
| Auto-save | Zustand → 2s debounce → API PUT |
| Plan loading | Fetches from DB, merges with defaults for forward compatibility |

---

## 7. Data Flow

```
User types in form
  → React Hook Form validates
  → 300ms debounce → Zustand store
  → calculateMetrics() (pure function, <5ms)
  → runRules() + runCompoundRules()
  → Dashboard re-renders (via selectors)
  → Insights Carousel updates
  → 2s debounce → auto-save to /api/plans/[id] → PostgreSQL
```

---

## 8. Calculation Engine

### Metric Categories (50+ formulas)

1. **Revenue:** Monthly revenue, AOV, demand fulfillment rate, sell-out rate
2. **Costs:** COGS, labor, rent, marketing, total operating costs, food cost %, prime cost
3. **Profitability:** Gross profit, gross margin, net profit, net margin
4. **Break-Even:** Contribution margin, break-even units/revenue, margin of safety
5. **Growth:** Capacity ceiling, growth headroom, revenue per sq ft, marketing ROI
6. **Trends:** 3-month revenue trend, burn rate, payback period
7. **Owner's Draw:** Sustainable draw, reinvestment reserve, emergency runway (solo only)
8. **Health Score:** Weighted composite 0-100, adapts for solo vs team

### Benchmark Thresholds

| Category | Healthy | Warning | Critical |
|----------|---------|---------|----------|
| Rent / Occupancy | 5-15% | > 15% | > 20% |
| COGS (Food Cost) | 25-35% | > 35% | > 42% |
| Labor | 20-30% | > 30% | > 38% |
| Marketing | 3-8% | > 10% | > 15% |
| Total Operating Cost | 70-85% | > 85% | > 92% |
| Net Profit Margin | 10-20% | < 10% | < 5% |
| Wastage | 2-5% | > 5% | > 10% |
| Capacity Utilization | 70-90% | < 60% | < 40% |
| Margin of Safety | > 25% | 10-25% | < 10% |
| **Prime Cost** | **< 45%** | **45-50%** | **> 50%** |
| **Food Cost %** | **< 33%** | **33-40%** | **> 40%** |

---

## 9. Database Schema (Prisma)

| Model | Key Fields |
|-------|------------|
| **User** | id, email, passwordHash, planTier (FREE/PAID), createdAt |
| **BusinessPlan** | id, userId, name, formData (JSONB), createdAt, updatedAt |
| **ChatMessage** | id, planId, role, content, modelUsed, createdAt |
| **Benchmark** | category, businessType, healthyMin/Max, warningThreshold, criticalThreshold |

---

## 10. Deployment

| Component | Details |
|-----------|---------|
| **Docker** | Multi-stage build: deps → builder → prisma-cli → runner. Alpine + standalone output. |
| **Railway** | Dockerfile builder. Auto-deploy from GitHub (main branch). |
| **Start script** | `start.sh` runs `prisma migrate deploy` then `node server.js` |
| **Health check** | Path: `/`, 5-minute retry window |
| **Environment** | DATABASE_URL, JWT_SECRET, GROQ_API_KEY |

---

## 11. Compound Insight Rules (Implemented)

| Signal Combination | Insight |
|--------------------|---------|
| High labor % + Low capacity utilization | "Scheduling problem, not hiring problem" |
| High COGS % + High sell-out rate | "Raise prices — demand is strong" |
| Low margin of safety + Declining revenue | "2-3 month runway warning" |
| High rent % + High revenue per sq ft | "Negotiate longer lease at locked rate" |
| Low AOV + High order volume | "Add combos, upsells, premium options" |
| High total opex + Healthy gross margin | "Overhead problem, not pricing problem" |
| Solo + Can't sustain draw | "Focus on break-even before taking income" |

---

## 12. MVP Checklist — Phase 1

**Completed:**
- [x] User accounts (email/password signup, JWT auth)
- [x] Input form with all sections (A through H), USD currency
- [x] Adaptive form (solo/family vs team)
- [x] Itemized pricing mode (add individual menu items)
- [x] Save / load business plans
- [x] Real-time P&L calculation and display
- [x] Cost breakdown donut chart with percentages
- [x] Benchmark comparison grid with severity indicators
- [x] Health score gauge (0-100, weighted composite)
- [x] Insights carousel (auto-detected issues)
- [x] AI chat panel with streaming responses (Groq / Llama 3.3)
- [x] Rule engine (single-threshold + compound insights)
- [x] Break-even analysis
- [x] What-if scenario sliders with "Reset to Original"
- [x] Owner's Draw card (solo/family)
- [x] Food Cost % and Prime Cost calculations
- [x] Baker's Ratio Calculator tab
- [x] Recipe Builder tab (CRUD with all baking fields)
- [x] Auto-save (2s debounce to API)
- [x] Mobile-responsive layout
- [x] Railway deployment (Docker + PostgreSQL, auto-deploy from GitHub)

**Not Yet Implemented:**
- [ ] Resources tab content
- [ ] PDF/Excel export of business plan
- [ ] OAuth (Google login)
- [ ] Stripe payment for paid tier
- [ ] Recipe cloud sync (currently localStorage)
- [ ] Multi-location comparison
- [ ] Historical trend tracking with charts
- [ ] Inventory management module
- [ ] Integration with accounting software

---

## 13. Design Principles

1. **Plain Language Over Jargon** — Say "ingredient cost" not "COGS" in the UI (show technical terms as tooltips)
2. **Progressive Disclosure** — Don't overwhelm; reveal sections as the user progresses
3. **Immediate Feedback** — Every input visibly affects the dashboard and triggers insights
4. **Actionable Over Informational** — Don't just say "rent is high"; say what to do about it
5. **Honest, Not Alarming** — Flag problems clearly but frame them as solvable, not catastrophic
