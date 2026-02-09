# BusiBldr - Restaurant & Bakery Business Planner

## Product Requirements Document (PRD)

---

## 1. Overview

**Product Name:** BusiBldr
**Target Users:** Entrepreneurs and small business owners starting or running bakeries, restaurants, cafes, and food-service businesses.
**Core Problem:** Most food-business founders lack financial literacy to understand whether their cost structure is healthy. They don't know if their rent is too high, if they're overstaffing, or if their ingredient costs are eating into margins — until it's too late.
**Solution:** An interactive financial planning tool with a built-in AI advisor that ingests business inputs, visualizes financial health, benchmarks against industry standards, and provides actionable recommendations.

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

## 4. Application Layout

```
+----------------------------------------------------------+
|  Header / Branding: BusiBldr                              |
+-----------------------------+----------------------------+
|                             |                            |
|   INPUT PANEL (Left)        |   AI ADVISOR PANEL (Right) |
|                             |                            |
|   - Business Info Form      |   - Chat Interface         |
|   - Section-by-section      |   - AI reads form data     |
|     financial inputs        |   - Proactive insights     |
|   - Real-time validation    |   - Follow-up Q&A          |
|                             |                            |
+-----------------------------+----------------------------+
|                                                          |
|   DASHBOARD (Below / Expandable)                         |
|   - Visual financial breakdown (charts, gauges, cards)   |
|   - Benchmark comparisons                                |
|   - Scenario modeling                                    |
|                                                          |
+----------------------------------------------------------+
```

---

## 5. Feature Specification

### 5.1 Input Panel (Left Side)

A multi-section form where the user enters their business financials. Each section expands/collapses. Inputs auto-save and update the dashboard and AI panel in real time.

#### Section A: Business Basics
| Field | Type | Notes |
|-------|------|-------|
| Business Name | Text | Optional |
| Business Type | Dropdown | Bakery, Restaurant, Cafe, Cloud Kitchen, Food Truck |
| Team Size | Dropdown | "Just me", "Family (2)", "Small team (3-5)", "Team (6+)" |
| City / Location | Text / Dropdown | Used for regional benchmarking |
| Floor Area (sq ft) | Number | For Revenue per Sq Ft calculation |
| Seating Capacity | Number | 0 for takeaway-only |
| Operating Days per Month | Number | Default: 26 |
| Operating Hours per Day | Number | |

