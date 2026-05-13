# PFMS UX + Behavioural Psychology Strategy

## Repositioning the Platform: From Wealth Dashboard to Everyday Money Coach

The current PMFS experience is structurally strong (dashboards, widgets, role views), but its tone and data model currently lean toward advisor-led wealth management. To serve everyday banking customers, the product should be reframed as a **Personal Finance Management System (PFMS)** that helps people make small, frequent, emotionally-loaded spending decisions well, especially in recurring categories such as:

- Tesco and supermarket shopping
- Food delivery (Uber Eats, Deliveroo, Just Eat)
- Household essentials
- Commute and subscriptions

This document lays out a UX and behavioural psychology strategy for that shift, while staying compatible with the current platform architecture.

---

## 1) Product Intent and Behavioural Outcome

A successful PFMS is not only a ledger. It is a **decision support system** that reduces cognitive load at the moment of spend and improves planning before spend.

### Core behavioural outcomes

1. Increase budget adherence in high-frequency categories (Tesco + food delivery).
2. Reduce end-of-month financial stress through early warning signals.
3. Build habit loops around weekly review and micro-adjustments.
4. Improve users’ perceived control over money (financial self-efficacy).

### Why this matters

Behavioural research consistently shows that people struggle with present bias, mental accounting errors, and limited attention. A PFMS should therefore be designed as a set of guardrails and cues, not just reports.

---

## 2) User Segments and Role Fit Within Current Platform

Your current role system (manager, fa, customer) can map naturally to a PFMS operating model.

## Manager

In PFMS context: operations/admin role.

- Manages category taxonomy, nudges, policy settings, product experiments.
- Oversees health metrics (budget adherence, churn risk, engagement).
- Configures guardrails and communication rules.

## FA

In PFMS context: financial assistant / coach role (human or assisted support).

- Reviews customer spending patterns.
- Helps customers re-plan budgets after life events.
- Handles escalations for customers repeatedly breaching budgets.

## Customer

Primary PFMS end user.

- Tracks category budgets.
- Receives spending guidance and alerts.
- Uses short reflective flows to adapt weekly plans.

This role mapping preserves your current architecture while changing content, labels, and behavioural goals.

---

## 3) Behavioural Psychology Principles to Anchor the UX

The following principles should explicitly shape interaction design.

## 3.1 Choice Architecture and Defaults

Users often stick with defaults. Make the first budget setup sane and conservative:

- Pre-populate starter budget splits from income and transaction history.
- Set default weekly caps for Tesco and food delivery.
- Require explicit opt-out to remove alerts.

Design implication: default settings should protect users from overspend without feeling punitive.

## 3.2 Mental Accounting

People naturally bucket money into categories. The product should support this instead of fighting it:

- Distinct “pots” for groceries, food delivery, transport, social, bills.
- Visual separation of essential vs discretionary spend.
- Clear “remaining this week” number per pot.

Design implication: category budgets should be central in the dashboard, not hidden in settings.

## 3.3 Goal Gradient Effect

Motivation increases as users perceive progress toward a goal:

- Show progress bars for each category budget.
- Reinforce near-goal success (“You kept Tesco under plan for 3 weeks”).
- Use weekly streaks for consistency, not perfection.

Design implication: progress framing should be prominent and emotionally positive.

## 3.4 Implementation Intentions

“if-then” planning improves goal execution:

- Prompt users to set short plans: “If food delivery hits 80% budget by Thursday, switch to home-cooked dinners Friday-Sunday.”
- Let users save one-tap fallback plans.

Design implication: build lightweight planning prompts into weekly check-ins.

## 3.5 Timely Feedback and Salience

Feedback must arrive when it can still change behaviour:

- Pre-threshold alert at 70-80% budget use.
- “Next purchase impact” simulation before discretionary spend.
- End-of-week reflection with one recommendation.

Design implication: alerts should be anticipatory, not merely historical.

## 3.6 Loss Aversion and Framing

People respond strongly to potential losses. Use carefully:

- Frame overspend as future trade-off (“At this pace, Friday essentials may be tight”).
- Pair warning with an immediate, achievable action.

Design implication: never show fear-only messages; always include a next step.

## 3.7 Self-Determination Theory (Autonomy, Competence, Relatedness)

Long-term adherence requires users feeling capable and in control:

- Autonomy: user can tune categories and limits.
- Competence: simple language, understandable metrics, actionable advice.
- Relatedness: optional coach support (FA role), empathetic tone.

Design implication: avoid judgmental copy; use collaborative framing (“Let’s rebalance this week”).

