# Designing a Customisable Dashboard for Financial Advisory Managers: A Psychology of Human Behaviour Perspective

---

## Introduction

A dashboard is not merely a display of data. It is a cognitive interface — a translated model of a complex world pressed into a single screen. For a manager overseeing a team of financial advisors, that world is dense: fluctuating portfolios, client risk profiles, advisor performance, transaction volumes, and compliance signals all compete for attention simultaneously. The question of whether a dashboard should be *fixed* or *customisable* is therefore not a question of design aesthetics. It is a question of human psychology.

This essay argues that transforming the PMFS platform dashboard into a customisable workspace for financial advisory managers is not just a feature enhancement — it is a psychologically necessary evolution. Drawing on established models of cognitive load, motivation, autonomy, attentional control, and decision-making, this essay builds the case for what a customisable dashboard should do, why it works on the human mind, and how it should be implemented.

---

## 1. The Cognitive Load Problem: Why Fixed Dashboards Fail Managers

### 1.1 Cognitive Load Theory

Cognitive Load Theory, introduced by John Sweller in 1988, describes the mental effort required to process information in working memory. Working memory is severely limited — humans can hold roughly four chunks of information at any given time (Cowan, 2001). When a dashboard presents every available metric simultaneously, it creates **extraneous cognitive load**: mental effort spent processing irrelevant information rather than solving the actual problem at hand.

For a financial advisory manager, the current dashboard presents KPI cards, portfolio charts, allocation breakdowns, transaction feeds, client tables, activity logs, and alert panels all at once. A manager reviewing morning performance does not need all of these simultaneously. A manager handling a compliance escalation needs a completely different view. A fixed layout treats both situations identically, forcing the manager's brain to filter signal from noise on every single visit.

**Customisation reduces extraneous load by allowing the manager to structure information density according to the cognitive task in front of them.**

### 1.2 The Paradox of the Firehose

Psychologist Barry Schwartz, in *The Paradox of Choice* (2004), demonstrated that more options and more information do not produce better decisions — they produce paralysis and anxiety. This is directly applicable to dashboards. The more data visible at once, the more the manager's brain must triage. Triage itself consumes processing resources that should be directed at analysis and judgment.

Custom dashboard layouts allow the manager to pre-determine what matters before sitting down to work. The act of customisation itself becomes a metacognitive exercise — reflecting on priorities before the day begins — which is itself a behaviour associated with higher-order executive function and better decision-making outcomes (Flavell, 1979).

---

## 2. Autonomy and Motivation: The Self-Determination Lens

### 2.1 Self-Determination Theory

Deci and Ryan's Self-Determination Theory (SDT, 1985) identifies three core psychological needs that drive human motivation: **competence**, **relatedness**, and **autonomy**. In workplace software, autonomy is consistently the most violated of these three. Tools are imposed on workers with fixed interfaces that communicate, implicitly, that the worker's individual judgment about how to work is not trusted.

When a manager can rearrange, hide, resize, and reorder dashboard components, the tool signals the opposite: *you are competent to decide what matters*. This is not a trivial distinction. Research by Deci et al. (1989) found that employees given greater autonomy over their work environment reported higher intrinsic motivation, lower burnout, and greater commitment to their role.

For a financial advisory manager — whose job involves high stakes, constant uncertainty, and responsibility for others' performance — intrinsic motivation is a professional survival mechanism. A customisable dashboard supports that motivation structurally.

### 2.2 Ownership Bias and the IKEA Effect

Norton, Mochon, and Ariely (2012) documented the **IKEA Effect**: the tendency for people to overvalue objects they have partially constructed themselves. While originally demonstrated with physical assembly, subsequent research has extended this to digital environments. Users who configure their own tools report higher satisfaction with those tools, use them more frequently, and are more likely to advocate for them within their organisations.

A manager who has spent twenty minutes arranging their PMFS dashboard — placing the advisor performance table where they want it, removing charts irrelevant to their current team focus, pinning the alerts panel to the top — has made a psychological investment in that workspace. They will return to it with lower resistance and higher engagement than they would to a tool handed to them fully formed.

---

## 3. Attentional Psychology: Designing for How Managers Actually See

### 3.1 Visual Hierarchy and Pre-attentive Processing

Humans process visual information in two stages. Pre-attentive processing happens in under 250 milliseconds, before conscious attention is engaged, and responds to attributes like colour, size, position, and motion (Treisman & Gelade, 1980). Attentive processing is slower, sequential, and requires deliberate focus.

A fixed dashboard cannot honour individual differences in pre-attentive processing. What draws one manager's eye first is not what draws another's. A manager whose primary concern is client churn will visually anchor on client activity. A manager focused on revenue growth will anchor on portfolio performance. If these elements are buried in a uniform grid, the mismatch between what the brain seeks and what the eye first encounters creates friction on every single interaction.