**Adaptive Form Logic:**
- If Team Size = "Just me" or "Family (2)":
  - **Section E (Labor & Staffing) is hidden entirely.** Labor cost = $0.
  - **Section E-alt (Owner's Draw) appears instead** with fields: Target Monthly Draw (what the owner wants to earn), Reinvestment % (default 25%).
  - Health score replaces Labor weight with Owner Draw Sustainability.
  - AI focuses on owner workload, capacity ceiling, and "when can you pay yourself" guidance.
- If Team Size = "Small team (3-5)" or "Team (6+)" → Section E shows in full with all labor metrics. Owner's Draw section is hidden (owner salary is part of labor cost).

#### Section B: Revenue & Demand
| Field | Type | Notes |
|-------|------|-------|
| Average Selling Price per Item | Currency | Used for contribution margin calc |
| Average Order Value (AOV) | Currency | Total Revenue / Total Orders |
| Orders per Day | Number | |
| Units Produced per Day | Number | For demand fulfillment rate |
| Units Sold per Day | Number | For sell-out rate |
| Items Listed on Menu | Number | For sell-out rate |
| Monthly Revenue (calculated) | Display | AOV x Orders/Day x Operating Days |
| Revenue Month -1 (optional) | Currency | For 3-month trend calculation |
| Revenue Month -2 (optional) | Currency | For 3-month trend calculation |
| Additional Revenue Streams | Multi-entry | Catering, delivery commissions, merchandise |

#### Section C: Rent & Fixed Costs
| Field | Type | Notes |
|-------|------|-------|
| Monthly Rent | Currency | |
| Security Deposit | Currency | One-time |
| Utilities (Electric, Water, Gas) | Currency | Monthly |
| Maintenance / CAM Charges | Currency | Monthly |
| **Total Occupancy Cost** | Display | Sum of above |
| **Rent % of Revenue** | Display + Indicator | Flag if > 15% |
| **Fixed Cost Ratio** | Display | All Fixed Costs / Revenue — risk exposure metric |

#### Section D: Cost of Goods Sold (COGS)
| Field | Type | Notes |
|-------|------|-------|
| Ingredient Cost per Unit | Currency | For COGS per unit calc |
| Packaging Cost per Unit | Currency | For COGS per unit calc |
| Monthly Raw Material / Ingredient Cost | Currency | Total monthly |
| Packaging Cost (monthly) | Currency | Total monthly |
| Wastage Estimate (%) | Percentage | Default: 5% |
| **COGS per Unit** | Display | Ingredient + Packaging per unit |
| **Total COGS** | Display | Materials + Packaging + Wastage |
| **COGS % of Revenue** | Display + Indicator | Flag if > 35% |
| **Wastage Cost** | Display | Wastage % x Ingredient Cost — hidden profit drain |

#### Section E: Labor & Staffing
| Field | Type | Notes |
|-------|------|-------|
| Number of Employees | Number | |
| Average Hourly Rate | Currency | For labor hour calculations |
| Average Hours per Employee per Month | Number | |
| Total Monthly Salaries | Currency | Auto-calc or manual override |
| Benefits / Insurance | Currency | |
| Max Output per Staff Hour (units) | Number | For capacity utilization |
| **Total Labor Cost** | Display | |
| **Labor % of Revenue** | Display + Indicator | Flag if > 30% |
| **Revenue per Labor Hour** | Display | Revenue / Total Labor Hours — productivity score |
| **Capacity Utilization** | Display | Actual Output / Max Output |

#### Section F: Marketing & Customer Acquisition
| Field | Type | Notes |
|-------|------|-------|
| Monthly Marketing Spend | Currency | |
| Platform Commissions (DoorDash/UberEats/Grubhub) | Currency | |
| Revenue Attributed to Marketing (optional) | Currency | For marketing ROI calc |
| **Marketing as % of Revenue** | Display + Indicator | Flag if > 10% |
| **Marketing ROI** | Display | (Revenue Gain - Marketing Spend) / Spend |

#### Section G: Other Operating Expenses
| Field | Type | Notes |
|-------|------|-------|
| Licenses & Permits | Currency | Amortized monthly |
| Insurance | Currency | |
| Technology / POS / Software | Currency | |
| Loan EMI / Interest | Currency | |
| Miscellaneous | Currency | |

#### Section H: Investment & Capital
| Field | Type | Notes |
|-------|------|-------|
| Total Initial Investment | Currency | For payback period calc |
| Funding Source | Dropdown | Self-funded, Loan, Investor, Mixed |
| Loan Amount (if applicable) | Currency | |
| Interest Rate | Percentage | |

---

### 5.2 AI Advisor Panel (Right Side)

A conversational AI interface that acts as a virtual business advisor.

#### Behavior
- **Proactive Analysis:** As the user fills the form, the AI generates insights without being asked. It watches for threshold breaches and immediately surfaces them.
- **Contextual Chat:** The user can ask follow-up questions like "How do I reduce my food cost?" or "Is my rent too high for this city?"
- **Recommendations with Reasoning:** Every suggestion includes *why* it matters and *what happens* if ignored.

#### Trigger-Based Insights (Examples)

**Single-Threshold Triggers:**

| Trigger Condition | AI Response |
|-------------------|-------------|
| Rent > 15% of revenue | "Your rent is consuming {X}% of revenue. The healthy range is 8-15%. This squeezes profit by ~${Y}/month. Consider: (1) negotiating rent down, (2) increasing revenue per sq ft via higher AOV, (3) evaluating if this location's traffic justifies the premium." |
| COGS > 35% of revenue | "Ingredient cost is {X}% of revenue — healthy range is 25-35%. Options: (1) Renegotiate supplier rates or buy in bulk, (2) Reduce menu complexity to lower waste, (3) Raise selling price by ${suggested_amount} to bring COGS to {target}%." |
| Labor > 30% of revenue | "Employee costs at {X}% are above the 20-30% range. Consider: (1) Cross-training staff, (2) Part-time staff during off-peak, (3) Automation (self-ordering kiosks, prep equipment)." |
| Sell-out rate consistently high | "You're selling out regularly — demand exceeds supply. This is a growth signal: raise prices or produce more." |
| Margin of Safety < 10% | "You're only {X}% above break-even. One bad month could mean a loss. Prioritize building a larger cushion." |
| Burn rate active (losing money) | "At current losses of ${X}/month, you have approximately {Y} months of runway. Immediate cost reduction needed." |
| Wastage > 5% | "Wastage at {X}% = ${amount}/month in lost ingredients. Try: demand forecasting, smaller batches, repurposing day-old items." |

**Compound Insight Triggers (what makes BusiBldr smart):**

| Compound Signal | AI Response |
|-----------------|-------------|
| High labor % + Low capacity utilization | "This is a scheduling problem, not a hiring problem. Restructure shifts before cutting staff." |
| High COGS % + High sell-out rate | "Ingredients cost too much but demand is strong. Raise prices — customers are already buying everything you make." |
| Low margin of safety + Negative trend | "Your cushion is thin and revenue is declining. This is a 2-3 month runway warning." |
| High rent % + High revenue/sq ft | "Rent is high but you're maximizing the space. Negotiate a longer lease at a locked rate instead of moving." |
| Low AOV + High order volume | "You have traffic but low ticket size. Add combos, upsells, or premium menu options." |

#### Chat Capabilities
- Answer questions about any metric on the dashboard
- Explain financial terms in plain language ("What is COGS?")
- Run what-if scenarios ("What if I raise prices by 10%?")
- Compare user's numbers against industry benchmarks
- Suggest prioritized action items (fix highest-impact issue first)

---

### 5.3 Dashboard — Metrics & Visual Financial Breakdown

Generated dynamically as the user fills the form. The dashboard is organized into 7 metric categories. The key design principle: **show the right 5 numbers first, explain why they're bad, tell what to do next.**

---

#### Category 1: Core Revenue & Demand Metrics (Reality Check)

| Metric | Formula | Why it matters |
|--------|---------|----------------|
| Monthly Revenue | Avg Price x Units Sold/Day x Operating Days | How much money is really coming in |
| Average Order Value (AOV) | Total Revenue / Total Orders | Higher AOV = easier profitability |
| Sales Consistency | Std Dev of last 3 months revenue | Detects instability vs steady demand |
| Demand Fulfillment Rate | Units Sold / Units Produced | Shows underproduction or overproduction |
| Sell-Out Rate | Items Sold / Items Listed | High rate = growth opportunity |

**Insight trigger:** "You sold out consistently — demand > supply — raise prices or produce more."

**Dashboard component:** Revenue trend sparkline + AOV card + Demand/Supply gauge

---

#### Category 2: Cost Structure (Where the Money Leaks)

##### 2A. Cost of Goods Sold (COGS)

| Metric | Formula | Decision it enables |
|--------|---------|---------------------|
| COGS per Unit | Ingredient + Packaging cost per unit | Pricing sanity check |
| Monthly COGS | COGS per Unit x Units Sold | Margin control |
| COGS % | COGS / Revenue | Industry benchmark comparison |
| Wastage Cost | Wastage % x Ingredient Cost | Hidden profit drain |

| Threshold | COGS % |
|-----------|--------|
| Healthy | 25-35% |
| Warning | > 35% |
| Critical | > 42% |

##### 2B. Labor Efficiency

| Metric | Formula | Why founders care |
|--------|---------|-------------------|
| Monthly Labor Cost | Hourly Rate x Hours x Staff | Fixed cash outflow |
| Labor % of Revenue | Labor / Revenue | Overstaffing detection |
| Revenue per Labor Hour | Revenue / Total Labor Hours | Productivity score |
| Capacity Utilization | Actual Output / Max Output | Are you underusing staff? |

| Threshold | Labor % |
|-----------|---------|
| Healthy | 20-30% |
| Warning | > 30% |
| Critical | > 38% |

**Critical insight:** "High labor % + low capacity utilization = scheduling problem, not hiring problem."

##### 2C. Rent & Fixed Costs (Survival Metric)

| Metric | Formula | Meaning |
|--------|---------|---------|
| Rent % of Revenue | Rent / Revenue | Location viability |
| Fixed Cost Ratio | All Fixed Costs / Revenue | Risk exposure |
| Revenue per Sq Ft | Revenue / Floor Area | Location efficiency |

| Threshold | Rent % |
|-----------|--------|
| Healthy | 5-15% |
| Warning | > 15% |
| Critical | > 20% |

**Dashboard component:** Cost breakdown donut chart — segments for Rent, COGS, Labor, Marketing, Other, Profit. Each segment color-coded (red if over benchmark, green if healthy).

---

#### Category 3: Profitability (Truth Serum)

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| Gross Profit | Revenue - COGS | Can you even afford to exist? |
| Gross Margin % | Gross Profit / Revenue | Menu health |
| Net Profit | Revenue - All Costs | Business health |
| Net Margin % | Net Profit / Revenue | Investor & survival metric |

| Threshold | Net Margin |
|-----------|------------|
| Healthy | 10-20% |
| Warning | < 10% |
| Critical | < 5% |

**Reality check:** Under 10% net margin = business is fragile. A single bad month could mean a loss.

**Dashboard component:** Full P&L summary table:

| Line Item | Amount | % of Revenue |
|-----------|--------|--------------|
| Revenue | $X | 100% |
| (-) COGS | $X | X% |
| **Gross Profit** | **$X** | **X%** |
| (-) Rent & Occupancy | $X | X% |
| (-) Labor | $X | X% |
| (-) Marketing | $X | X% |
| (-) Other Expenses | $X | X% |
| **Net Profit** | **$X** | **X%** |

---

#### Category 4: Break-Even & Risk

| Metric | Formula | Why it's critical |
|--------|---------|-------------------|
| Contribution Margin | Price - Variable Cost per unit | Each sale's true value |
| Break-Even Units | Fixed Costs / Contribution Margin | Minimum survival volume |
| Break-Even Revenue | Break-Even Units x Price | Sales target |
| Margin of Safety | (Actual - Break-Even) / Actual | Cushion against bad months |

**Dashboard component:** Break-even bar showing current vs required, with margin of safety visualized as a buffer zone.

---

#### Category 5: Growth & Scale Readiness

*This is what most tools miss.*

| Metric | Formula | Insight |
|--------|---------|---------|
| Capacity Ceiling | Staff Hours / Time per Unit | Growth limit |
| Growth Headroom | Max Capacity - Current Sales | Can you grow without hiring? |
| Price Sensitivity | Delta Revenue / Delta Price | Can you raise prices safely? |
| Marketing ROI | (Revenue Gain - Marketing Spend) / Spend | Is marketing worth it? |

**Dashboard component:** Growth potential card showing headroom gauge and "next bottleneck" indicator.

---

#### Category 6: Time-Based Intelligence

| Metric | Formula | Value |
|--------|---------|-------|
| 3-Month Revenue Trend | Slope of last 3 months | Direction check |
| Seasonality Index | Current / 6-month Avg | Adjust expectations |
| Burn Rate (if losing money) | Monthly Loss | Time to runway exhaustion |
| Payback Period | Initial Investment / Monthly Net Profit | Founder patience test |

**Dashboard component:** Revenue trend line (3 months) + payback countdown.

---

#### Category 7: Owner's Draw (When Can You Pay Yourself?)

*The question every solo founder is afraid to ask.*

This category only appears when Team Size = "Just me" or "Family (2)". It replaces labor efficiency metrics with owner-focused financial guidance.

| Metric | Formula | What it tells the owner |
|--------|---------|-------------------------|
| Owner's Draw Budget | Net Profit - Reinvestment Reserve | Maximum you can take home without hurting the business |
| Reinvestment Reserve | 20-30% of Net Profit (default) | Money that should stay in the business for growth, repairs, emergencies |
| Sustainable Monthly Draw | (Net Profit x 0.7) / Months | What you can consistently pay yourself |
| Draw % of Revenue | Owner's Draw / Revenue | If > 15%, you may be starving the business |
| Months to Living Wage | (Target Monthly Income - Current Draw) / Monthly Profit Growth | When your business can support your lifestyle |
| Emergency Runway (after draw) | Remaining Cash / Monthly Fixed Costs | How many months the business survives if revenue stops |

**Threshold Logic:**

| Scenario | AI Guidance |
|----------|-------------|
| Net Profit < $0 | "You can't take a draw right now. The business isn't covering its costs yet. Focus on reaching break-even first." |
| Net Profit > $0 but < Target Draw | "You can take ${X}/month without hurting the business, but it's below your target of ${Y}. Here's what needs to change to close the gap." |
| Net Profit supports full draw + reserve | "You can pay yourself ${X}/month and still reinvest ${Y} for growth. This is sustainable." |
| Draw % > 15% of revenue | "You're taking too much out. The business needs cash to grow — supplier terms, equipment, marketing. Cap your draw at ${X} and reinvest the rest." |
| Reinvestment reserve < 1 month of fixed costs | "Your safety net is too thin. If you take this draw and have a slow month, you won't cover rent. Build up 2-3 months of reserves first." |

**AI Insight Examples:**
- "At your current net margin of 12%, you can take $2,400/month and still keep $1,000/month reinvesting in the business. That's sustainable."
- "You're 3 months away from being able to pay yourself $4,000/month — if revenue grows at the current trend."
- "Taking $5,000/month right now would leave zero reinvestment buffer. If your oven breaks or you need to stock up for a holiday rush, you'd be in trouble. Recommend capping at $3,500."
- "Great news — your business can support your target salary AND has 25% reinvestment headroom. You've hit financial sustainability."

**Dashboard component:** Owner's Draw card showing:
- Current sustainable draw (large number)
- Draw vs Target progress bar
- Reinvestment reserve gauge (healthy/thin/empty)
- "Months to target salary" countdown (if not yet there)

---

#### Category 8: Business Health Score (0-100)

The single composite metric for non-finance users. Weights adapt based on team size.

**Team (3+ employees):**

| Component | Weight | Score Logic |
|-----------|--------|-------------|
| Net Margin | 25% | 0-20% mapped to 0-100 |
| COGS % | 20% | 25-42% mapped to 100-0 |
| Labor % | 15% | 20-38% mapped to 100-0 |
| Rent % | 15% | 5-20% mapped to 100-0 |
| Capacity Utilization | 15% | 0-100% maps directly |
| Revenue Trend | 10% | Negative = 0, Flat = 50, Positive = 100 |

**Solo / Family operator (no employees):**

| Component | Weight | Score Logic |
|-----------|--------|-------------|
| Net Margin | 25% | 0-20% mapped to 0-100 |
| COGS % | 20% | 25-42% mapped to 100-0 |
| Rent % | 15% | 5-20% mapped to 100-0 |
| Owner Draw Sustainability | 15% | Can't pay self = 0, Full draw + reserve = 100 |
| Capacity Utilization | 15% | 0-100% maps directly |
| Revenue Trend | 10% | Negative = 0, Flat = 50, Positive = 100 |

**Display:** Large circular gauge at the top of the dashboard.
- **Green (75-100):** Healthy — "Your business is in good shape."
- **Yellow (50-74):** Caution — "Profitable but constrained by [top issue]."
- **Red (0-49):** At risk — "Immediate action needed on [top 2 issues]."

**Example output:** "Your business health is 72/100 (Yellow) — profitable but constrained by labor efficiency."

---

#### Scenario Sliders (What-If Modeling)

Interactive sliders that re-calculate the entire dashboard in real time:
- "What if revenue increases by X%?"
- "What if rent decreases by X%?"
- "What if you raise prices by $X?"
- "What if you reduce 1 employee?"

Each slider shows before/after on all affected metrics + the health score delta.

---

## 6. Benchmark Reference Table

All thresholds used by the rule engine and dashboard indicators.

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

---

## 7. AI Logic & Recommendation Engine

### Design Philosophy

> What makes BusiBldr powerful is NOT more metrics — it's:
> 1. Showing the right 5 numbers first
> 2. Explaining why they're bad
> 3. Telling what to do next

The AI always leads with the **highest-impact insight**, not a data dump.

### Priority Framework
When multiple issues exist, the AI prioritizes by:
1. **Survival Risk** — Is the business losing money or about to run out of runway?
2. **Impact Size** — Which cost category has the largest absolute overspend?
3. **Ease of Fix** — Can the user act on this immediately (raise price) vs. long-term (relocate)?

### Compound Insight Detection
The AI doesn't just flag individual thresholds — it detects combinations:

| Compound Signal | Insight |
|-----------------|---------|
| High labor % + Low capacity utilization | "This is a scheduling problem, not a hiring problem. Restructure shifts before cutting staff." |
| High COGS % + High sell-out rate | "Your ingredients cost too much but demand is strong. Raise prices — customers are already buying everything." |
| Low margin of safety + Negative revenue trend | "Your cushion is thin and revenue is declining. This is a 2-3 month runway warning. Cut variable costs immediately." |
| High rent % + High revenue per sq ft | "Rent is high but you're maximizing the space. Consider negotiating a longer lease at a locked rate." |
| Low AOV + High order volume | "You have traffic but low ticket size. Add combos, upsells, or premium options." |

### Recommendation Categories
| Category | Example Recommendations |
|----------|------------------------|
| **Increase Revenue** | Raise prices, add high-margin items, upsell/combos, extend hours, add delivery |
| **Reduce COGS** | Bulk purchasing, seasonal menus, supplier negotiation, waste reduction, smaller batches |
| **Optimize Labor** | Cross-training, shift restructuring, part-time hires, automation (self-order kiosks) |
| **Cut Occupancy** | Renegotiate lease, subletting, shift to cloud kitchen model |
| **Improve Marketing ROI** | Retention over acquisition, referral programs, reduce platform dependency |
| **Scale Up** | Produce more (if headroom exists), add second shift, expand menu for sold-out items |

### What-If Scenario Engine
The AI models multi-variable scenarios with before/after:
- "If you raise prices by $2, your COGS% drops from 38% to 33% and net margin jumps to 14%"
- "If you cut 1 employee and restructure shifts, labor drops by X% — but check that capacity utilization doesn't fall below 70%"
- "If revenue grows 15% (via marketing spend of $X), all ratios improve to healthy — here's the new P&L and updated health score"

---

## 8. Technical Architecture (High-Level)

**Deployment: Railway (all services)**

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────────────┐
│   Frontend   │────▶│   Backend API    │────▶│   AI Service (Tiered)  │
│   (Next.js)  │◀────│   (Node.js)      │◀────│                        │
└──────────────┘     └──────────────────┘     │  1. Rule Engine (free) │
                              │                │  2. Haiku 4.5 (cheap)  │
                     ┌────────▼────────┐      │  3. Sonnet 4.5 (smart) │
                     │   PostgreSQL    │      └────────────────────────┘
                     │   (Railway)     │
                     │                 │
                     │  - Users & Auth │
                     │  - Business     │
                     │    Plans        │
                     │  - Chat History │
                     └─────────────────┘
```

### Frontend
- Next.js (React) — deployed as a Railway service
- Responsive split layout (input panel + AI chat + dashboard)
- Real-time form state management (React Hook Form or similar)
- Chart library (Recharts) for donut charts, gauges, P&L tables
- Chat UI component with streaming responses
- Currency: USD formatting throughout

### Backend
- Node.js (Express or Fastify) — deployed as a Railway service
- REST API endpoints:
  - `POST /api/auth/*` — signup, login, session management
  - `GET/POST /api/plans` — CRUD for business plans
  - `POST /api/analyze` — trigger financial analysis
  - `POST /api/chat` — AI advisor messages
- Financial calculation engine (deterministic): benchmark comparisons, break-even, P&L generation
- Rate limiting on AI endpoints (free tier: 5 messages/session)

### AI Service (Tiered)
- **Layer 1 — Rule Engine** (runs on backend, zero AI cost):
  - Threshold checks against hardcoded benchmarks
  - Generates structured alerts: `{ category: "rent", severity: "warning", value: 18, benchmark: 15 }`
- **Layer 2 — Claude Haiku 4.5** (default for chat):
  - Takes rule engine output + user question → natural language response
  - Handles: explanations, term definitions, basic recommendations
  - ~$0.25/1M input tokens, ~$1.25/1M output tokens
- **Layer 3 — Claude Sonnet 4.5** (escalation):
  - Complex what-if scenarios involving multiple variables
  - Deep strategic analysis when user asks open-ended business questions
  - Triggered when Haiku's response confidence is low or user explicitly requests deeper analysis

### Database (PostgreSQL on Railway)
- **users** — id, email, password_hash, plan_tier (free/paid), created_at
- **business_plans** — id, user_id, name, business_type, form_data (JSONB), created_at, updated_at
- **chat_messages** — id, plan_id, role (user/assistant), content, model_used, created_at
- **benchmarks** — category, business_type, healthy_min, healthy_max, warning_threshold, critical_threshold

### Authentication
- Email + password (bcrypt) with JWT tokens
- Optional: OAuth (Google) in Phase 2

---

## 9. User Flow

```
1. User lands on BusiBldr
   │
2. Fills Business Basics (type, location, capacity)
   │
3. Enters Revenue details (AOV, orders/day)
   │  ──▶ Dashboard starts rendering (revenue card)
   │  ──▶ AI: "Good start! Let's see your cost structure."
   │
4. Fills Rent & Occupancy
   │  ──▶ Dashboard updates (occupancy % card)
   │  ──▶ AI: Flags if rent > 15% with explanation
   │
5. Fills COGS, Labor, Marketing, Other
   │  ──▶ Dashboard fully renders (donut chart, P&L, score)
   │  ──▶ AI: Comprehensive analysis with prioritized action items
   │
6. User interacts with AI
   │  ──▶ Asks "How do I fix my food cost?"
   │  ──▶ AI responds with specific, actionable suggestions
   │
7. User adjusts inputs / runs what-if scenarios
   │  ──▶ Dashboard updates in real time
   │  ──▶ AI comments on improvements or remaining issues
   │
8. User saves or exports their business plan
```

---

## 10. MVP Scope (Phase 1)

**In Scope:**
- [ ] User accounts (email/password signup, JWT auth)
- [ ] Input form with all sections (A through H), USD currency
- [ ] Save / load business plans (multiple per user)
- [ ] Real-time P&L calculation and display
- [ ] Cost breakdown donut chart
- [ ] Benchmark comparison cards with status indicators
- [ ] AI chat panel with proactive threshold-based insights (rule engine + Haiku)
- [ ] Break-even analysis
- [ ] What-if scenario sliders (revenue and 1-2 cost categories)
- [ ] Freemium gating (free: 5 AI messages/session, paid: unlimited)
- [ ] Mobile-responsive layout
- [ ] Railway deployment (frontend + backend + PostgreSQL)

**Out of Scope (Phase 2+):**
- OAuth (Google login)
- Multi-location comparison
- Region-specific / international benchmark datasets
- PDF/Excel export of business plan
- Integration with accounting software (QuickBooks, etc.)
- Competitor analysis
- Inventory management module
- Historical trend tracking
- Stripe payment integration for paid tier

---

## 11. Decisions (Resolved)

1. **Currency:** USD only. USA market focus.
2. **Benchmark Data Source:** Hybrid — hardcode core benchmarks (rent, COGS, labor %) from published F&B industry reports (NRA, IBISWorld). AI provides nuanced, context-specific commentary on top of the deterministic rules.
3. **AI Model:** Tiered approach for cost efficiency:
   - **Rule-based engine** (zero cost) — threshold alerts (rent > 15%, COGS > 35%, etc.)
   - **Claude Haiku 4.5** (~$0.25/1M input) — 90% of chat responses, explanations, basic recommendations
   - **Claude Sonnet 4.5** (mid-tier) — complex multi-variable scenario modeling, escalation only
4. **Hosting:** Railway deployment. Backend + DB + AI service all on Railway.
5. **Monetization:** Freemium model.
   - **Free tier:** Basic form, dashboard with P&L and cost breakdown, limited AI insights (e.g., 5 messages/session)
   - **Paid tier:** Unlimited AI chat, saved business plans, what-if scenario modeling, PDF/Excel export, historical comparisons
6. **Data Storage:** Full user accounts with database. Users can sign up, save multiple business plans, and revisit them across sessions.

---

## 12. Design Principles

1. **Plain Language Over Jargon** — Say "ingredient cost" not "COGS" in the UI (show technical terms as tooltips)
2. **Progressive Disclosure** — Don't overwhelm; reveal sections as the user progresses
3. **Immediate Feedback** — Every input should visibly affect the dashboard and trigger AI commentary
4. **Actionable Over Informational** — Don't just say "rent is high"; say what to do about it
5. **Honest, Not Alarming** — Flag problems clearly but frame them as solvable, not catastrophic