---

## 4) UX Strategy for Everyday Banking Use Cases

## 4.1 Information Hierarchy for the Customer Dashboard

The top of the customer dashboard should answer 4 questions in under 10 seconds:

1. How much do I have left this week?
2. Am I on track in Tesco and food delivery?
3. What should I do next?
4. Is my overall month still safe?

### Recommended first-screen modules

- Weekly Cash Flow Snapshot (income in, spend out, projected remainder)
- Category Guardrails (Tesco, food delivery, essentials)
- Immediate Actions (e.g., “Reduce delivery cap by £15 this week”)
- Short Trend Insight (e.g., “Delivery spend is +22% vs your 4-week average”)

## 4.2 Tesco and Food Delivery as Behavioural Anchor Categories

These categories are ideal for early wins:

- High frequency and high visibility.
- Strong habit component.
- Easy substitution opportunities (meal planning, shopping list discipline).

### Required UX details

- Tesco sub-categories: essentials, impulse/snacks, premium extras.
- Food delivery split by day/time to reveal pattern triggers.
- “Spend velocity” indicator: how fast budget is burning relative to week progression.

Example:

- If 60% of weekly food delivery budget is used by Tuesday, show a yellow warning and suggest two alternatives.

## 4.3 Weekly Rhythm Design

Move from passive checking to active planning with a weekly loop:

1. Monday plan: set category caps.
2. Midweek checkpoint: detect drift and intervene.
3. Weekend reflection: summarize wins and one adjustment.

This rhythm supports habit formation and avoids relying on willpower alone.

## 4.4 Emotional Tone and Trust

Money interfaces can trigger shame and avoidance. Tone matters.

Use:

- Neutral and supportive wording.
- “Nudge and recover” framing after overspend.
- Explicit reassurance that setbacks are normal.

Avoid:

- Blame language.
- Red-only alarming visuals for minor deviations.
- Information overload in warning states.

---

## 5) Experience Architecture Across Roles

## 5.1 Customer Experience (Primary)

Primary objective: day-to-day money decisions.

### Core surfaces

- Budget dashboard with category health.
- Transaction timeline with smart categorization corrections.
- Nudges and recommendations feed.
- Adjustable goals and fallback plans.

### Interaction principles

- Low friction entry.
- One decision per screen where possible.
- Explainability for every recommendation.

## 5.2 FA Experience (Coach)

Primary objective: support at-risk customers without micromanagement.

### Core surfaces

- Portfolio of assigned customers by risk tier.
- “Who needs help now” queue based on behavioural signals.
- Coaching notes and intervention history.

### Behavioural model

- Trigger outreach when users repeatedly breach core budgets.
- Offer scripted coaching interventions based on pattern type.

## 5.3 Manager Experience (Operations)

Primary objective: system-level optimisation.

### Core surfaces

- Nudge effectiveness dashboard.
- Segment performance (e.g., Tesco adherence uplift).
- Experiment control center (A/B nudges, threshold tuning).

### Governance

- Monitor fairness and alert fatigue.
- Ensure vulnerable users are not overwhelmed by aggressive nudging.

---

## 6) Integrating This Into the Current Platform

The current architecture can support this shift with targeted changes rather than full rewrite.

## 6.1 Data Model Enhancements

Add/extend entities for:

- BudgetCategory (essential/discretionary tag)
- WeeklyBudgetPlan
- BudgetEvent (warning, breach, recovery)
- NudgeInteraction (shown, dismissed, accepted)
- Merchant normalization (Tesco, Deliveroo, etc.)

## 6.2 Widget and Page Reframing

Replace wealth-oriented widgets with PFMS widgets:

- “Top Clients” -> “Top Budget Risk Categories”
- “AUM Growth” -> “Budget Adherence Trend”
- “Portfolio Allocation” -> “Spend Allocation by Category”

Keep drag/drop and role-aware architecture, but change semantics and metrics.

## 6.3 Role-Based Conditional UX

Customer:

- No client-management concepts.
- High salience on weekly category control.
- Prescriptive but optional recommendations.

FA:

- Multi-customer comparison views.
- Intervention workflow and notes.

Manager:

- Policy controls and analytics.
- Nudge and threshold configuration.

## 6.4 Alerting Strategy

Implement three alert layers:

1. Informational: “On track” reinforcement.
2. Preventive: pre-breach warning at 70-80% usage.
3. Corrective: breach with single best next action.

Add cooldown logic so users are not spammed.

---

## 7) UX Patterns Recommended for Tesco + Food Delivery Budgets