Custom widget placement gives managers the ability to align visual hierarchy with their own attentional priorities. The brain's pre-attentive system can then do its job: surfacing critical information in under a quarter of a second without requiring the manager to consciously scan the page.

### 3.2 Habituation and the Risk of the Familiar

There is a competing psychological phenomenon that customisation must navigate carefully: **habituation**. The brain reduces its response to stimuli that appear in the same place, at the same intensity, over and over. A red alert badge that appears in the same position every day will eventually be processed as background noise — the manager sees it but stops reacting to it.

Well-designed customisation systems can counter this by:

- Allowing alert panels to be **pinned or promoted** dynamically, so their visual weight can be restored when needed
- Enabling **conditional layouts** — different widget arrangements triggered by threshold conditions (e.g., a distressed client automatically surfaces their advisor's widget to the top)
- Supporting **multiple named views** that the manager can switch between, preventing any single arrangement from becoming invisible through familiarity

This transforms the dashboard from a static report into an adaptive cognitive environment.

---

## 4. Mental Models and the Psychology of Personalisation

### 4.1 Mental Models in Expert Users

Donald Norman's concept of the **mental model** (1983) describes the internal representation a user maintains of how a system works. Expert users — and a financial advisory manager is by definition an expert user of their own domain — develop rich, nuanced mental models that diverge significantly from the simplified model a fixed interface assumes.

A senior manager has a specific theory of what matters in their team. They know, for instance, that advisor performance lags are a leading indicator of client exits three months out. They have learned that transaction spikes on Fridays are rarely significant. These insights are invisible to any fixed dashboard. A customisable dashboard, by contrast, can be shaped *around* the mental model the manager has already built — not against it.

This is the difference between a tool that works the way its designers think and a tool that works the way its user thinks.

### 4.2 The Zeigarnik Effect and Incomplete Tasks

Bluma Zeigarnik (1927) demonstrated that humans remember incomplete tasks more vividly than completed ones. In a managerial context, this means that the mental residue of unresolved items — clients in a pending state, advisors flagged for review, transactions stuck in processing — occupies working memory even when not directly viewed.

A customisable dashboard can leverage this by allowing managers to create **persistent focus panels**: pinned workspaces that maintain the current state of ongoing priorities. Rather than navigating to different pages to check on a flagged situation, the manager keeps it visible in a dedicated section of their layout until it resolves. This externalises the Zeigarnik loop — offloading the cognitive burden of remembering onto the interface — freeing working memory for higher-order judgment.

---

## 5. Trust, Control, and Anxiety Reduction in High-Stakes Environments

### 5.1 Locus of Control

Julian Rotter's Locus of Control theory (1954) distinguishes between individuals who believe outcomes are determined by their own actions (internal locus) and those who believe outcomes are controlled by external forces (external locus). High-performing managers in high-stakes industries consistently trend toward internal locus. They believe their decisions matter. They seek environments that reinforce that belief.

A rigid, unchangeable dashboard communicates an external locus of control: the system decides what you see. A customisable one communicates an internal locus: *you* decide what to attend to, and therefore *you* are in a meaningful relationship with outcomes. For managers already oriented toward internal control, this alignment between tool and psychology is quietly but powerfully motivating.

### 5.2 Anxiety and the Role of Environmental Predictability

Research in environmental psychology (Kaplan, 1995) demonstrates that humans consistently prefer environments they can understand and navigate without effort. Uncertainty in a workspace — not knowing where to look, what will have changed, what a new number means — raises baseline cortisol and reduces decision quality.

A manager who has configured their own dashboard operates in an environment they have made legible to themselves. Even when the *data* is alarming, the *environment* is predictable. This separation — between the stress of the situation and the stress of the tool — is significant. It allows managers to direct their anxiety appropriately, toward the actual problem, rather than toward the interface.

---

## 6. Practical Implementation: What Customisation Should Look Like

Understanding the psychology leads directly to design decisions. The following components are grounded in the behavioural principles discussed above.

### 6.1 Drag-and-Drop Widget Grid

A widget-based layout (similar to, but more purposefully designed than, consumer dashboard tools like Notion or Grafana) allows managers to move, resize, and reorder panels. This directly addresses cognitive load by enabling information density calibration, and supports autonomy by making spatial control immediate and tactile.

Each current dashboard component — StatsCards, PortfolioChart, AllocationChart, RecentTransactions, ActivityFeed, AlertsPanel, TopClients — becomes an independently positionable widget.

### 6.2 Named Views / Perspectives

Managers should be able to save multiple named layouts: *Morning Review*, *Client Risk Focus*, *Advisor Performance Check*, *End of Month*. Switching between named views takes less than a second and reorients the entire workspace to a different cognitive context.

This prevents habituation (no one layout becomes wallpaper) and supports the mental models of users who segment their work by context rather than by time.

### 6.3 Widget Visibility Toggles and Pinning

Not every widget is relevant every day. The ability to hide widgets (rather than delete them) reduces decision fatigue about whether to engage with a given data stream. Pinning a widget to a persistent position regardless of layout supports the Zeigarnik principle — keeping open items visible until they are resolved.

### 6.4 Threshold-Based Widget Promotion

Automated elevation of widgets when their underlying data crosses a threshold (e.g., a client's portfolio drops below a risk threshold, or an advisor's activity is anomalously low) counteracts habituation while maintaining attentional efficiency. The manager does not need to hunt for problems — the layout itself signals them.

### 6.5 Onboarding as Configuration

Rather than presenting new managers with a default layout, the onboarding flow should guide them through a brief configuration exercise: *What three things do you check first every morning? Which advisor metrics matter most to your team's current goals?* This serves multiple functions simultaneously — it gathers personalisation data, triggers the IKEA Effect immediately, and communicates autonomy from the first interaction.

---

## 7. The Manager vs. The Advisor: Different Cognitive Roles, Different Tools

It is worth distinguishing clearly between the financial advisor's view of PMFS and the manager's view. The advisor is primarily a **task executor**: they act on client instructions, process transactions, and manage individual relationships. Their information needs are narrow and deep — they want everything about their clients, immediately accessible.

The manager is a **pattern detector and decision arbiter**: they are scanning for trends across many advisors and many clients, looking for deviations, risks, and opportunities. Their information needs are wide and shallow on most days, with occasional deep dives triggered by anomalies.

Fixed dashboards tend to be designed for task executors. They reflect the structure of individual actions. Customisable dashboards are necessary for pattern detectors, because the patterns that matter change depending on business conditions, team composition, and strategic priorities — none of which a designer can fully anticipate at build time.

A manager who cannot shape their view into a pattern-detection instrument will inevitably build workarounds: spreadsheets exported from the system, personal notes, physical whiteboards. These are not evidence that the manager doesn't trust technology. They are evidence that the technology does not yet support the manager's actual cognitive work. Customisation closes that gap.

---

## Conclusion

The transformation of the PMFS dashboard from a fixed layout to a customisable workspace for financial advisory managers is not a cosmetic upgrade. It is a response to a set of deep, consistent truths about how the human mind operates under complexity, pressure, and responsibility.

Cognitive Load Theory tells us that fixed layouts waste the finite resource of working memory. Self-Determination Theory tells us that autonomy over tools increases motivation and commitment. Attentional psychology tells us that visual hierarchy must match individual priority structures. Research on mental models tells us that expert users need tools that conform to their expertise, not tools that require them to translate it. Locus of Control theory tells us that high-performing managers operate best in environments that reflect their sense of agency.

A customisable dashboard answers all of these calls simultaneously. It treats the manager not as a passive consumer of pre-structured reports but as an active cognitive agent who brings their own experience, priorities, and judgment to their workspace.

The PMFS platform already contains the right data. The remaining work is to hand the manager the authority to decide what that data looks like.

---

## References

- Cowan, N. (2001). The magical number 4 in short-term memory. *Behavioral and Brain Sciences, 24*(1), 87–114.
- Deci, E. L., Connell, J. P., & Ryan, R. M. (1989). Self-determination in a work organisation. *Journal of Applied Psychology, 74*(4), 580–590.
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*. Plenum Press.
- Flavell, J. H. (1979). Metacognition and cognitive monitoring. *American Psychologist, 34*(10), 906–911.
- Kaplan, S. (1995). The restorative benefits of nature. *Journal of Environmental Psychology, 15*(3), 169–182.
- Norman, D. A. (1983). *Some Observations on Mental Models*. Lawrence Erlbaum Associates.
- Norton, M. I., Mochon, D., & Ariely, D. (2012). The IKEA effect. *Journal of Consumer Psychology, 22*(3), 453–460.
- Rotter, J. B. (1954). *Social Learning and Clinical Psychology*. Prentice-Hall.
- Schwartz, B. (2004). *The Paradox of Choice: Why More Is Less*. Harper Collins.
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science, 12*(2), 257–285.
- Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. *Cognitive Psychology, 12*(1), 97–136.
- Zeigarnik, B. (1927). Über das Behalten von erledigten und unerledigten Handlungen. *Psychologische Forschung, 9*, 1–85.