## Pattern A: Category Thermometer

- Horizontal bar with safe/caution/risk zones.
- Shows both current spend and projected end-of-week.
- Use semantic copy: “steady”, “watch”, “at risk”.

## Pattern B: Spend Velocity Card

- “You are spending this category 1.4x faster than the week pace.”
- Includes simple forecast if no change is made.

## Pattern C: Trade-Off Prompt

- Before approving discretionary spend, show lightweight impact:
- “This order likely leaves £18 for groceries through Sunday.”

## Pattern D: Recovery Path after Breach

- Not just “over budget”; provide 2-3 realistic alternatives.
- Example: “Pause delivery for 2 days to recover plan.”

## Pattern E: Weekly Reflection

- 60-second summary each Sunday.
- One celebration + one focused adjustment.

---

## 8) Behavioural Measurement Framework

Without measurement, behavioural design is guesswork.

## Primary metrics

- Budget adherence rate by category.
- Overspend incidents per active user per month.
- Recovery rate after warning (did user return to plan?).
- Nudge acceptance rate.
- Customer financial stress proxy (self-report pulse).

## Secondary metrics

- Session frequency (weekly cadence).
- Time-to-action after alert.
- FA intervention conversion (for coached segments).
- Retention at 30/90 days.

## Experimentation approach

- Test message framing (supportive vs neutral).
- Test alert timing thresholds (70 vs 80%).
- Test UI salience (badge + card vs push only).

Use controlled A/B tests with ethical safeguards.

---

## 9) Ethical and Regulatory Design Guardrails

Behavioural design must support user welfare, not manipulation.

### Guardrails

- Transparent recommendation logic.
- Easy opt-out of non-essential nudges.
- No dark patterns that trap users in paid features.
- Bias checks across income bands and household types.
- Human escalation pathways for financial vulnerability.

### Inclusion requirements

- Plain-language copy at accessible reading level.
- Color-safe visual signals for accessibility.
- Mobile-first layouts for everyday use contexts.

---

## 10) Delivery Roadmap (Product + UX)

## Phase 1: Foundations (2-4 weeks)

- Rename key IA labels for PFMS semantics.
- Introduce category budget model.
- Implement Tesco + food delivery category tracking.
- Add role-appropriate dashboard cards.

## Phase 2: Behavioural Layer (4-6 weeks)

- Add pre-breach alerts and spend velocity.
- Add weekly planning and reflection flow.
- Add recommendation explanations.

## Phase 3: Coaching and Optimization (4-8 weeks)

- FA intervention queue and scripts.
- Manager nudge analytics and tuning panel.
- A/B framework for message and threshold testing.

## Phase 4: Maturity (ongoing)

- Adaptive budgeting from user behaviour.
- Better merchant classification.
- Vulnerability-sensitive support pathways.

---

## 11) Design Decisions Summary

1. Keep the existing role architecture; reinterpret it for PFMS service operations.
2. Prioritize category-based money control over investment reporting.
3. Treat Tesco and food delivery as behavioural anchor categories for fast user value.
4. Use anticipatory alerts and recovery guidance, not only post-fact reporting.
5. Build an ethical nudge system with transparency and user autonomy.
6. Measure behavioural outcomes directly (adherence, recovery, stress proxy), not only dashboard engagement.

---

## References

1. Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. Econometrica, 47(2), 263-291.
2. Thaler, R. H. (1985). Mental accounting and consumer choice. Marketing Science, 4(3), 199-214.
3. Thaler, R. H., & Sunstein, C. R. (2008). Nudge: Improving Decisions About Health, Wealth, and Happiness. Yale University Press.
4. Sheeran, P. (2002). Intention-behavior relations: A conceptual and empirical review. European Review of Social Psychology, 12(1), 1-36.
5. Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation. American Psychologist, 57(9), 705-717.
6. Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. Psychological Inquiry, 11(4), 227-268.
7. Duhigg, C. (2012). The Power of Habit. Random House.
8. Fogg, B. J. (2009). A behavior model for persuasive design. Proceedings of Persuasive 2009.
9. Oinas-Kukkonen, H., & Harjumaa, M. (2009). Persuasive systems design: Key issues, process model, and system features. Communications of the Association for Information Systems, 24(1), 485-500.
10. OECD. (2022). OECD/INFE Toolkit for Measuring Financial Literacy and Financial Inclusion.
11. FCA. (2023). Consumer Duty: Guidance for firms on delivering good outcomes for retail customers.
12. Norman, D. A. (2013). The Design of Everyday Things (Revised and Expanded). Basic Books.
