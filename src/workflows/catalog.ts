// Original MIT skill library catalog for Open Kitchen Toolkit 0.2.0.
// 73 canonical workflows covering 61 public baseline use cases plus 12 utilities and new workflows.
// SKILL.md files are the prose source of truth; this array is the discovery contract.

export const LIBRARY_VERSION = '0.2.0' as const;
export const DATA_VERSION = 'v1' as const;
export const LICENSE = 'MIT' as const;

export interface WorkflowDefinition {
  id: string;
  title: string;
  zone: string;
  summary: string;
  aliases: string[];
  coverageId?: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  example: { input: string; output: string };
  blockedExample: { input: string; output: string };
}

export const WORKFLOW_CATALOG: WorkflowDefinition[] = [
  {
    "id": "agency-chef-onboarding-generator",
    "title": "Agency chef onboarding generator",
    "zone": "Kitchen Operations",
    "summary": "Draft a shift ready onboarding pack for an agency chef with site specifics.",
    "aliases": [
      "agency-onboarding",
      "temp-chef-intro"
    ],
    "coverageId": "agency-chef-onboarding-generator",
    "inputs": [
      "Site, date, shift times, station",
      "Emergency contacts and exits per verified plan",
      "Knife, hygiene, and allergen rules summary"
    ],
    "outputs": [
      "One shift onboarding pack draft",
      "Sign off checklist left blank"
    ],
    "tools": [
      "get_workflow",
      "list_workflows",
      "create_task"
    ],
    "example": {
      "input": "Onboard agency chef for Austin Central 2026-03-11, 14:00 to 22:00, saute station, buddy Ana, report to sous chef Ben. House rules whites hat closed shoes handwash on entry and every 30 min. Allergen handling flag tickets to Ana per matrix v4 and HACCP v2.1. Emergency exits north and rear, assembly lot B, first aider Cara per fire plan v1.2. Tasks 14:30 mise check, 17:00 service start, 21:30 close down.",
      "output": "AGENCY ONBOARDING - Austin Central - 2026-03-11\nShift: 14:00-22:00 saute, buddy Ana, report to sous chef Ben.\nHygiene and dress: whites, hat, closed shoes; handwash on entry and every 30 min per house rule.\nAllergens: flag all allergy tickets to Ana; states per matrix v4; never guess; plan ref HACCP v2.1.\nEmergency: exits north and rear per fire plan v1.2; assembly point lot B; first aider Cara.\nTasks: 14:30 mise check; 17:00 service start; 21:30 close down saute.\nSign off: chef ____ sous ____ date ____. Right to work TBC by agency/HR."
    },
    "blockedExample": {
      "input": "Onboard agency chef. Shift times and station missing.",
      "output": "ONBOARDING BLOCKED\nShift times unknown; station unknown.\nSupply both before issuing the pack. No generic pack sent."
    }
  },
  {
    "id": "allergen-management-system",
    "title": "Allergen management system",
    "zone": "Kitchen Operations",
    "summary": "Maintain an allergen matrix with explicit states and label versions.",
    "aliases": [
      "allergen-log",
      "allergen-matrix"
    ],
    "coverageId": "allergen-management-system",
    "inputs": [
      "Dish list with ingredients",
      "Label versions per ingredient with dates",
      "Guest or ticket allergen notes when relevant"
    ],
    "outputs": [
      "Allergen matrix with states and sources",
      "Unknowns list with owners"
    ],
    "tools": [
      "validate_kitchen_data",
      "lookup_recipe",
      "get_workflow"
    ],
    "example": {
      "input": "Matrix for Austin Central 2026-03-10. Soup tomato and onion, labels v4. Celery verified_absent per v4. Gluten unknown pending mill letter. Tree_nut ticket table 8 per host note 2026-03-10. Unknown owners Ben gluten due 2026-03-12, Ana tree_nut labels due 2026-03-11.",
      "output": "ALLERGEN MATRIX - Austin Central - 2026-03-10 - labels v4\nSoup tomato: celery verified_absent per v4; gluten unknown pending mill letter; tree_nut unknown no label claim.\nSoup onion: same as tomato.\nTicket table 8 tree_nut contains per host note unverified; kitchen to confirm with guest and manager.\nUnknowns: gluten owner Ben due 2026-03-12; tree_nut labels owner Ana due 2026-03-11.\nNo negative claims from missing labels."
    },
    "blockedExample": {
      "input": "Build matrix. Label versions missing for all ingredients.",
      "output": "MATRIX BLOCKED\nLabel versions unknown for all ingredients.\nAll cells would be unknown; supply versions to proceed. No matrix issued."
    }
  },
  {
    "id": "apprenticeship-tracker",
    "title": "Apprenticeship tracker",
    "zone": "People and Training",
    "summary": "Track apprentice hours, modules, and evidence toward sign off.",
    "aliases": [
      "apprentice-tracker",
      "apprenticeship-log"
    ],
    "coverageId": "apprenticeship-tracker",
    "inputs": [
      "Apprentice name, program, start date",
      "Required hours and modules",
      "Evidence log with dates"
    ],
    "outputs": [
      "Progress tracker with percent complete",
      "Gaps list with due dates"
    ],
    "tools": [
      "get_workflow",
      "create_task",
      "list_tasks"
    ],
    "example": {
      "input": "Track Sam K, Culinary L2 apprentice Austin Central, started 2026-01-05, supervisor Ana. Required 300 hours, 5 modules. Done 120 hours. Modules knife 100 percent evidenced 2026-02-20, stocks 50 percent, pastry 0 percent, service 20 percent, safety 80 percent per supervisor log. Gaps pastry start due 2026-04-01, service evidence due 2026-03-31. Provider Austin Culinary College ref TBC by HR.",
      "output": "APPRENTICESHIP - Sam K - Culinary L2\nHours: 120 of 300 (40 percent); supervisor Ana.\nModules: knife 100 percent evidence 2026-02-20; stocks 50 percent; pastry 0 percent; service 20 percent; safety 80 percent.\nGaps: pastry start due 2026-04-01; service evidence due 2026-03-31.\nProvider: Austin Culinary College ref TBC by HR.\nStatus: on track pending pastry start."
    },
    "blockedExample": {
      "input": "Track apprenticeship. Program and hours missing.",
      "output": "TRACKER BLOCKED\nProgram unknown; hours unknown.\nSupply enrolment details before tracking."
    }
  },
  {
    "id": "banquet-event-order",
    "title": "Banquet event order",
    "zone": "Events and Banqueting",
    "summary": "Draft a banquet event order with timings, menus, and contacts.",
    "aliases": [
      "beo",
      "banquet-order"
    ],
    "coverageId": "banquet-event-order",
    "inputs": [
      "Event date, venue, covers, client contact",
      "Menu with courses and dietary flags",
      "Timings, staffing, and equipment needs"
    ],
    "outputs": [
      "BEO draft with timeline and responsibilities",
      "Client sign off blank"
    ],
    "tools": [
      "calculate_event_budget",
      "create_task",
      "get_workflow"
    ],
    "example": {
      "input": "BEO for Garcia wedding Austin Central hall 2026-05-02, 80 covers, USD, timezone America/Chicago. Contact L Garcia 555-0100. Menu soup (gluten unknown), chicken (dairy contains per label v4), dessert (nut may_contain per v4). Nut allergy 2 guests. Load in 14:00 Ben, setup check 17:00 Mara, dinner 19:00, load out 22:00. Equipment chafers 6 TBC hire, linen 10 tables confirmed.",
      "output": "BEO - Garcia Wedding - 2026-05-02 - 80 covers\nVenue Austin Central hall; contact L Garcia 555-0100; timezone America/Chicago.\nMenu: soup (gluten unknown), chicken (dairy contains per label v4), dessert (nut may_contain per v4). Nut allergy 2 guests flagged to head chef.\nTimeline: 14:00 load in Ben; 17:00 setup check Mara; 19:00 dinner service; 22:00 load out.\nEquipment: chafers 6 TBC hire; linen 10 tables confirmed.\nSign off: client ____ manager ____ date ____. Budget TBC via calculate_event_budget."
    },
    "blockedExample": {
      "input": "Draft BEO. Date, covers, and menu missing.",
      "output": "BEO BLOCKED\nDate unknown; covers unknown; menu unknown.\nSupply all three before drafting."
    }
  },
  {
    "id": "bar-cocktail-recipe-builder",
    "title": "Bar cocktail recipe builder",
    "zone": "Menu and Product Development",
    "summary": "Build cocktail specs with measures, costs, and responsible service notes.",
    "aliases": [
      "cocktail-builder",
      "bar-recipes"
    ],
    "coverageId": "bar-cocktail-recipe-builder",
    "inputs": [
      "Cocktail concept with glass and ice",
      "Measures in explicit units",
      "Bottle costs with volumes for costing"
    ],
    "outputs": [
      "Cocktail spec cards with cost",
      "Service notes"
    ],
    "tools": [
      "cost_recipe",
      "convert_quantity",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Build Garden Spritz for Austin Central, USD, highball glass, cubed ice. Measures 50 ml gin, 100 ml tonic, 10 ml syrup. Gin bottle 700 ml at 2400c. Tonic 1 L at 300c. Syrup 500 ml at 400c. Price 1200c confirmed.",
      "output": "COCKTAIL SPEC - Garden Spritz\nBuild: 50 ml gin; 100 ml tonic; 10 ml syrup; ice; glass highball.\nCost: gin 50/700*2400=171c; tonic 100/1000*300=30c; syrup 10/500*400=8c; total 209c. Math rounded half up.\nPrice: 1200c confirmed. Pour margin: 991c (82.6 percent) ingredient only.\nService: alcohol units unknown pending bottle ABV; verify ABV with bottle labels; age and service rules per local licence TBC by bar manager.\nStatus: draft pending bar manager."
    },
    "blockedExample": {
      "input": "Build cocktail. Measures in parts with no volume. Bottle costs missing.",
      "output": "COCKTAIL BLOCKED\nMeasures unknown volume; bottle costs unknown.\nSupply ml per part and bottle cost with volume. No spec issued."
    }
  },
  {
    "id": "burnout-stress-risk-assessment",
    "title": "Burnout stress risk assessment",
    "zone": "Wellbeing and Social Media",
    "summary": "Assess workload stress risks with controls and owners, no diagnosis.",
    "aliases": [
      "burnout-check",
      "stress-risk"
    ],
    "coverageId": "burnout-stress-risk-assessment",
    "inputs": [
      "Roles with hours and rotas",
      "Stress factors list",
      "Existing controls"
    ],
    "outputs": [
      "Risk table with scores and controls",
      "Review date"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Assess Austin Central Mar 2026. Grill 50h weeks, gaps Sat. Factors long hours L3xI2, heat L2xI2, noise L2xI1 per walkthrough 2026-03-05. Controls breaks every 4h, water station, ear protection available. Owner Ben. Review 2026-04-15 owner Mara. Support EAP verified 2026-01-01.",
      "output": "STRESS RISK - Austin Central - Mar 2026\nGrill long hours L3xI2=6 controls breaks every 4h owner Ben; add Sat cover TBC.\nHeat L2xI2=4 controls water station, fan hire TBC.\nNoise L2xI1=2 controls ear protection available.\nReview: 2026-04-15 owner Mara.\nNo individual diagnosis. Support via EAP verified."
    },
    "blockedExample": {
      "input": "Assess stress risk. Hours and factors missing.",
      "output": "RISK BLOCKED\nHours unknown; factors unknown.\nSupply both before scoring."
    }
  },
  {
    "id": "canape-reception-planner",
    "title": "Canape reception planner",
    "zone": "Events and Banqueting",
    "summary": "Plan canape volumes, costs, and service flow for receptions.",
    "aliases": [
      "canape-planner",
      "reception-planner"
    ],
    "coverageId": "canape-reception-planner",
    "inputs": [
      "Covers, duration, service style",
      "Canape list with portions per head",
      "Cost per canape with sources"
    ],
    "outputs": [
      "Volume and cost plan",
      "Service flow with timings"
    ],
    "tools": [
      "calculate_event_budget",
      "build_prep_plan",
      "cost_recipe"
    ],
    "example": {
      "input": "Plan reception for 60 covers, 2 hours, Austin Central USD 2026-04-15. Doors 18:00. Types bruschetta 3 per head at 80c vegetarian per chef, skewers 2 per head at 120c. Skewers gluten contains per label v4 TBC by buyer. Passes 18:15 bruschetta, 19:00 skewers, last call 19:45.",
      "output": "CANAPE PLAN - Reception - 2026-04-15\nVolumes: bruschetta 3 x 60 equals 180 pieces; skewers 2 x 60 equals 120 pieces; total 300 pieces.\nCost: bruschetta 180 x 80c equals 14400c; skewers 120 x 120c equals 14400c; total 28800c equals 288 dollars. Math verified.\nFlow: 18:00 doors; 18:15 pass 1 bruschetta; 19:00 pass 2 skewers; 19:45 last call.\nDietary: vegetarian bruschetta; allergen gluten contains per label v4 for skewers TBC.\nStatus: draft pending approval."
    },
    "blockedExample": {
      "input": "Plan canapes. Covers and pieces per head missing.",
      "output": "CANAPE BLOCKED\nCovers unknown; pieces per head unknown.\nSupply both before planning."
    }
  },
  {
    "id": "capacity-aware-prep",
    "title": "Capacity aware prep",
    "zone": "Kitchen Operations",
    "summary": "Plan prep that fits explicit oven, labor, and chill capacity.",
    "aliases": [
      "capacity-prep",
      "constrained-prep"
    ],
    "inputs": [
      "Prep demand with batches",
      "Resource intervals with units",
      "Requested units per resource"
    ],
    "outputs": [
      "Fit or overload verdict per resource",
      "Rescheduled plan when overloaded"
    ],
    "tools": [
      "validate_prep_capacity",
      "build_prep_plan",
      "create_task"
    ],
    "example": {
      "input": "Check prep Austin Central 2026-03-11. Oven available 14:00-18:00 equals 4h. Demand soup 1h plus bread 2h plus roast 2h equals 5h oven. Labor available 2 cooks 8h shifts equals 16 cook hours; demand soup 2h plus bread 4h plus roast 4h equals 10h. Roast movable to 11:00-13:00 gap or 2026-03-12 per rota; owner Ben to confirm.",
      "output": "CAPACITY - Austin Central - 2026-03-11\nOven: available 4h; requested 5h; verdict overload by 1h.\nLabor: available 16 cook hours; requested 10h; verdict fits.\nPlan: move roast to 11:00-13:00 gap or 2026-03-12; owner Ben to confirm.\nChill: TBC space check.\nStatus: blocked until oven reschedule confirmed."
    },
    "blockedExample": {
      "input": "Check capacity. Resource intervals missing.",
      "output": "CAPACITY BLOCKED\nIntervals unknown; units unknown.\nSupply per resource before checking."
    }
  },
  {
    "id": "catering-quotation",
    "title": "Catering quotation",
    "zone": "Events and Banqueting",
    "summary": "Quote catering with line costs, margin, validity, and exclusions.",
    "aliases": [
      "catering-quote",
      "quote"
    ],
    "inputs": [
      "Event date, covers, menu",
      "Line costs with sources and currency",
      "Margin target explicit",
      "Validity period and exclusions"
    ],
    "outputs": [
      "Quotation with lines and total",
      "Exclusions and validity notes"
    ],
    "tools": [
      "calculate_event_budget",
      "cost_recipe",
      "compare_purchase_costs"
    ],
    "example": {
      "input": "Quote Garcia wedding 80 covers 2026-05-02 Austin USD. Food 2400, staff 800, hire 400. Markup 20 percent on cost (not a 20 percent margin on sales). Quote date 2026-03-10 valid 14 days to 2026-03-24. Excludes flowers, DJ, venue hire, card fees. Terms 50 percent deposit TBC by finance, balance 7 days before.",
      "output": "QUOTE - Garcia - Wedding 2026-05-02 - valid 2026-03-10 to 2026-03-24 - USD\nLines: food 80 x 30 equals 2400; staff 800; hire 400; subtotal 3600 dollars.\nMarkup: 20 percent on cost equals 720 dollars. Math: 3600*.2=720. Sales contribution margin is 720/4320 = 16.7 percent, not 20 percent.\nTotal: 4320 dollars. Per head: 54 dollars.\nExclusions: flowers, DJ, venue hire, card fees.\nTerms: 50 percent deposit TBC by finance; balance 7 days before.\nStatus: draft for manager; not sent."
    },
    "blockedExample": {
      "input": "Quote catering. Covers and line costs missing.",
      "output": "QUOTE BLOCKED\nCovers unknown; costs unknown.\nSupply both before quoting."
    }
  },
  {
    "id": "chef-personal-brand-builder",
    "title": "Chef personal brand builder",
    "zone": "Wellbeing and Social Media",
    "summary": "Build a chef bio and content pillars from verified facts only.",
    "aliases": [
      "personal-brand",
      "chef-brand"
    ],
    "coverageId": "chef-personal-brand-builder",
    "inputs": [
      "Career facts with dates and venues",
      "Specialties with evidence",
      "Goals and channels"
    ],
    "outputs": [
      "Bio drafts short and long",
      "Content pillars with examples"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Build brand for Ana R, sous Austin Central since 2024. Specialty stocks and allergen care evidenced by leading stocks and owning allergen matrix v4. Trains new starters and runs close downs. Goal team hiring posts on Instagram. Cadence 1 post weekly Tue. Awards none.",
      "output": "BRAND - Ana R\nBio short: Ana R is sous chef at Austin Central since 2024. She leads stocks and allergen safe prep. She trains new starters with calm clear demos.\nBio long: Ana R is sous chef at Austin Central since 2024. She leads stocks, owns allergen matrix v4, and runs close downs. She trains new starters weekly. She posts kitchen craft and hiring stories, not personal data.\nPillars: 1 stock craft demos; 2 allergen care explainers; 3 trainee wins with consent.\nCadence: 1 post weekly Tue. Awards: none claimed.\nStatus: draft for Ana."
    },
    "blockedExample": {
      "input": "Build brand. Facts and goals missing.",
      "output": "BRAND BLOCKED\nFacts unknown; goals unknown.\nSupply verified facts and goals first."
    }
  },
  {
    "id": "chef-wellbeing-check-in",
    "title": "Chef wellbeing check in",
    "zone": "Wellbeing and Social Media",
    "summary": "Run a private wellbeing check in with support options and no diagnosis.",
    "aliases": [
      "wellbeing-check",
      "chef-checkin"
    ],
    "coverageId": "chef-wellbeing-check-in",
    "inputs": [
      "Check in date and volunteer lead",
      "Support resources list verified",
      "Privacy rules"
    ],
    "outputs": [
      "Check in guide with prompts",
      "Support sheet"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Check in for Austin Central Mar 2026. Lead Mara. Resources EAP 1-800-555-0100 verified 2026-01-01, local clinic TBC, manager rota review, time off process per handbook v3. Privacy voluntary, no notes without consent, no sharing with team. Follow up only if requested via Mara.",
      "output": "CHECK IN - Mar 2026 - Austin Central\nPrompts: How has your week been; What would help next week; Anything blocking rest.\nSupport: EAP 1-800-555-0100 verified 2026-01-01; local clinic TBC; manager rota review; time off process per handbook v3.\nPrivacy: voluntary; no notes without consent; no sharing with team.\nFollow up: only if requested; contact Mara directly.\nNo diagnosis given. No medical advice."
    },
    "blockedExample": {
      "input": "Run check in. Lead and resources missing.",
      "output": "CHECK BLOCKED\nLead unknown; resources unknown.\nSupply both before offering check ins."
    }
  },
  {
    "id": "complaint-handling-resolution-log",
    "title": "Complaint handling resolution log",
    "zone": "FOH and Guest Experience",
    "summary": "Log complaints with facts, recovery, and follow up owners.",
    "aliases": [
      "complaint-log",
      "resolution-log"
    ],
    "coverageId": "complaint-handling-resolution-log",
    "inputs": [
      "Complaint date, channel, guest ref",
      "Facts observed with order refs",
      "Recovery offered with approver"
    ],
    "outputs": [
      "Complaint log with status",
      "Follow up tasks"
    ],
    "tools": [
      "create_task",
      "list_tasks",
      "get_workflow"
    ],
    "example": {
      "input": "Log complaint 2026-03-10 table 12 cold soup per FOH note 19:40. Order 441 fired 19:05 served 19:35 per POS; pass delay noted Ben; soup temp unknown no probe. Recovery dessert comp 900c approved Mara 19:45. Follow up email apology owner Mara due 2026-03-12.",
      "output": "COMPLAINT - C-2026-0310-12 - 2026-03-10\nFacts: order 441 fired 19:05 served 19:35 per POS; soup temp unknown no probe; kitchen pass delay noted Ben.\nGuest words: cold soup per FOH note 19:40; full quote TBC.\nRecovery: dessert comp 900c approved Mara 19:45.\nFollow up: email apology owner Mara due 2026-03-12.\nStatus: open pending follow up."
    },
    "blockedExample": {
      "input": "Log complaint. Date, order ref, and facts missing.",
      "output": "COMPLAINT BLOCKED\nDate unknown; order unknown; facts unknown.\nSupply refs before logging."
    }
  },
  {
    "id": "corporate-event-menu-planner",
    "title": "Corporate event menu planner",
    "zone": "Events and Banqueting",
    "summary": "Plan corporate menus with budgets, timings, and dietary cover.",
    "aliases": [
      "corporate-menu",
      "event-menu-planner"
    ],
    "coverageId": "corporate-event-menu-planner",
    "inputs": [
      "Event date, covers, budget per head",
      "Menu options with costs",
      "Dietary counts with sources"
    ],
    "outputs": [
      "Menu recommendation with budget fit",
      "Dietary cover note"
    ],
    "tools": [
      "calculate_event_budget",
      "cost_recipe",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Plan TechConf dinner 2026-04-11, 100 covers, USD budget 45 dollars per head. Option A 38 dollars, Option B 47 dollars. Dietary 10 vegetarian per client email; Option B adds vegan cover. Timings 3 courses in 90 min; kitchen capacity confirmed Ben. Dessert upgrade 3 dollars TBC.",
      "output": "CORPORATE MENU - TechConf Dinner - 2026-04-11\nOption A: 38 dollars per head, under budget by 7 dollars; dietary vegetarian covered 10.\nOption B: 47 dollars per head, over by 2 dollars; dietary covered plus vegan.\nRecommend: Option A for budget fit; upgrade dessert TBC costs 3 dollars extra.\nTimings: 3 courses in 90 min fits kitchen capacity per Ben.\nStatus: draft for client."
    },
    "blockedExample": {
      "input": "Plan corporate menu. Budget and covers missing.",
      "output": "MENU BLOCKED\nBudget unknown; covers unknown.\nSupply both before costing options."
    }
  },
  {
    "id": "coshh-chemical-safety",
    "title": "COSHH chemical safety",
    "zone": "Kitchen Operations",
    "summary": "Draft chemical handling sheets from supplier SDS and the verified local plan.",
    "aliases": [
      "coshh",
      "chemical-safety"
    ],
    "coverageId": "coshh-chemical-safety",
    "inputs": [
      "Chemical list with supplier SDS versions",
      "Storage and dilution per SDS",
      "Verified local plan reference"
    ],
    "outputs": [
      "Handling sheet per chemical with PPE and first aid refs",
      "Storage map notes"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Draft sheet for degreaser ProKleen, SDS v5 dated 2025-11-01, Austin Central. Storage per SDS locked cage away from food section 7. PPE per SDS gloves and goggles section 8. Dilution per SDS section 9 label. First aid section 4, spill section 6. Local plan safety plan v1.3. Assembly per fire plan v1.2. Review 2026-09-01 owner Ben.",
      "output": "CHEMICAL SHEET - ProKleen Degreaser - SDS v5 2025-11-01\nStorage: locked cage, away from food, per SDS section 7; plan ref safety plan v1.3.\nPPE: gloves and goggles per SDS section 8.\nDilution: per SDS section 9 label; no kitchen jug guesswork.\nSpill and first aid: per SDS section 4 and 6; notify manager; assembly per fire plan v1.2.\nReview: 2026-09-01 owner Ben. Status: draft pending manager."
    },
    "blockedExample": {
      "input": "Draft sheet for degreaser. SDS missing.",
      "output": "CHEMICAL BLOCKED\nSDS unknown for degreaser; supply supplier SDS version.\nNo handling sheet issued. No PPE guessed."
    }
  },
  {
    "id": "daily-brief-generator",
    "title": "Daily brief generator",
    "zone": "Kitchen Operations",
    "summary": "Draft a concise daily service brief with covers, prep, staffing, and risks.",
    "aliases": [
      "daily-brief",
      "service-brief"
    ],
    "coverageId": "daily-brief-generator",
    "inputs": [
      "Service date, site, timezone",
      "Covers forecast with source",
      "Prep status and staffing roster",
      "Known risks and VIP notes"
    ],
    "outputs": [
      "One page service brief draft",
      "Open actions with owners"
    ],
    "tools": [
      "list_tasks",
      "get_workflow",
      "list_workflows"
    ],
    "example": {
      "input": "Brief for Austin Central 2026-03-11 lunch, America/Chicago. Forecast 90 covers per SevenRooms export 2026-03-10 18:00. Prep tomato soup 8 servings done, sourdough 40 portions outstanding owner Ben due 11:00. Staffing saute Ana, pastry Cara, grill gap TBC owner head chef. Nut allergy table 8 per host note; kitchen controls per verified plan v2.1. Actions 10:30 confirm grill cover, 11:00 sourdough check, 11:30 allergy brief with FOH.",
      "output": "DAILY BRIEF - Austin Central - 2026-03-11 lunch (America/Chicago)\nCovers: 90 lunch, source SevenRooms export 2026-03-10 18:00.\nPrep done: tomato soup 8 servings; Prep outstanding: sourdough 40 portions owner Ben due 11:00.\nStaffing: saute Ana, pastry Cara, grill gap TBC owner head chef.\nRisks: nut allergy table 8, allergen contains tree_nut per host note, kitchen controls per verified plan v2.1; grill short staffed.\nActions timed: 10:30 confirm grill cover; 11:00 sourdough check; 11:30 allergy brief with FOH."
    },
    "blockedExample": {
      "input": "Brief for 2026-03-11. Covers forecast missing. Staffing roster missing.",
      "output": "BRIEF BLOCKED - 2026-03-11\nCovers forecast unknown; supply source and number.\nStaffing roster unknown; supply names per station.\nNo brief issued. No figures invented."
    }
  },
  {
    "id": "daily-close-review",
    "title": "Daily close review",
    "zone": "Kitchen Operations",
    "summary": "Close the day with explicit task states, decided approvals, and a tomorrow prep list.",
    "aliases": [
      "close",
      "daily-close",
      "end-of-service-report"
    ],
    "coverageId": "end-of-service-report",
    "inputs": [
      "Service date and site timezone",
      "Task list with current states",
      "Approval list with decisions or pending state",
      "Tomorrow covers forecast if known"
    ],
    "outputs": [
      "Close summary with resolved and blocked items",
      "Tomorrow prep task list with owners"
    ],
    "tools": [
      "list_tasks",
      "set_task_state",
      "list_approvals",
      "decide_approval"
    ],
    "example": {
      "input": "Close 2026-03-10 for Austin Central site, timezone America/Chicago, currency USD. Tasks: deep clean fryer completed by Ana, sharps log completed by Ben, walk in count blocked waiting on thermometer delivery owner Ben due 2026-03-11. Approval: comp dessert for table 12 approved by Mara. Tomorrow: 80 covers forecast; prep tomato soup 2 batches 8 servings owner Ana, sourdough 40 portions owner Ben, stock count TBC owner unassigned.",
      "output": "CLOSE SUMMARY - Austin Central - 2026-03-10 (America/Chicago)\nCurrency: USD. Commercial target: not applicable to close; labor target TBC, roster unverified.\nTasks completed (2): deep clean fryer by Ana 2026-03-10; sharps log by Ben 2026-03-10.\nTasks blocked (1): walk in count, reason thermometer delivery delayed, owner Ben, due 2026-03-11.\nApprovals decided (1): comp dessert table 12, approved by Mara 2026-03-10.\nApprovals pending (0).\nTomorrow prep: tomato soup 2 batches (8 servings) owner Ana; sourdough 40 portions owner Ben; stock count TBC owner unassigned.\nOpen risks: thermometer delivery unknown; allergen states unknown pending label check for all dishes."
    },
    "blockedExample": {
      "input": "Close 2026-03-10 for Austin Central. Task list provided without states. Approval list missing decider names.",
      "output": "CLOSE BLOCKED - Austin Central - 2026-03-10\nCannot close: 3 tasks have unknown states (deep clean fryer, sharps log, walk in count).\nCannot close: 1 approval missing decider (comp dessert table 12).\nAction: operator to confirm each task state and each decider name.\nNo tasks auto completed. No approvals auto decided. Tomorrow prep withheld pending confirmed close."
    }
  },
  {
    "id": "data-reconciliation",
    "title": "Data reconciliation: resolve conflicts",
    "zone": "Connected Workflows",
    "summary": "Resolve missing fields and version conflicts between current and incoming records.",
    "aliases": [
      "reconciliation",
      "conflicts"
    ],
    "inputs": [
      "Incoming payload in JSON or CSV",
      "Current record versions from preview conflicts",
      "Explicit currency and unit for each record"
    ],
    "outputs": [
      "Conflict report with field level diffs",
      "Commit plan with exact versions to write"
    ],
    "tools": [
      "preview_import",
      "commit_import",
      "validate_kitchen_data",
      "list_recipes",
      "lookup_recipe"
    ],
    "example": {
      "input": "Reconcile supplier file 2026-03-10.csv for Austin Central, USD, metric. Incoming tomato purchase 850c per 1 kg effective 2026-03-10. Stored tomato purchase is 800c v3. Onion matches stored v2. Operator choice recorded incoming for tomato per supplier letter 2026-03-08; commit still needs explicit confirm.",
      "output": "RECONCILIATION REPORT - 2026-03-10\nIncoming: 2026-03-10.csv, 2 rows, currency USD, units kg.\nConflict 1: syn_buy_tomato costCents current 800 v3 vs incoming 850 vNew; operator chose incoming, reason supplier letter 2026-03-08.\nNo conflict: syn_buy_onion matches v2.\nValidation: valid true, no cycles, currencies consistent.\nCommit plan: syn_buy_tomato to v4 at 850c, syn_buy_onion stays v2.\nResult: preview only; awaiting operator confirm to commit. No records written yet."
    },
    "blockedExample": {
      "input": "Reconcile file 2026-03-10.csv. Incoming tomato version states base v2 but stored is v3. Currency column missing for onion row.",
      "output": "RECONCILIATION BLOCKED - 2026-03-10\nStale version: incoming tomato base v2 does not match stored v3; re preview required.\nMissing data: onion row currency unknown; supply explicit currency code.\nNo commit performed. No versions overwritten."
    }
  },
  {
    "id": "dietary-requirements-tracker",
    "title": "Dietary requirements tracker",
    "zone": "Events and Banqueting",
    "summary": "Track per guest dietary needs with sources and kitchen actions.",
    "aliases": [
      "dietary-tracker",
      "dietary-log"
    ],
    "coverageId": "dietary-requirements-tracker",
    "inputs": [
      "Guest list with requirements and sources",
      "Menu mapping per requirement",
      "Service date and meal"
    ],
    "outputs": [
      "Tracker with actions per guest",
      "Unresolved flags"
    ],
    "tools": [
      "validate_kitchen_data",
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Track Garcia wedding 2026-05-02. Guest A nut allergy per client email 2026-04-01. Guest B gluten free per RSVP 2026-04-05. Menu soup chicken dessert. Adaptations dessert fruit plate for Guest A separate prep owner Cara; soup without bread for Guest B. Gluten unknown pending mill letter. Unresolved Guest B celiac vs preference confirm on day owner FOH lead. Brief pre service 18:00 with matrix v4.",
      "output": "DIETARY TRACKER - Garcia Wedding - 2026-05-02\nGuest A nut allergy per client email 2026-04-01: dish adapted dessert fruit plate; action separate prep owner Cara; state tree_nut contains risk may_contain per kitchen.\nGuest B gluten free per RSVP 2026-04-05: dish soup without bread; allergen gluten unknown pending mill letter, do not claim free.\nUnresolved: confirm Guest B celiac vs preference on day owner FOH lead.\nBrief: pre service 18:00 with matrix v4."
    },
    "blockedExample": {
      "input": "Track dietary. Guest list and sources missing.",
      "output": "TRACKER BLOCKED\nGuests unknown; sources unknown.\nSupply sourced list before mapping."
    }
  },
  {
    "id": "disciplinary-documentation-helper",
    "title": "Disciplinary documentation helper",
    "zone": "People and Training",
    "summary": "Structure factual disciplinary notes with process steps left for HR.",
    "aliases": [
      "disciplinary-notes",
      "hr-documentation"
    ],
    "coverageId": "disciplinary-documentation-helper",
    "inputs": [
      "Incident dates and factual observations",
      "Policy reference with version",
      "Witnesses and evidence list"
    ],
    "outputs": [
      "Factual note draft with process checklist",
      "Decision and appeal blanks for HR"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Note for Austin Central 2026-03-09. Observed late arrivals per clock log 09:12 on 2026-03-03, 09:20 on 2026-03-06, 09:15 on 2026-03-09 vs 09:00 start; reporter Ben. Policy attendance v3 section 2. Witness roster Ben. No decision requested.",
      "output": "FACTUAL NOTE - 2026-03-09 - confidential\nFacts: clock log shows arrivals 09:12 on 2026-03-03, 09:20 on 2026-03-06, 09:15 on 2026-03-09 vs 09:00 start; reporter Ben.\nPolicy: attendance policy v3 section 2.\nWitnesses: clock log; roster Ben.\nProcess: invite ____ meeting ____ decision ____ appeal ____ all blank for HR.\nNo sanction suggested. No conclusions drawn. Forward to HR."
    },
    "blockedExample": {
      "input": "Draft disciplinary note. Facts and policy missing.",
      "output": "NOTE BLOCKED\nFacts unknown; policy ref unknown.\nSupply dated facts and policy version. No note drafted."
    }
  },
  {
    "id": "dish-development-brief",
    "title": "Dish development brief",
    "zone": "Menu and Product Development",
    "summary": "Brief a new dish with concept, cost guardrails, and test plan.",
    "aliases": [
      "dish-brief",
      "development-brief"
    ],
    "coverageId": "dish-development-brief",
    "inputs": [
      "Concept and inspiration with sources",
      "Target cost and price guardrails",
      "Test dates and tasters"
    ],
    "outputs": [
      "Development brief with test plan",
      "Cost guardrail sheet"
    ],
    "tools": [
      "cost_recipe",
      "compare_purchase_costs",
      "create_task"
    ],
    "example": {
      "input": "Brief charred leek starter for Austin Central, brief date 2026-03-10. Concept charred leek, romesco, hazelnut; 150 g portion; starter. Target cost under 400c, price 1400c TBC. Quotes leek 350c per kg GreenFarm 2026-03-01; hazelnut TBC. Tests R1 2026-03-15 tasters Mara Ben criteria taste and portion; R2 2026-03-18 criteria cost under 400c and pick up under 6 min.",
      "output": "DISH BRIEF - Charred Leek Starter - 2026-03-10\nConcept: charred leek, romesco, hazelnut; 150 g portion; starter.\nGuardrails: cost under 400c; price 1400c TBC unconfirmed; margin TBC until price confirmed.\nTests: R1 2026-03-15 tasters Mara Ben criteria taste and portion; R2 2026-03-18 criteria cost under 400c and pick up under 6 min.\nQuotes: leek 350c per kg GreenFarm 2026-03-01; hazelnut TBC.\nStatus: draft pending head chef."
    },
    "blockedExample": {
      "input": "Brief new dish. Concept and guardrails missing.",
      "output": "BRIEF BLOCKED\nConcept unknown; guardrails unknown.\nSupply both before briefing."
    }
  },
  {
    "id": "equipment-maintenance-log",
    "title": "Equipment maintenance log",
    "zone": "Kitchen Operations",
    "summary": "Log equipment faults, service visits, and due dates with owners.",
    "aliases": [
      "equipment-log",
      "maintenance-log"
    ],
    "coverageId": "equipment-maintenance-log",
    "inputs": [
      "Equipment list with IDs and locations",
      "Fault reports with dates and symptoms",
      "Service provider details if known"
    ],
    "outputs": [
      "Maintenance log with status per item",
      "Due service reminders"
    ],
    "tools": [
      "create_task",
      "list_tasks",
      "get_workflow"
    ],
    "example": {
      "input": "Log for Austin Central 2026-03-10. Fryer F1 main line fault slow recovery reported Ana 2026-03-09. Service due per manual 2026-04-01. Provider RapidServe TBC. Action task for Ben to book service.",
      "output": "EQUIPMENT LOG - Austin Central - 2026-03-10\nF1 fryer main line: status fault, symptom slow recovery, reporter Ana 2026-03-09.\nService: last visit unknown; next due 2026-04-01 per manual; provider RapidServe TBC.\nAction: task for Ben to book service; do not use beyond safe limit per manual.\nOverdue: none yet."
    },
    "blockedExample": {
      "input": "Log equipment. IDs and fault dates missing.",
      "output": "LOG BLOCKED\nEquipment IDs unknown; fault dates unknown.\nSupply both before logging. No entries invented."
    }
  },
  {
    "id": "event-catering-brief",
    "title": "Event catering brief",
    "zone": "Events and Banqueting",
    "summary": "Brief event catering with menu, volumes, and service style.",
    "aliases": [
      "catering-brief",
      "event-brief"
    ],
    "coverageId": "event-catering-brief",
    "inputs": [
      "Event date, covers, service style",
      "Menu with volumes per item",
      "Site constraints and access times"
    ],
    "outputs": [
      "Catering brief draft with volumes",
      "Prep and staffing asks"
    ],
    "tools": [
      "build_prep_plan",
      "calculate_event_budget",
      "create_task"
    ],
    "example": {
      "input": "Brief TechConf lunch Austin Central 2026-04-10, 120 covers, buffet, USD. Items soup 250 ml, rolls 1 each. Access 08:00 to 15:00. Soup batch 3.75 L, 8 batches by 2026-04-09 owner Ana; rolls confirm bakery TBC. Service buffet 12:00-13:30; 2 servers TBC; chafers 4. Site hall A load bay 2 power 2 sockets. Dietary vegetarian 15, gluten free 5 per client 2026-03-20; verify on day.",
      "output": "CATERING BRIEF - TechConf Lunch - 2026-04-10\nVolumes: soup 250 ml x 120 equals 30 L; rolls 1 x 120 equals 120 rolls.\nPrep: soup 8 batches by 2026-04-09 owner Ana; rolls confirm bakery TBC.\nService: buffet 12:00-13:30; 2 servers TBC; chafers 4.\nSite: hall A access 08:00-15:00; load bay 2; power 2 sockets.\nDietary: vegetarian 15, gluten free 5 per client 2026-03-20; verify on day.\nStatus: draft pending head chef."
    },
    "blockedExample": {
      "input": "Brief catering. Covers and menu missing.",
      "output": "BRIEF BLOCKED\nCovers unknown; menu unknown.\nSupply both before computing volumes."
    }
  },
  {
    "id": "event-equipment-kit-list",
    "title": "Event equipment kit list",
    "zone": "Events and Banqueting",
    "summary": "List event equipment with quantities, sources, and transport.",
    "aliases": [
      "kit-list",
      "equipment-kit"
    ],
    "coverageId": "event-equipment-kit-list",
    "inputs": [
      "Event date, venue, covers",
      "Menu service needs",
      "House vs hire split"
    ],
    "outputs": [
      "Kit list with qty and source",
      "Transport and return plan"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Kit for TechConf lunch off site 2026-04-10, 120 covers, buffet. Need 4 chafers house, 2 cambros house, 20 serving spoons house, 120 plates hire quote 60 dollars TBC. Van available load 09:00 Ben; return 15:30; full clean Austin Central 16:00. Venue power 2 sockets confirmed; water TBC.",
      "output": "KIT LIST - TechConf Lunch - 2026-04-10\nItems: 4 chafers house; 2 cambros house; 20 serving spoons house; 120 plates hire 60 dollars TBC quote.\nTransport: van load 09:00 Ben; return 15:30.\nReturn: wash on site, full clean Austin Central 16:00.\nPower: venue 2 sockets confirmed; water TBC.\nStatus: draft pending manager."
    },
    "blockedExample": {
      "input": "List kit. Venue and covers missing.",
      "output": "KIT BLOCKED\nVenue unknown; covers unknown.\nSupply both before listing."
    }
  },
  {
    "id": "event-run-of-show",
    "title": "Event run of show",
    "zone": "Events and Banqueting",
    "summary": "Build a minute by minute run of show with cues and owners.",
    "aliases": [
      "run-of-show",
      "event-timeline"
    ],
    "coverageId": "event-run-of-show",
    "inputs": [
      "Event date and venue",
      "Cues with times and owners",
      "Contacts and comms channel"
    ],
    "outputs": [
      "Run of show table draft",
      "Contingency notes"
    ],
    "tools": [
      "get_workflow",
      "create_task",
      "list_tasks"
    ],
    "example": {
      "input": "Run of show for Garcia wedding 2026-05-02 Austin Central v1. Cues 18:30 doors owner FOH lead, 19:00 first course fire owner Ben, 20:00 speeches mic cue owner Mara caller, 21:00 dessert fire owner Cara. Contacts FOH lead TBC, DJ TBC. Contingency speeches overrun plus 15 min pushes dessert; rain plan hall B confirmed. Comms radios channel 2.",
      "output": "RUN OF SHOW - Garcia Wedding - 2026-05-02 v1\n18:30 doors open owner FOH lead; 19:00 fire first course owner Ben; 20:00 speeches mic cue owner Mara; 21:00 dessert fire owner Cara.\nContacts: Mara caller, Ben kitchen, FOH lead TBC, DJ TBC.\nContingency: speeches overrun plus 15 min pushes dessert; rain plan hall B confirmed.\nComms: radios channel 2. Status: draft pending event manager."
    },
    "blockedExample": {
      "input": "Build run of show. Cues and caller missing.",
      "output": "RUN BLOCKED\nCues unknown; show caller unknown.\nSupply both before sequencing."
    }
  },
  {
    "id": "event-staffing-plan",
    "title": "Event staffing plan",
    "zone": "Events and Banqueting",
    "summary": "Plan event staffing by role, time, and cost with explicit rates.",
    "aliases": [
      "event-staffing",
      "event-rota"
    ],
    "coverageId": "event-staffing-plan",
    "inputs": [
      "Event date, hours, covers",
      "Roles with counts and rates",
      "Agency vs house split"
    ],
    "outputs": [
      "Staffing grid with hours and cost",
      "Gaps list"
    ],
    "tools": [
      "calculate_event_budget",
      "create_task"
    ],
    "example": {
      "input": "Staff TechConf lunch 2026-04-10, 6 hours, USD. Roles 2 cooks at 25 dollars per h, 2 servers at 20 dollars per h.",
      "output": "EVENT STAFFING - TechConf - 2026-04-10\nCooks: 2 x 6h x 25 equals 300 dollars. Servers: 2 x 6h x 20 equals 240 dollars.\nTotal staffing: 540 dollars USD. Math: 300+240=540.\nGaps: server shortfall TBC owner event manager.\nAgency fees: none quoted; TBC if agency used.\nStatus: draft pending approval."
    },
    "blockedExample": {
      "input": "Plan staffing. Roles and rates missing.",
      "output": "STAFFING BLOCKED\nRoles unknown; rates unknown.\nSupply both before costing."
    }
  },
  {
    "id": "foh-service-brief",
    "title": "FOH service brief",
    "zone": "FOH and Guest Experience",
    "summary": "Brief front of house with menu, allergens, VIPs, and timings.",
    "aliases": [
      "foh-brief",
      "floor-brief"
    ],
    "coverageId": "foh-service-brief",
    "inputs": [
      "Service date and covers",
      "Menu with 86s and allergens",
      "VIPs and occasions",
      "Section assignments"
    ],
    "outputs": [
      "FOH brief sheet draft",
      "Allergen call list"
    ],
    "tools": [
      "get_workflow",
      "list_tasks",
      "create_task"
    ],
    "example": {
      "input": "Brief dinner 2026-03-11 Austin Central, 90 covers. Menu soup 1000c, fish 2400c, dessert 900c. 86 dessert nut variant. Allergens fish contains per v4, dessert may_contain nut per v4, soup gluten unknown. VIP table 8 nut allergy per host note 2026-03-11 10:00; action allergy call to Ana before fire. Sections A Ana tables 1-6, B Ben 7-12. Pre shift 17:30.",
      "output": "FOH BRIEF - 2026-03-11 dinner - 90 covers\nMenu: soup 1000c; fish 2400c; dessert 900c; 86 nut dessert variant.\nAllergens: fish contains per v4; dessert may_contain nut per v4; soup gluten unknown flag to kitchen.\nVIPs: table 8 nut allergy per host note 2026-03-11 10:00; action allergy call to Ana before fire.\nSections: A Ana tables 1-6; B Ben 7-12.\nCalls: allergy call phrase Table 8 nut allergy confirm with kitchen.\nStatus: ready for pre shift 17:30."
    },
    "blockedExample": {
      "input": "Brief FOH. Menu and allergen versions missing.",
      "output": "BRIEF BLOCKED\nMenu unknown; allergen versions unknown.\nSupply both before briefing."
    }
  },
  {
    "id": "food-safety-incident-report",
    "title": "Food safety incident report",
    "zone": "Kitchen Operations",
    "summary": "Record a food safety incident with facts, actions, and notifications.",
    "aliases": [
      "incident-report",
      "food-incident"
    ],
    "coverageId": "food-safety-incident-report",
    "inputs": [
      "Incident date, time, site, reporter",
      "Facts observed with quantities and people affected",
      "Immediate actions taken and notifications"
    ],
    "outputs": [
      "Incident report draft with timeline",
      "Follow up tasks with owners"
    ],
    "tools": [
      "create_task",
      "list_tasks",
      "get_workflow"
    ],
    "example": {
      "input": "Incident Austin Central 2026-03-10 19:20 America/Chicago. Reporter Ana. Cold store door left open 30 min, 5 kg dairy exposed. Moved to backup chiller 19:50 by Ana and Ben. Manager Mara notified 20:00. No illness reported. Plan HACCP v2.1 section 9. Follow up task Mara dairy disposal, task Ben door seal.",
      "output": "INCIDENT REPORT - Austin Central - 2026-03-10 19:20 America/Chicago\nFacts: cold store door open approx 30 min; 5 kg dairy exposed; ambient unknown.\nAffected: 0 illness reported; 5 kg dairy on hold pending decision.\nActions: 19:50 moved dairy to backup chiller by Ana and Ben.\nNotified: Mara 20:00; EHO notification TBC by manager.\nPlan ref: HACCP v2.1 section 9.\nFollow up: task for Mara to decide dairy disposal; task for Ben to check door seal. Cause TBC by investigation."
    },
    "blockedExample": {
      "input": "Report incident. Date, reporter, and facts missing.",
      "output": "INCIDENT BLOCKED\nDate unknown; reporter unknown; facts unknown.\nSupply observed facts before drafting. No report invented."
    }
  },
  {
    "id": "food-truck-event-profitability",
    "title": "Food truck event profitability",
    "zone": "Events and Banqueting",
    "summary": "Model food truck event profit with explicit revenue, costs, and target.",
    "aliases": [
      "truck-profit",
      "food-truck-pnl"
    ],
    "inputs": [
      "Event date, hours, location fees",
      "Revenue lines with covers and prices",
      "Cost lines with currency, unknowns flagged",
      "Commercial target explicit"
    ],
    "outputs": [
      "Profit model with margin percent",
      "Break even covers"
    ],
    "tools": [
      "calculate_event_budget",
      "cost_recipe",
      "compare_purchase_costs"
    ],
    "example": {
      "input": "Model South Congress fair Austin 2026-04-18, 8 hours, USD. Revenue 3000 from 300 covers at 10 dollars. Costs food 900, staff 600, fuel 150, pitch 300. Napkins unknown owner Ben; card fees unknown. Target margin 30 percent.",
      "output": "TRUCK PNL - South Congress Fair - 2026-04-18 - USD\nRevenue: 300 covers x 10 equals 3000 dollars.\nCosts known: food 900 plus staff 600 plus fuel 150 plus pitch 300 equals 1950 dollars.\nUnknowns: napkins TBC owner Ben; card fees TBC, excluded from total.\nUpper-bound contribution before missing nonnegative costs: 3000 minus 1950 equals 1050 dollars (35.0 percent) on known costs only.\nTarget 30 percent: known-cost margin is 5 points above target; verdict withheld until napkins and card fees are known.\nLower-bound break even on known costs: fixed 1050 (staff fuel pitch) divided by contribution 7 per cover (10 minus 3 food) equals 150 covers; excludes napkins and card fees. Complete break-even is unknown until those costs are supplied.\nStatus: draft for owner."
    },
    "blockedExample": {
      "input": "Model truck event. Revenue and pitch fee missing.",
      "output": "TRUCK BLOCKED\nRevenue unknown; pitch fee unknown.\nSupply both before modelling."
    }
  },
  {
    "id": "guest-feedback-analyser",
    "title": "Guest feedback analyser",
    "zone": "FOH and Guest Experience",
    "summary": "Analyse guest feedback into themes with counts and actions.",
    "aliases": [
      "feedback-analysis",
      "guest-feedback"
    ],
    "coverageId": "guest-feedback-analyser",
    "inputs": [
      "Feedback exports with dates and sources",
      "Rating scale definition",
      "Covers for the period"
    ],
    "outputs": [
      "Theme table with counts",
      "Actions with owners"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Analyse Mar 1 to 7 2026 Austin Central, 40 surveys, Google 25 and cards 15, covers 600. Ratings sum 180 scale 1 to 5. Themes soup praise 15 IDs G1-G15, slow coffee 8 IDs incl G3 G9, noise 3, other 14. Actions coffee station review owner Ben due 2026-03-20; soup keep spec owner Ana.",
      "output": "FEEDBACK - Mar 1-7 2026 - 40 responses\nRatings: avg 4.5. Math: 180/40=4.5.\nThemes: soup praise 15 IDs G1-G15; slow coffee 8 IDs G3 G9 plus 6; noise 3; other 14.\nSources: Google 25; cards 15.\nActions: coffee station review owner Ben due 2026-03-20; soup keep spec owner Ana.\nCaveats: 40 of 600 covers 6.7 percent response.\nStatus: draft for manager."
    },
    "blockedExample": {
      "input": "Analyse feedback. Exports and scale missing.",
      "output": "FEEDBACK BLOCKED\nExports unknown; scale unknown.\nSupply both before analysis."
    }
  },
  {
    "id": "haccp-checklist-generator",
    "title": "HACCP checklist generator",
    "zone": "Kitchen Operations",
    "summary": "Generate a service HACCP checklist from the verified local plan only.",
    "aliases": [
      "haccp-checklist",
      "haccp-tasks"
    ],
    "coverageId": "haccp-checklist-generator",
    "inputs": [
      "Verified HACCP plan version and date",
      "Service date and areas in scope",
      "Responsible roles per check"
    ],
    "outputs": [
      "Timed checklist with sign off blanks",
      "Corrective action prompts"
    ],
    "tools": [
      "get_workflow",
      "create_task",
      "list_tasks"
    ],
    "example": {
      "input": "Generate checklist for Austin Central 2026-03-11. Plan HACCP v2.1 dated 2026-01-15. Areas cold store, cook, hold. Roles Ana cold, Ben cook. Checks 08:00 cold store temp per section 4; 12:00 cook temp verify per section 6; 18:00 hold check per section 7. Corrective per section 9. Allergen controls per matrix v4.",
      "output": "HACCP CHECKLIST - Austin Central - 2026-03-11 - plan v2.1 2026-01-15\n08:00 cold store temp check per plan section 4, role Ana, reading ____ sign ____.\n12:00 cook temp verify per plan section 6, role Ben, reading ____ sign ____.\n18:00 hold check per plan section 7, role TBC, reading ____ sign ____.\nCorrective: per plan section 9; log incident and notify manager.\nLimits: per plan v2.1 only; not restated here. Allergen controls per matrix v4."
    },
    "blockedExample": {
      "input": "Generate checklist. Plan version missing.",
      "output": "HACCP BLOCKED\nVerified plan reference unknown; supply version and date.\nNo checklist issued. No limits invented."
    }
  },
  {
    "id": "invoice-reconciliation",
    "title": "Invoice reconciliation",
    "zone": "Suppliers and Finance",
    "summary": "Match supplier invoices to orders and receipts with variances flagged.",
    "aliases": [
      "invoice-recon",
      "invoice-match"
    ],
    "inputs": [
      "Invoice lines with qty, unit, price, currency",
      "Order lines with agreed prices",
      "Receipt lines with counted qty and unit"
    ],
    "outputs": [
      "Match table with price and qty variances",
      "Pay or query recommendation"
    ],
    "tools": [
      "compare_purchase_costs",
      "validate_kitchen_data",
      "preview_import"
    ],
    "example": {
      "input": "Reconcile GreenFarm invoice INV-881 Austin Central USD 2026-03-10. Order PO-112 tomato 20 kg at 250c per kg. Receipt R-98 20 kg. Invoiced 20 kg at 260c per kg. Tolerance 0c per finance policy TBC 2026-01-01.",
      "output": "INVOICE RECON - GreenFarm - INV-881\nTomato: ordered 20 kg at 250c; received 20 kg; invoiced 20 kg at 260c.\nPrice var: 260 minus 250 equals 10c per kg; total 200c over. Qty var: 0.\nTolerance: 0c per finance policy TBC 2026-01-01; line over tolerance.\nRecommend: query 200c with order PO-112 and receipt R-98 attached.\nStatus: draft for finance. Payment not approved."
    },
    "blockedExample": {
      "input": "Reconcile invoice. Order and receipt missing.",
      "output": "RECON BLOCKED\nOrder unknown; receipt unknown.\nSupply both before matching. No payment recommended."
    }
  },
  {
    "id": "kitchen-budget-planner",
    "title": "Kitchen budget planner",
    "zone": "Suppliers and Finance",
    "summary": "Plan kitchen budgets with lines, targets, and variance prompts.",
    "aliases": [
      "budget-planner",
      "kitchen-budget"
    ],
    "coverageId": "kitchen-budget-planner",
    "inputs": [
      "Budget period and currency",
      "Cost lines with sources",
      "Revenue forecast with source",
      "Commercial targets explicit"
    ],
    "outputs": [
      "Budget table with totals",
      "Variance prompts for review"
    ],
    "tools": [
      "calculate_event_budget",
      "cost_recipe",
      "get_workflow"
    ],
    "example": {
      "input": "Budget Austin Central Mar 2026, USD. Revenue 120000 per SevenRooms forecast 2026-02-20. Costs food 36000 per supplier quotes, labor 40000 per rota draft, other 15000 TBC owner finance. Target operator food cost under 30 percent.",
      "output": "BUDGET - Austin Central - Mar 2026 - USD\nRevenue: 120000 per SevenRooms forecast 2026-02-20.\nCosts: food 36000 per supplier quotes; labor 40000 per rota draft; other 15000 TBC owner finance.\nProvisional forecast: cost 91000 includes the unconfirmed 15000 estimate; contribution 29000 (24.2 percent) is indicative, not an approved total.\nTarget: operator food cost under 30 percent; current 30.0 percent does not meet the strict under-30 target.\nStatus: draft for finance."
    },
    "blockedExample": {
      "input": "Plan budget. Revenue and targets missing.",
      "output": "BUDGET BLOCKED\nRevenue unknown; targets unknown.\nSupply forecast source and explicit targets."
    }
  },
  {
    "id": "kitchen-culture-health-check",
    "title": "Kitchen culture health check",
    "zone": "Wellbeing and Social Media",
    "summary": "Survey team culture themes with anonymous counts and actions.",
    "aliases": [
      "culture-check",
      "team-health"
    ],
    "coverageId": "kitchen-culture-health-check",
    "inputs": [
      "Survey questions with scale",
      "Responses anonymized with count",
      "Review meeting date"
    ],
    "outputs": [
      "Theme scores with counts",
      "Two actions with owners"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Check Q1 2026 Austin Central, 12 responses, scale 1 to 5. Sums respect 50, workload 37, learning 46. Actions workload rota review owner Ben due 2026-04-01; learning buddy shifts owner Ana. Share team meeting 2026-03-20.",
      "output": "CULTURE - Q1 2026 - 12 responses anonymous\nScores: respect 4.2 (50/12); workload 3.1 (37/12); learning 3.8 (46/12).\nActions: workload rota review owner Ben due 2026-04-01; learning buddy shifts owner Ana.\nShare: team meeting 2026-03-20. No individuals identified.\nStatus: draft for manager."
    },
    "blockedExample": {
      "input": "Check culture. Questions and responses missing.",
      "output": "CULTURE BLOCKED\nQuestions unknown; responses unknown.\nSupply both before scoring."
    }
  },
  {
    "id": "kitchen-ethos-doc-generator",
    "title": "Kitchen ethos doc generator",
    "zone": "Kitchen Operations",
    "summary": "Draft a short kitchen ethos doc from confirmed values and behaviors.",
    "aliases": [
      "ethos-doc",
      "kitchen-values"
    ],
    "coverageId": "kitchen-ethos-doc-generator",
    "inputs": [
      "Confirmed values from the leadership team",
      "Behaviors per value with examples",
      "Review date and owner"
    ],
    "outputs": [
      "One page ethos draft for team review",
      "Review task with owner"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Draft ethos for Austin Central, doc date 2026-03-10. Values confirmed: clean as you go behavior wipe boards between tasks example mid service reset at 19:00; call allergens loudly behavior repeat ticket allergens back example table 8 nut call; teach once show twice behavior demo then observe example new prep cook knife grip. Out of scope HR policy and discipline separate docs. Owner Mara, review 2026-06-01.",
      "output": "KITCHEN ETHOS - Austin Central - 2026-03-10\n1 Clean as you go: wipe boards between tasks; example mid service reset at 19:00.\n2 Call allergens loudly: repeat ticket allergens back; example table 8 nut call.\n3 Teach once show twice: demo then observe; example new prep cook knife grip.\nOut of scope: HR policy and discipline are separate docs.\nReview: 2026-06-01 owner Mara. Status: draft for team review."
    },
    "blockedExample": {
      "input": "Draft ethos. No values confirmed.",
      "output": "ETHOS BLOCKED\nValues unknown; leadership to confirm 3 to 5 values first.\nNo doc drafted. No values invented."
    }
  },
  {
    "id": "menu-description-writer",
    "title": "Menu description writer",
    "zone": "Menu and Product Development",
    "summary": "Write honest menu descriptions from confirmed ingredients and methods.",
    "aliases": [
      "menu-copy",
      "dish-descriptions"
    ],
    "coverageId": "menu-description-writer",
    "inputs": [
      "Dish recipe with confirmed ingredients",
      "Method keywords confirmed by chef",
      "Allergen and provenance claims with sources"
    ],
    "outputs": [
      "Menu copy options with claim sources",
      "Claims checklist"
    ],
    "tools": [
      "lookup_recipe",
      "validate_kitchen_data",
      "get_workflow"
    ],
    "example": {
      "input": "Write copy for tomato soup, Austin Central. Ingredients tomato, onion, basil confirmed. Method keywords slow simmered, blended smooth confirmed by chef. Provenance GreenFarm tomato per invoice 2026-03-05. Allergens gluten unknown per matrix v4.",
      "output": "MENU COPY - Tomato Soup\nOption A: Slow simmered GreenFarm tomato soup with basil. Claims: GreenFarm per invoice 2026-03-05.\nOption B: Tomato and basil soup, blended smooth. Claims: none beyond recipe.\nAllergens: gluten unknown per matrix v4; no free from claim made.\nStatus: draft pending manager."
    },
    "blockedExample": {
      "input": "Write copy. Recipe unconfirmed. Claim sources missing.",
      "output": "COPY BLOCKED\nRecipe unconfirmed; claim sources unknown.\nConfirm recipe and sources before writing. No copy issued."
    }
  },
  {
    "id": "menu-margin-review",
    "title": "Menu margin review",
    "zone": "Menu and Product Development",
    "summary": "Review ingredient gross margin against a confirmed net price and explicit target.",
    "aliases": [
      "margin-review",
      "margins",
      "menu-engineering-analyser"
    ],
    "coverageId": "menu-engineering-analyser",
    "inputs": [
      "Fully costed recipe with zero unknowns",
      "Variant with confirmed true net price in same currency",
      "Operator confirmed commercial target"
    ],
    "outputs": [
      "Ingredient gross margin in cents and percent",
      "Target comparison with plain verdict"
    ],
    "tools": [
      "cost_recipe",
      "cost_stored_recipe",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Review tomato soup dinner variant for Austin Central, USD, timezone America/Chicago, 2026-03-10. Batch cost 1000c for 4 servings. Net price 1000c confirmed true per price sheet v7. Operator target ingredient gross margin 70 percent set 2026-03-01.",
      "output": "MARGIN REVIEW - Tomato Soup Dinner - 2026-03-10\nLocale: Austin TX, USD, America/Chicago.\nCost per serving: 250c (1000c batch / 4 servings).\nNet price confirmed: 1000c, confirmed true, source price sheet v7.\nIngredient gross margin: 750c (75.0 percent). Math: 1000 minus 250 equals 750; 750 / 1000 equals 75 percent.\nTarget: 70 percent per operator 2026-03-01.\nVerdict: meets target by 5 points. Note: margin is ingredient gross only, not net profit. Labor, rent, tax excluded."
    },
    "blockedExample": {
      "input": "Review tomato soup dinner variant. Known tomato cost 800c batch partial; onion unknown no purchase supplied. Net price 1000c confirmed false.",
      "output": "MARGIN BLOCKED - Tomato Soup Dinner\nKnown cost: 800c batch partial; unknown: syn_onion no purchase supplied.\nPer serving cost withheld; margin withheld.\nNet price 1000c is unconfirmed; supply confirmed true price to compute margin.\nNo margin invented. No target assumed."
    }
  },
  {
    "id": "nutritional-information-calculator",
    "title": "Nutritional information calculator",
    "zone": "Kitchen Operations",
    "summary": "Estimate nutrition per serving from supplier data with explicit sources.",
    "aliases": [
      "nutrition-calc",
      "nutrition-info"
    ],
    "coverageId": "nutritional-information-calculator",
    "inputs": [
      "Recipe with quantities and yields",
      "Nutrition per 100 g per ingredient with source versions",
      "Serving size definition"
    ],
    "outputs": [
      "Per serving nutrition estimate table",
      "Sources and caveats list"
    ],
    "tools": [
      "validate_kitchen_data",
      "convert_quantity",
      "cost_recipe"
    ],
    "example": {
      "input": "Estimate soup per 250 g serving, 4 servings batch 1000 g. Tomato 600 g at 18 kcal per 100 g per supplier sheet v2. Onion 400 g at 40 kcal per 100 g per sheet v2. Ignore cooking loss, state caveat.",
      "output": "NUTRITION - Tomato Soup - per 250 g serving\nEnergy: tomato 108 kcal plus onion 160 kcal equals 268 kcal batch; per serving 67 kcal. Math: 600/100*18=108; 400/100*40=160; 268/4=67.\nSources: tomato sheet v2; onion sheet v2.\nCaveats: estimate only; cooking losses TBC; sodium unknown no data; not lab verified."
    },
    "blockedExample": {
      "input": "Estimate nutrition. Per 100 g data missing for onion. Yield missing.",
      "output": "NUTRITION BLOCKED\nOnion per 100 g unknown; supply source.\nYield unknown; supply servings and grams.\nNo estimates issued."
    }
  },
  {
    "id": "onboarding",
    "title": "Onboarding: set up a workspace",
    "zone": "Workspace",
    "summary": "Set up a new local workspace from explicit data with no assumed defaults.",
    "aliases": [
      "setup",
      "getting-started"
    ],
    "inputs": [
      "Workspace directory path operator selected",
      "Currency code explicit",
      "Initial supplier or recipe files if any"
    ],
    "outputs": [
      "Workspace ready checklist",
      "Validation report for imported data"
    ],
    "tools": [
      "list_capabilities",
      "get_workflow",
      "preview_import",
      "commit_import",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Set up workspace for Austin Central at ./austin-central, currency USD, metric kg and L, timezone America/Chicago. Setup date 2026-03-10. Two files: suppliers.csv 2 rows and soup-recipe.json 1 recipe, 0 conflicts.",
      "output": "ONBOARDING CHECKLIST - Austin Central\nWorkspace: ./austin-central, created 2026-03-10.\nCurrency: USD; Units: metric; Timezone: America/Chicago.\nImports: suppliers.csv previewed 2 rows, 0 conflicts, committed v1; soup-recipe.json previewed 1 recipe, 0 conflicts, committed v1.\nValidation: valid true, no cycles, 2 purchases matched.\nNext: add allergen label versions; confirm commercial target with manager; schedule first stock take."
    },
    "blockedExample": {
      "input": "Set up workspace at ./austin-central. Currency missing. Timezone missing.",
      "output": "ONBOARDING BLOCKED\nCurrency code unknown: supply explicit code such as USD.\nTimezone unknown: supply explicit zone such as America/Chicago.\nNo workspace created. No defaults assumed."
    }
  },
  {
    "id": "ordering-proposals",
    "title": "Ordering proposals",
    "zone": "Kitchen Operations",
    "summary": "Propose order quantities from par, on hand, and on order with explicit units.",
    "aliases": [
      "ordering",
      "order-proposal",
      "ordering-checklist-tracker"
    ],
    "coverageId": "ordering-checklist-tracker",
    "inputs": [
      "Per ingredient par, onHand, onOrder, unit",
      "Optional explicit packSize in same unit",
      "Supplier lead time if known"
    ],
    "outputs": [
      "Order quantities per ingredient with units",
      "Pack rounding only when packSize supplied"
    ],
    "tools": [
      "build_order_proposal",
      "compare_purchase_costs",
      "create_task"
    ],
    "example": {
      "input": "Propose order for Austin Central 2026-03-10, USD, metric. Tomato par 10 kg, on hand 3 kg, on order 2 kg, pack 4 kg. Onion par 6 kg, on hand 1 kg, on order 0 kg, no pack given.",
      "output": "ORDER PROPOSAL - Austin Central - 2026-03-10\nTomato: par 10 minus 3 minus 2 equals 5 kg; pack 4 kg rounds to 8 kg in 2 packs.\nOnion: par 6 minus 1 minus 0 equals 5 kg exact; no pack rounding.\nMissing counts: none.\nTotal lines: 2. Currency USD for costing only; order placed by manager after approval.\nApproval: pending manager sign off. Order not sent."
    },
    "blockedExample": {
      "input": "Propose order. Tomato on hand missing. Onion par negative.",
      "output": "ORDER BLOCKED\nTomato: on hand unknown; supply counted stock with unit.\nOnion: par negative is invalid; supply correct par.\nNo proposal issued. No order sent."
    }
  },
  {
    "id": "partnership-growth-finder",
    "title": "Partnership growth finder",
    "zone": "Suppliers and Finance",
    "summary": "Shortlist local partnerships with fit, cost, and next steps.",
    "aliases": [
      "growth-finder",
      "partnership-ideas"
    ],
    "coverageId": "partnership-growth-finder",
    "inputs": [
      "Growth goal with measure",
      "Partner ideas with contacts",
      "Cost and effort estimates"
    ],
    "outputs": [
      "Shortlist with fit scores and next steps",
      "Outreach drafts"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Find partners for Austin Central spring lunch growth, goal plus 20 covers weekdays, budget 500 dollars, USD, date 2026-03-10. Ideas gym next door fit 4 cost 0 effort low next intro Mara; office tower fit 5 cost 200 flyers effort med next email draft; market stall fit 3 cost 400 effort high next TBC. Outreach office lunch trial 10 percent week 1 contact TBC facilities.",
      "output": "PARTNERSHIPS - Austin Central - 2026-03-10\nIdeas: gym next door fit 4 cost 0 effort low next intro Mara; office tower fit 5 cost 200 flyers effort med next email draft; market stall fit 3 cost 400 effort high next TBC.\nTop 3: office tower, gym, market stall in order.\nOutreach draft office: lunch trial 10 percent week 1, contact TBC facilities.\nBudget: 200 of 500 committed pending approval.\nStatus: draft for manager."
    },
    "blockedExample": {
      "input": "Find partners. Goal and budget missing.",
      "output": "GROWTH BLOCKED\nGoal unknown; budget unknown.\nSupply both before shortlisting."
    }
  },
  {
    "id": "plate-photography-brief",
    "title": "Plate photography brief",
    "zone": "Menu and Product Development",
    "summary": "Brief plate photography with shots, styling, and usage rights.",
    "aliases": [
      "photo-brief",
      "plate-shots"
    ],
    "coverageId": "plate-photography-brief",
    "inputs": [
      "Dishes to shoot with service style",
      "Shot list with angles and props",
      "Usage rights and deadlines"
    ],
    "outputs": [
      "Photo brief with shot list and schedule",
      "Rights and credit notes"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Brief shoot Austin Central 2026-03-18. Dishes tomato soup as served 250 g bowl, leek starter as served. Shots soup overhead white bowl, soup 45 deg with spoon, leek overhead slate. Styling as served, no inedible props. Usage web and social 1 year from 2026-03-18. Credit J Lee. Schedule kitchen 14:00-16:00, photographer 14:00.",
      "output": "PHOTO BRIEF - 2026-03-18 - Austin Central\nDishes: tomato soup as served 250 g bowl; leek starter as served.\nShots: soup overhead white bowl; soup 45 deg with spoon; leek overhead slate.\nStyling: as served; no inedible props; allergens unchanged.\nRights: web and social 1 year from 2026-03-18; credit J Lee; beyond that TBC.\nSchedule: kitchen 14:00-16:00; photographer 14:00.\nStatus: draft pending manager."
    },
    "blockedExample": {
      "input": "Brief shoot. Dishes and rights missing.",
      "output": "PHOTO BLOCKED\nDishes unknown; usage rights unknown.\nSupply both before briefing."
    }
  },
  {
    "id": "post-event-report",
    "title": "Post event report",
    "zone": "Events and Banqueting",
    "summary": "Report event outcomes with financials, feedback, and lessons.",
    "aliases": [
      "event-report",
      "post-event"
    ],
    "coverageId": "post-event-report",
    "inputs": [
      "Event date, covers actual",
      "Revenue and cost lines with currency",
      "Feedback and incidents"
    ],
    "outputs": [
      "Post event report with variance",
      "Lessons and actions"
    ],
    "tools": [
      "calculate_event_budget",
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Report TechConf lunch 2026-04-10. Actual 115 covers vs expected 120. Revenue 5000 dollars. Costs food 1800, staff 540, hire 300. Budget 4500 revenue, 2500 cost. Feedback 4.5 of 5 per 40 surveys; themes praise soup, note slow coffee. Incidents none logged. Action coffee hire quote owner Ben due 2026-05-01.",
      "output": "POST EVENT - TechConf Lunch - 2026-04-10\nActuals: 115 covers; revenue 5000 dollars; costs 2640 dollars (1800+540+300=2640); margin 2360 dollars.\nVariance: revenue plus 500 vs budget; cost plus 140 vs budget; margin plus 360.\nFeedback: 4.5 of 5 per 40 surveys; praise soup; note slow coffee.\nIncidents: none.\nLessons: add coffee station; confirm 120 vs 115 count process.\nActions: coffee hire quote owner Ben due 2026-05-01."
    },
    "blockedExample": {
      "input": "Report event. Revenue and cost lines missing.",
      "output": "REPORT BLOCKED\nRevenue unknown; costs unknown.\nSupply lines in explicit currency before reporting."
    }
  },
  {
    "id": "prep-planning",
    "title": "Prep planning",
    "zone": "Kitchen Operations",
    "summary": "Build a deterministic prep plan from demand and counted stock.",
    "aliases": [
      "prep",
      "prep-plan",
      "prep-list-generator"
    ],
    "coverageId": "prep-list-generator",
    "inputs": [
      "Demand per recipe: servings, servingUnit, yieldPerBatch",
      "Stock per recipe: onHand plus unit matching demand",
      "Service date and site"
    ],
    "outputs": [
      "Batches to make and servings to make per recipe",
      "Action tasks for uncounted stock"
    ],
    "tools": [
      "build_prep_plan",
      "validate_prep_capacity",
      "create_task",
      "list_tasks"
    ],
    "example": {
      "input": "Plan prep for Austin Central 2026-03-10 lunch, America/Chicago. Tomato soup demand 10 servings, yield 4 per batch, on hand 3 servings. Sourdough demand 40 portions, yield 20 per batch, on hand 0.",
      "output": "PREP PLAN - Austin Central - 2026-03-10 lunch\nTomato soup: demand 10 minus on hand 3 equals net 7; batches ceil 7/4 equals 2; to make 8 servings.\nSourdough: demand 40 minus 0 equals 40; batches ceil 40/20 equals 2; to make 40 portions.\nUncounted: none. Units all servings or portions as stated.\nCapacity note: TBC; run validate_prep_capacity with oven hours before service.\nApproval: pending head chef."
    },
    "blockedExample": {
      "input": "Plan prep. Tomato soup demand 10 servings but on hand unknown. Sourdough units mismatch servings vs kg.",
      "output": "PREP BLOCKED\nTomato soup: on hand unknown; count stock in servings and re run.\nSourdough: unit mismatch servings vs kg; supply explicit conversion or recount.\nAction tasks raised for both lines. No batches planned."
    }
  },
  {
    "id": "price-increase-impact-calculator",
    "title": "Price increase impact calculator",
    "zone": "Suppliers and Finance",
    "summary": "Model supplier price rises on dish cost and margin with explicit math.",
    "aliases": [
      "price-impact",
      "increase-calculator"
    ],
    "coverageId": "price-increase-impact-calculator",
    "inputs": [
      "Current costs with sources",
      "New prices with effective dates",
      "Affected dishes with yields",
      "Menu prices confirmed or TBC"
    ],
    "outputs": [
      "Impact table per dish with new margins",
      "Options to absorb or reprice"
    ],
    "tools": [
      "cost_recipe",
      "compare_purchase_costs",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Model tomato rise from 800c to 920c per 1 kg effective 2026-04-01, USD. Soup uses 1 kg per 4 servings. Soup old dish cost 250c per serving tomato 200c plus other 50c. Price 1000c confirmed. Target 70 percent.",
      "output": "IMPACT - Tomato - 2026-04-01\nDelta: 920 minus 800 equals 120c per kg; per serving 120/4 equals 30c.\nSoup old cost 250c margin 75.0 percent; new cost 280c margin 72.0 percent. Math: 1000-280=720; 720/1000=72 percent.\nBelow target: none; still above 70 percent.\nOptions: absorb 30c; sub supplier TBC quote; reprice TBC by manager.\nStatus: draft for review."
    },
    "blockedExample": {
      "input": "Model impact. New prices and yields missing.",
      "output": "IMPACT BLOCKED\nNew prices unknown; yields unknown.\nSupply both with dates before modelling."
    }
  },
  {
    "id": "private-dining-setup-guide",
    "title": "Private dining setup guide",
    "zone": "Events and Banqueting",
    "summary": "Guide private dining setup with room, table, and service specs.",
    "aliases": [
      "private-dining",
      "pdr-setup"
    ],
    "coverageId": "private-dining-setup-guide",
    "inputs": [
      "Date, covers, room",
      "Table plan and menu",
      "Service timings and contacts"
    ],
    "outputs": [
      "Setup guide with timeline",
      "Table and service specs"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Setup board dinner Austin Central PDR 2026-03-25, 12 covers. Menu 3 courses. Doors 19:00, dinner 19:30. Host J Smith head seat. Allergen 1 gluten free per host email. Tables 1 board 12, water and bread preset, wine glasses 2 per cover. Service 18:00 setup FOH, 19:30 course 1 fire Ben, 21:30 clear. Contacts FOH lead TBC, kitchen Ben.",
      "output": "PRIVATE DINING - Board Dinner - 2026-03-25\nRoom PDR board table 12 seats; host J Smith head seat; allergen note 1 gluten free per host email.\nTables: 1 board 12; water and bread preset; wine glasses 2 per cover.\nService: 18:00 setup FOH; 19:00 doors; 19:30 course 1 fire Ben; 21:30 clear.\nContacts: FOH lead TBC; kitchen Ben; host J Smith.\nStatus: draft pending FOH lead."
    },
    "blockedExample": {
      "input": "Guide private dining. Room, covers, menu missing.",
      "output": "GUIDE BLOCKED\nRoom unknown; covers unknown; menu unknown.\nSupply all three before setup."
    }
  },
  {
    "id": "purchase-price-review",
    "title": "Purchase price review",
    "zone": "Suppliers and Finance",
    "summary": "Rank purchase options by unit cost on explicit matching units.",
    "aliases": [
      "purchase-review",
      "supplier-prices"
    ],
    "inputs": [
      "Options with id, currency all same, costCents, qty plus unit all same unit, effectiveDate",
      "Explicit conversion if units differ"
    ],
    "outputs": [
      "Ranked options with unit cost per unit",
      "Plain cheapest verdict with caveats"
    ],
    "tools": [
      "compare_purchase_costs",
      "convert_quantity",
      "preview_import",
      "commit_import"
    ],
    "example": {
      "input": "Review tomato 1 kg options, USD, 2026-03-10. Case A 300c for 1 kg effective 2026-03-01. Case B 500c for 2 kg effective 2026-03-05.",
      "output": "PRICE REVIEW - Tomato - 2026-03-10\nCase A: 300c / 1 kg equals 300c per kg, rank 2.\nCase B: 500c / 2 kg equals 250c per kg, rank 1.\nCheapest: Case B at 250c per kg, effective 2026-03-05.\nCaveats: quality TBC by buyer; lead time TBC; minimum order TBC. Currency USD both."
    },
    "blockedExample": {
      "input": "Review tomato. Case A per kg, Case B per liter, no conversion supplied.",
      "output": "PRICE BLOCKED\nUnit mismatch kg vs liter; common unit unknown with no explicit conversion.\nSupply a documented conversion or requote in one unit.\nNo ranking issued."
    }
  },
  {
    "id": "recipe-compliance-checker",
    "title": "Recipe compliance checker",
    "zone": "Kitchen Operations",
    "summary": "Check a recipe against labelling, allergen, and verified plan controls.",
    "aliases": [
      "compliance-check",
      "recipe-check"
    ],
    "coverageId": "recipe-compliance-checker",
    "inputs": [
      "Recipe record with ingredients and yields",
      "Label versions per ingredient",
      "Verified local plan reference for controls"
    ],
    "outputs": [
      "Pass or fail per check with evidence",
      "Remediation list for failures"
    ],
    "tools": [
      "validate_kitchen_data",
      "lookup_recipe",
      "get_workflow"
    ],
    "example": {
      "input": "Check tomato soup for Austin Central, USD, 2026-03-10. Labels v4: celery verified_absent, gluten unknown pending mill letter expected 2026-03-08. Yield 4 servings evidenced recipe card; hold control evidenced service log. Plan HACCP v2.1. Remediation owner Ben due 2026-03-12.",
      "output": "COMPLIANCE CHECK - Tomato Soup - 2026-03-10\nLabels: celery verified_absent per v4; gluten unknown pending mill letter 2026-03-08; others unknown.\nChecks: allergen matrix fail (gluten unknown); yield labelling pass; hold control pass per HACCP v2.1.\nRemediation: obtain mill letter owner Ben due 2026-03-12; hold service note for gluten unknown.\nVerdict: not compliant until gluten resolved."
    },
    "blockedExample": {
      "input": "Check tomato soup. Label versions missing. Plan reference missing.",
      "output": "COMPLIANCE BLOCKED\nLabel versions unknown; supply per ingredient.\nPlan reference unknown; supply verified plan version.\nNo verdict issued."
    }
  },
  {
    "id": "recipe-costing",
    "title": "Recipe costing",
    "zone": "Kitchen Operations",
    "summary": "Cost recipes from explicit purchases and separate known from unknown.",
    "aliases": [
      "costing",
      "food-cost",
      "dish-costing-calculator"
    ],
    "coverageId": "dish-costing-calculator",
    "inputs": [
      "Recipes with currency and yields",
      "Purchases with cost, usable qty and unit, effective date",
      "Matching units or explicit conversion"
    ],
    "outputs": [
      "Known batch cost with per serving cost",
      "Unknown list with reasons"
    ],
    "tools": [
      "cost_recipe",
      "cost_stored_recipe",
      "validate_kitchen_data",
      "convert_quantity"
    ],
    "example": {
      "input": "Cost tomato soup for Austin Central, USD, metric, 2026-03-10. Yield 4 servings. Tomato 1 kg at 800c per 1 kg effective 2026-01-01. Onion 0.5 kg at 400c per 1 kg effective 2026-01-01. Packaging none supplied.",
      "output": "COSTING - Tomato Soup - 2026-03-10\nTomato: 1 kg at 800c per kg equals 800c.\nOnion: 0.5 kg at 400c per kg equals 200c.\nKnown: 1000c covering 2 of 2. Unknown: none.\nPer serving: 250c (1000 / 4). Packaging: none supplied.\nCurrency USD. Effective dates: tomato 2026-01-01, onion 2026-01-01."
    },
    "blockedExample": {
      "input": "Cost tomato soup. Onion purchase missing. Tomato units kg vs g with no conversion.",
      "output": "COSTING BLOCKED - Tomato Soup\nKnown: 800c tomato partial; unknown: onion no purchase supplied.\nUnit issue: tomato kg vs g needs explicit conversion.\nPer serving withheld. Supply onion cost and conversion to complete."
    }
  },
  {
    "id": "recipe-dependency-impact",
    "title": "Recipe dependency impact",
    "zone": "Workspace",
    "summary": "Map recipe sub recipe links and assess change impact before editing.",
    "aliases": [
      "dependency-impact",
      "recipe-graph"
    ],
    "inputs": [
      "Recipe graph with subrecipes",
      "Proposed change with reason",
      "Cost and allergen sources"
    ],
    "outputs": [
      "Impact list of affected recipes",
      "Re cost and re label tasks"
    ],
    "tools": [
      "validate_kitchen_data",
      "lookup_recipe",
      "cost_recipe"
    ],
    "example": {
      "input": "Assess changing tomato base salt from 10 g to 5 g per batch, Austin Central. Salt 40c per 100 g. Used by soup and sauce. Labels v4. Run date 2026-03-10. Re cost owner Ana. Reprint due 2026-03-12.",
      "output": "IMPACT - Tomato Base - 2026-03-10\nParents: tomato soup, tomato sauce (2 direct, 0 indirect).\nCost: salt cost drop 2c per batch; re cost both parents owner Ana.\nLabels: sodium changes; nutrition TBC re calc; allergen states unchanged per v4.\nCycles: none found.\nTasks: update soup card; update sauce card; reprint due 2026-03-12.\nStatus: draft for head chef. No recipes edited."
    },
    "blockedExample": {
      "input": "Assess impact. Graph links missing. Cycle suspected.",
      "output": "IMPACT BLOCKED\nGraph incomplete; parent list unknown; possible cycle tomato base to soup to base.\nResolve graph and cycles before editing. No changes made."
    }
  },
  {
    "id": "recipe-documentation",
    "title": "Recipe documentation: draft cards",
    "zone": "Kitchen Operations",
    "summary": "Draft printable recipe cards from confirmed records with explicit allergens.",
    "aliases": [
      "documentation",
      "recipe-cards",
      "recipe-bible-generator"
    ],
    "coverageId": "recipe-bible-generator",
    "inputs": [
      "Recipe IDs to document",
      "Confirmed yields, ingredients, steps",
      "Allergen label versions per ingredient"
    ],
    "outputs": [
      "Printable recipe card drafts",
      "Missing recipe report"
    ],
    "tools": [
      "get_workflow",
      "lookup_recipe",
      "list_recipes",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Document tomato soup for Austin Central, USD, metric, 2026-03-10. Recipe syn_tomato_soup yield 4 servings. Ingredients tomato 1 kg, onion 0.5 kg. Confirmed steps 1 sweat onion in oil 8 min, 2 add tomato and 1 L water, 3 simmer 25 min, 4 blend and season. Hold per verified HACCP plan v2.1. Label v4 states celery verified_absent, gluten unknown pending mill letter expected 2026-03-08.",
      "output": "RECIPE CARD - Tomato Soup - 4 servings\nIngredients: 1 kg tomato (allergen unknown, source label v4); 0.5 kg onion (allergen unknown, source label v4).\nSteps: 1 Sweat onion in oil 8 min. 2 Add tomato and 1 L water. 3 Simmer 25 min. 4 Blend and season.\nHold and serve: hold per verified HACCP plan v2.1; time and temp TBC by manager.\nAllergens: celery verified_absent per label v4; gluten unknown pending mill letter 2026-03-08; no negative claims from missing labels.\nApproval: pending head chef."
    },
    "blockedExample": {
      "input": "Document recipe syn_unknown_soup. ID not found in records.",
      "output": "DOCUMENTATION BLOCKED\nUnknown recipe ID: syn_unknown_soup not found.\nNo ingredients or steps invented.\nAction: supply correct ID or create a confirmed record first."
    }
  },
  {
    "id": "recipe-scaling",
    "title": "Recipe scaling",
    "zone": "Kitchen Operations",
    "summary": "Scale a recipe to a target yield deterministically with units unchanged.",
    "aliases": [
      "scaling",
      "scale"
    ],
    "inputs": [
      "Recipe record or ID via lookup",
      "Target yield amount in same unit as current yield"
    ],
    "outputs": [
      "Scaled ingredient quantities with same units",
      "Scaled yield header"
    ],
    "tools": [
      "scale_recipe",
      "lookup_recipe",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Scale tomato soup from 4 servings to 8 servings for Austin Central, USD, metric, timezone America/Chicago, 2026-03-10. Tomato 1 kg, onion 0.5 kg.",
      "output": "SCALED RECIPE - Tomato Soup\nYield: 4 to 8 servings; factor 2.\nIngredients: 2 kg tomato; 1 kg onion.\nUnits unchanged. Method: see recipe card; adjust seasoning to taste per chef.\nLocale: Austin TX, USD, metric; costing to follow in recipe-costing."
    },
    "blockedExample": {
      "input": "Scale tomato soup. Target yield missing.",
      "output": "SCALING BLOCKED\nTarget yield unknown; supply amount in servings.\nNo scaling performed. No yield assumed."
    }
  },
  {
    "id": "rota-builder",
    "title": "Rota builder",
    "zone": "Kitchen Operations",
    "summary": "Draft a weekly rota from availability, demand, and explicit labor rules.",
    "aliases": [
      "rota",
      "shift-rota"
    ],
    "coverageId": "rota-builder",
    "inputs": [
      "Week dates and service hours",
      "Staff availability with roles",
      "Demand forecast per day",
      "Local labor rules reference"
    ],
    "outputs": [
      "Weekly rota grid draft",
      "Gaps and overtime flags"
    ],
    "tools": [
      "validate_prep_capacity",
      "create_task",
      "list_tasks"
    ],
    "example": {
      "input": "Rota for Austin Central week 2026-03-16, America/Chicago. Staff Ana saute 40h max, Ben sous 45h max, Cara pastry 30h max, all available Mon-Sat. Demand peak Fri Sat. Grid Mon Ana 14-22 Ben 12-22 Cara off; Tue Ana 14-22 Ben off Cara 14-20; Wed Ana 14-22 Ben 14-22 Cara 14-20; Thu Ana off Ben 14-20 Cara 14-20; Fri Ana 12-20 Ben 12-22 Cara 14-20; Sat Ana 12-18 Ben 12-22 Cara off. Grill cover Sat TBC owner manager. Labor per Texas guidance TBC by HR.",
      "output": "ROTA - Austin Central - week 2026-03-16\nMon: Ana saute 14-22 (8h); Ben sous 12-22 (10h); Cara off.\nTue: Ana 14-22 (8h); Ben off; Cara 14-20 (6h).\nWed: Ana 14-22 (8h); Ben 14-22 (8h); Cara 14-20 (6h).\nThu: Ana off; Ben 14-20 (6h); Cara 14-20 (6h).\nFri: Ana 12-20 (8h); Ben 12-22 (10h); Cara 14-20 (6h).\nSat: Ana 12-18 (6h); Ben 12-22 (10h); Cara off.\nWeek totals: Ana 38h; Ben 44h; Cara 24h.\nGaps: grill cover Sat TBC; owner manager.\nOvertime flags: none within stated max. Labor rules per HR ref TBC; verify before publish."
    },
    "blockedExample": {
      "input": "Build rota. Availability missing for two staff. Labor rules missing.",
      "output": "ROTA BLOCKED\nAvailability unknown for 2 staff; supply per person.\nLabor rules unknown; supply local reference.\nNo rota issued."
    }
  },
  {
    "id": "seasonal-menu-planner",
    "title": "Seasonal menu planner",
    "zone": "Menu and Product Development",
    "summary": "Plan a seasonal menu from availability, cost, and capacity with explicit targets.",
    "aliases": [
      "seasonal-menu",
      "season-planner"
    ],
    "coverageId": "seasonal-menu-planner",
    "inputs": [
      "Season dates and locale",
      "Available produce with supplier quotes",
      "Cost and margin targets explicit",
      "Kitchen capacity notes"
    ],
    "outputs": [
      "Seasonal menu draft with costs",
      "Sourcing and risk notes"
    ],
    "tools": [
      "cost_recipe",
      "compare_purchase_costs",
      "validate_prep_capacity"
    ],
    "example": {
      "input": "Plan spring menu Austin Central, USD, Mar to May 2026. Tomato soup stays cost 250c price 1000c confirmed. New asparagus starter quoted 600c per kg GreenFarm effective 2026-03-01; cost TBC pending yield test; season ends May. Target ingredient gross margin 68 percent. Capacity soup fits current prep; starter needs 2 extra oven hours TBC.",
      "output": "SEASONAL MENU - Spring 2026 - Austin Central\nTomato soup: cost 250c, price 1000c confirmed, margin 75 percent meets 68 percent target.\nAsparagus starter: cost TBC pending yield test; quote 600c per kg; margin TBC.\nSourcing: asparagus GreenFarm quote 2026-03-01; risk short season ends May.\nCapacity: soup fits current prep; starter needs 2 extra oven hours TBC.\nApproval: pending head chef."
    },
    "blockedExample": {
      "input": "Plan seasonal menu. Supplier quotes missing. Targets missing.",
      "output": "SEASONAL BLOCKED\nQuotes unknown; targets unknown.\nSupply quotes with dates and explicit target before drafting."
    }
  },
  {
    "id": "social-media-content-generator",
    "title": "Social media content generator",
    "zone": "Wellbeing and Social Media",
    "summary": "Draft honest social posts from confirmed dishes and events.",
    "aliases": [
      "social-content",
      "content-calendar"
    ],
    "coverageId": "social-media-content-generator",
    "inputs": [
      "Dishes or events with dates",
      "Photos with rights and credits",
      "Posting schedule and channels"
    ],
    "outputs": [
      "Post drafts with captions and alts",
      "Rights checklist"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Draft 2 posts Austin Central week 2026-03-16. Post 1 Tue Instagram slow simmered tomato soup with basil, soup photo by J Lee rights web social 1 year. Post 2 Thu Instagram feeding 120 at TechConf Tuesday lunch, house photo rights house.",
      "output": "SOCIAL - week 2026-03-16\nPost 1 Tue Instagram: Slow simmered tomato soup today. Alt tomato soup bowl basil. Credit J Lee. Rights web social 1 year.\nPost 2 Thu Instagram: Feeding 120 at TechConf Tuesday. Alt buffet soup station. Photo house. Rights house.\nClaims: no award claims; prices not listed; allergens see menu.\nStatus: drafts for manager."
    },
    "blockedExample": {
      "input": "Draft posts. Dishes and photo rights missing.",
      "output": "SOCIAL BLOCKED\nDishes unknown; rights unknown.\nSupply both before drafting."
    }
  },
  {
    "id": "sop-drafting",
    "title": "SOP drafting",
    "zone": "People and Training",
    "summary": "Draft standard operating procedures from confirmed practice with blanks for humans.",
    "aliases": [
      "sop",
      "procedures",
      "kitchen-sop-generator"
    ],
    "coverageId": "kitchen-sop-generator",
    "inputs": [
      "Steps as actually performed with equipment and checks",
      "Readings and signatures required, left blank",
      "Verified safety plan reference"
    ],
    "outputs": [
      "Numbered SOP draft with owner and version",
      "Review task for approval"
    ],
    "tools": [
      "get_workflow",
      "validate_kitchen_data",
      "create_task"
    ],
    "example": {
      "input": "Draft soup reheating SOP for Austin Central, 2026-03-10. Scope kitchen all prep cooks. Steps confirmed by Ana: 1 transfer soup to pot, 2 heat stirring to plan limit, 3 verify with probe and record, 4 cool remainder per plan. Equipment stockpot, probe thermometer, blast chiller. Plan ref HACCP v2.1 dated 2026-01-15. Cooler readings required. Probe calibration date unknown owner Ben.",
      "output": "SOP - Soup Reheating - v0.1 - 2026-03-10\nScope: Austin Central kitchen, all prep cooks.\nEquipment: stockpot, probe thermometer, blast chiller.\nSteps: 1 Transfer soup to pot. 2 Heat stirring to the limit in HACCP v2.1. 3 Verify with probe; record reading. 4 Cool remainder per HACCP v2.1.\nControls: per verified HACCP plan v2.1 dated 2026-01-15; specific limits per plan, not restated here.\nSign off: name ____ date ____ signature ____.\nTBC: probe calibration date unknown; owner Ben."
    },
    "blockedExample": {
      "input": "Draft SOP for soup reheating. Steps unconfirmed. Plan reference missing.",
      "output": "SOP BLOCKED\nSteps unconfirmed: interview operator and confirm each step first.\nPlan reference unknown: supply verified HACCP plan version and date.\nNo SOP issued. No safety limits invented."
    }
  },
  {
    "id": "staff-performance-review",
    "title": "Staff performance review",
    "zone": "People and Training",
    "summary": "Draft a performance review from agreed goals and observed evidence.",
    "aliases": [
      "performance-review",
      "staff-review"
    ],
    "coverageId": "staff-performance-review",
    "inputs": [
      "Review period and role",
      "Agreed goals with measures",
      "Observed evidence per goal"
    ],
    "outputs": [
      "Review draft with ratings TBC by manager",
      "Development actions with owners"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Review Ana, saute, Q1 2026 Austin Central. Goals waste under 3 percent achieved 2.1 percent per waste logs Jan-Mar; allergen calls 100 percent achieved 42 of 42 per FOH log. Strengths consistent close downs, trains new starters patiently per sous log. Gap grill cover not signed off owner Ana due Q2. Actions grill sign off shifts with Ben; advanced knife course TBC by manager.",
      "output": "PERFORMANCE REVIEW - Ana - Q1 2026\nGoals: waste under 3 percent, evidence 2.1 percent per waste logs Jan-Mar; allergen calls 100 percent, evidence 42 of 42 tickets per FOH log.\nStrengths: consistent close downs; trains new starters patiently.\nGaps: grill cover not yet signed off; owner Ana due Q2.\nActions: grill sign off shifts with Ben; advanced knife course TBC by manager.\nRating: blank for manager. Pay outcome blank for HR."
    },
    "blockedExample": {
      "input": "Review staff. Goals and evidence missing.",
      "output": "REVIEW BLOCKED\nGoals unknown; evidence unknown.\nAgree goals and gather evidence first. No review drafted."
    }
  },
  {
    "id": "station-setup-checklist",
    "title": "Station setup checklist",
    "zone": "Kitchen Operations",
    "summary": "Build a station setup and mise checklist with quantities and owners.",
    "aliases": [
      "station-setup",
      "mise-checklist"
    ],
    "coverageId": "station-setup-checklist",
    "inputs": [
      "Station and service date",
      "Mise items with qty and unit",
      "Equipment checks per station"
    ],
    "outputs": [
      "Setup checklist with tick boxes",
      "Shortage flags"
    ],
    "tools": [
      "build_prep_plan",
      "create_task"
    ],
    "example": {
      "input": "Setup saute for Austin Central 2026-03-11 dinner, 90 covers. Mise soup 8 servings owner Ana due 16:00, oil 2 L owner Ana, herbs 200 g owner Cara TBC delivery 15:00. Equipment fryer and range check.",
      "output": "STATION SETUP - Saute - 2026-03-11 dinner\nMise: 8 servings soup owner Ana due 16:00; 2 L oil owner Ana; 200 g herbs owner Cara.\nEquipment: fryer clean check pass/fail ____; range ignition check ____.\nShortages: none reported; herbs TBC delivery 15:00.\nSign off: sous ____ time ____."
    },
    "blockedExample": {
      "input": "Setup saute. Mise quantities missing.",
      "output": "SETUP BLOCKED\nMise quantities unknown; supply qty and unit per item.\nNo checklist issued."
    }
  },
  {
    "id": "stock-take-template-generator",
    "title": "Stock take template generator",
    "zone": "Suppliers and Finance",
    "summary": "Generate stock take sheets by area with units and count order.",
    "aliases": [
      "stocktake-template",
      "stock-count-sheet"
    ],
    "coverageId": "stock-take-template-generator",
    "inputs": [
      "Areas with item lists",
      "Units per item explicit",
      "Count date and teams"
    ],
    "outputs": [
      "Count sheets per area with blanks",
      "Recount prompts"
    ],
    "tools": [
      "reconcile_stock",
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Generate sheets for Austin Central 2026-03-31. Areas dry, cold, freezer. Items flour kg dry, tomato kg cold, milk L cold, freezer items TBC. Teams Ana dry, Ben cold. Count order top shelf to bottom. Scale and tare TBC.",
      "output": "STOCK SHEET - Dry - 2026-03-31\nFlour kg count ____ recount ____ variance ____.\nTeam Ana; scale calibrated TBC date; tare TBC per equipment list.\nSTOCK SHEET - Cold - 2026-03-31\nTomato kg count ____; milk L count ____.\nTeam Ben; count order top shelf to bottom.\nSTOCK SHEET - Freezer - 2026-03-31\nItems TBC; no items listed in input.\nRules: count as seen; no estimates; photo unclear labels.\nStatus: ready for count."
    },
    "blockedExample": {
      "input": "Generate sheets. Areas and units missing.",
      "output": "SHEETS BLOCKED\nAreas unknown; units unknown.\nSupply both before generating."
    }
  },
  {
    "id": "stock-variance",
    "title": "Stock variance",
    "zone": "Suppliers and Finance",
    "summary": "Reconcile stock counts to expected with variance causes and actions.",
    "aliases": [
      "variance-review",
      "stock-gaps"
    ],
    "inputs": [
      "Opening, received, used, waste, closing in same unit",
      "Count date and counters",
      "Expected vs counted comparison"
    ],
    "outputs": [
      "Variance table with percent",
      "Cause notes and actions"
    ],
    "tools": [
      "reconcile_stock",
      "validate_kitchen_data",
      "create_task"
    ],
    "example": {
      "input": "Reconcile tomato kg Austin Central 2026-03-10. Opening 10, received 20, used 22, waste 1, counted closing 6.5. Counters Ana Ben. Recount owner Ben due 2026-03-11; waste log check owner Ana.",
      "output": "VARIANCE - Tomato kg - 2026-03-10\nMoves: open 10 plus received 20 minus used 22 minus waste 1 equals expected 7 kg.\nCounted: 6.5 kg. Variance: 6.5 minus 7 equals minus 0.5 kg (minus 7.1 percent).\nCause: unknown pending recount owner Ben due 2026-03-11; possible trim scale TBC.\nActions: recount task Ben; check waste log task Ana.\nStatus: draft for manager. No adjustment posted."
    },
    "blockedExample": {
      "input": "Reconcile stock. Units mixed kg and cases. Waste missing.",
      "output": "VARIANCE BLOCKED\nUnits mixed; waste unknown.\nSupply one unit and waste qty before reconciling."
    }
  },
  {
    "id": "supplier-performance-scorecard",
    "title": "Supplier performance scorecard",
    "zone": "Suppliers and Finance",
    "summary": "Score suppliers on quality, delivery, price, and service with evidence.",
    "aliases": [
      "supplier-scorecard",
      "vendor-score"
    ],
    "coverageId": "supplier-performance-scorecard",
    "inputs": [
      "Supplier list with order history",
      "Scores criteria with weights explicit",
      "Evidence per score with dates"
    ],
    "outputs": [
      "Scorecard with weighted totals",
      "Actions per supplier"
    ],
    "tools": [
      "compare_purchase_costs",
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Score GreenFarm vs FreshCo for Feb 2026, USD. Criteria quality 40, delivery 30, price 30. GreenFarm quality 8 evidence 1 complaint, delivery 9 evidence 12 of 12 on time, price 7 evidence 250c per kg avg per invoices. FreshCo quality 7 evidence 3 complaints, delivery 7 evidence 10 of 12, price 8 evidence 240c per kg. Evidence delivery logs and invoices.",
      "output": "SCORECARD - Feb 2026\nGreenFarm: quality 8 evidence 1 complaint; delivery 9 evidence 12 of 12 on time; price 7 evidence 250c per kg avg; weighted 8.0.\nFreshCo: quality 7 evidence 3 complaints; delivery 7 evidence 10 of 12; price 8 evidence 240c per kg; weighted 7.3.\nMath: GreenFarm 8*.4+9*.3+7*.3=8.0; FreshCo 7*.4+7*.3+8*.3=7.3.\nActions: keep GreenFarm primary; review FreshCo delivery with rep.\nStatus: draft for buyer."
    },
    "blockedExample": {
      "input": "Score suppliers. Criteria and evidence missing.",
      "output": "SCORECARD BLOCKED\nCriteria unknown; evidence unknown.\nSet weighted criteria and gather evidence first."
    }
  },
  {
    "id": "supplier-substitution-review",
    "title": "Supplier substitution review",
    "zone": "Suppliers and Finance",
    "summary": "Review substitute products for spec, allergen, cost, and risk.",
    "aliases": [
      "substitution-review",
      "sub-swap"
    ],
    "inputs": [
      "Original spec with allergen states",
      "Substitute spec with label version",
      "Cost comparison with currency",
      "Test plan if needed"
    ],
    "outputs": [
      "Side by side comparison with verdict",
      "Test or approve recommendation"
    ],
    "tools": [
      "compare_purchase_costs",
      "validate_kitchen_data",
      "cost_recipe"
    ],
    "example": {
      "input": "Review sub for tomato passata Brand A to Brand B, Austin Central USD, run date 2026-03-10. A 200c per 1 kg labels v4 gluten unknown. B 180c per 1 kg labels v5 gluten verified_absent, basil contains per v5. Test batch 2026-03-12 owner Ana.",
      "output": "SUB REVIEW - Passata - 2026-03-10\nOrig A: 200c per kg; gluten unknown per v4; basil unknown.\nSub B: 180c per kg; gluten verified_absent per v5; basil contains per v5.\nDiffs: saves 20c per kg; allergen improves gluten but adds basil contains; taste TBC test.\nRecommend: test batch 2026-03-12 owner Ana; update matrix if approved.\nStatus: draft for chef and buyer. No swap made."
    },
    "blockedExample": {
      "input": "Review sub. Substitute label and cost missing.",
      "output": "SUB BLOCKED\nSubstitute label unknown; cost unknown.\nSupply both before review. No approval given."
    }
  },
  {
    "id": "table-turnover-pacing-plan",
    "title": "Table turnover pacing plan",
    "zone": "FOH and Guest Experience",
    "summary": "Pace seatings and courses to hit turnover without rushing guests.",
    "aliases": [
      "turnover-plan",
      "pacing-plan"
    ],
    "coverageId": "table-turnover-pacing-plan",
    "inputs": [
      "Covers, tables, seatings",
      "Course timings from kitchen",
      "Booking intervals"
    ],
    "outputs": [
      "Pacing grid with fire times",
      "Bottleneck flags"
    ],
    "tools": [
      "validate_prep_capacity",
      "get_workflow"
    ],
    "example": {
      "input": "Pace Fri dinner Austin Central 2026-03-13, 80 covers, 20 tables, 2 seatings 18:00 and 20:30. Kitchen mains 12 min fire, gap 20 min. Fires wave 1 starters 18:15 mains 18:45; wave 2 starters 20:45 mains 21:15. Grill max 12 mains per 15 min per Ben. Bookings 15 min intervals; hold 2 tables buffer. Wave 2 desserts overlap wash TBC.",
      "output": "PACING - 2026-03-13 - 80 covers\nWaves: 18:00 10 tables 40 covers; 20:30 10 tables 40 covers.\nFires: wave 1 starters 18:15, mains 18:45; wave 2 starters 20:45, mains 21:15.\nBottlenecks: grill max 12 mains per 15 min per Ben; wave 2 desserts overlap wash TBC.\nBookings: 15 min intervals; hold 2 tables buffer.\nStatus: draft for FOH and chef."
    },
    "blockedExample": {
      "input": "Plan pacing. Tables and kitchen timings missing.",
      "output": "PACING BLOCKED\nTables unknown; timings unknown.\nSupply both before pacing."
    }
  },
  {
    "id": "tasting-menu-builder",
    "title": "Tasting menu builder",
    "zone": "Menu and Product Development",
    "summary": "Build a coursed tasting menu with timings, costs, and allergen flags.",
    "aliases": [
      "tasting-menu",
      "tasting-builder"
    ],
    "coverageId": "tasting-menu-builder",
    "inputs": [
      "Course count and service date",
      "Dishes per course with yields",
      "Net price confirmed or TBC",
      "Allergen label versions"
    ],
    "outputs": [
      "Coursed menu with timings and costs",
      "Allergen flags per course"
    ],
    "tools": [
      "cost_recipe",
      "validate_kitchen_data",
      "get_workflow"
    ],
    "example": {
      "input": "Build 3 course tasting for Austin Central 2026-03-20, 20 covers, USD. Courses soup 250c allergens gluten unknown, fish 600c allergens fish contains per label v4, dessert 300c allergens milk contains per v4. Price 4000c confirmed. Timings fire 1 at 0 min, gap 20 min, fire 2, gap 25 min, fire 3.",
      "output": "TASTING MENU - 2026-03-20 - 20 covers\n1 Soup 250c allergens gluten unknown; 2 Fish 600c allergens fish contains per label v4; 3 Dessert 300c allergens milk contains per v4.\nTotal cost: 1150c per cover. Math: 250+600+300=1150. Price 4000c confirmed. Margin 2850c (71.25 percent).\nTimings: fire 1 at 0 min, gap 20 min, fire 2, gap 25 min, fire 3.\nApproval: pending head chef."
    },
    "blockedExample": {
      "input": "Build tasting menu. Two courses uncosted. Price unconfirmed.",
      "output": "TASTING BLOCKED\nKnown cost partial; 2 courses unknown.\nPrice unconfirmed; margin withheld.\nSupply costs and confirmed price to complete."
    }
  },
  {
    "id": "team-meeting-agenda-builder",
    "title": "Team meeting agenda builder",
    "zone": "People and Training",
    "summary": "Build a timed team meeting agenda with owners and pre reads.",
    "aliases": [
      "meeting-agenda",
      "team-agenda"
    ],
    "coverageId": "team-meeting-agenda-builder",
    "inputs": [
      "Meeting date, time, attendees",
      "Topics with owners and timeboxes",
      "Pre reads and decisions needed"
    ],
    "outputs": [
      "Timed agenda draft",
      "Actions template"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Agenda for kitchen team Austin Central 2026-03-12 10:00 America/Chicago, 45 min. Chair Ben. Attendees Ana Cara Mara Jo. Topics waste review Ana 10 min decide pre read waste log Feb; rota gaps Ben 10 min discuss pre read draft rota; allergen matrix Mara 10 min inform pre read matrix v4; actions and close 15 min.",
      "output": "AGENDA - Kitchen Team - 2026-03-12 10:00 America/Chicago 45 min\n10:00 waste review owner Ana type decide 10 min; pre read waste log Feb.\n10:10 rota gaps owner Ben type discuss 10 min; pre read draft rota.\n10:20 allergen matrix owner Mara type inform 10 min; pre read matrix v4.\n10:30 actions and close 15 min.\nActions: ____ owner ____ due ____.\nChair Ben. Attendees Ana Cara Mara Jo."
    },
    "blockedExample": {
      "input": "Build agenda. Date and topics missing.",
      "output": "AGENDA BLOCKED\nDate unknown; topics unknown.\nSupply both before drafting."
    }
  },
  {
    "id": "tender-brief-new-suppliers",
    "title": "Tender brief new suppliers",
    "zone": "Suppliers and Finance",
    "summary": "Brief supplier tenders with volumes, specs, and award criteria.",
    "aliases": [
      "tender-brief",
      "supplier-tender"
    ],
    "coverageId": "tender-brief-new-suppliers",
    "inputs": [
      "Categories with volumes and units",
      "Specs with quality bars",
      "Award criteria with weights",
      "Timeline with deadlines"
    ],
    "outputs": [
      "Tender brief draft for issue",
      "Evaluation sheet template"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Tender produce for Austin Central Q2 2026, USD, weekly 200 kg veg. Delivery Mon Thu 08:00 site dock B. Specs Grade A, next day delivery, temp on arrival per food plan, substitutions only with 24h notice, samples required. Criteria price 40 quality 40 service 20. Timeline questions by 2026-03-18, bids due 2026-03-25 17:00 America/Chicago, award week 2026-03-30. Contact buyer Mara mara at example dot com.",
      "output": "TENDER - Produce Q2 2026 - Austin Central\nVolumes: 200 kg veg weekly; delivery Mon Thu 08:00; site dock B.\nSpecs: Grade A; temp on arrival per food plan; substitutions only with 24h notice.\nCriteria: price 40 quality 40 service 20; samples required.\nTimeline: questions by 2026-03-18; bids due 2026-03-25 17:00 America/Chicago; award week 2026-03-30.\nContact: buyer Mara mara at example dot com.\nStatus: draft for legal."
    },
    "blockedExample": {
      "input": "Draft tender. Volumes and criteria missing.",
      "output": "TENDER BLOCKED\nVolumes unknown; criteria unknown.\nSupply both before drafting."
    }
  },
  {
    "id": "training-plan-generator",
    "title": "Training plan generator",
    "zone": "People and Training",
    "summary": "Build a skills training plan with modules, buddies, and sign offs.",
    "aliases": [
      "training-plan",
      "skills-plan"
    ],
    "coverageId": "training-plan-generator",
    "inputs": [
      "Trainee name, role, start date",
      "Required skills with current levels",
      "Buddies and sign off criteria"
    ],
    "outputs": [
      "Week by week training plan",
      "Sign off sheet blanks"
    ],
    "tools": [
      "get_workflow",
      "create_task",
      "list_tasks"
    ],
    "example": {
      "input": "Plan for Jo P, prep cook, Austin Central from 2026-03-16. Skills knife basics level new, allergen handling new, stock rotation observed once. Buddy Ana. Week 1 knife basics with Ana criteria safe dice 5 kg to spec; allergen handling classroom with Mara. Week 2 stock rotation solo with check criteria FIFO 5 days clean; soup prep observed. Reviews 2026-03-20 and 2026-03-27 with Ben. Certificates food handler TBC by HR.",
      "output": "TRAINING PLAN - Jo P - Prep Cook\nWeek 1: knife basics with Ana, criteria safe dice 5 kg to spec; allergen handling classroom with Mara.\nWeek 2: stock rotation solo with check, criteria FIFO 5 days clean; soup prep observed.\nReviews: 2026-03-20 and 2026-03-27 with Ben.\nSign off: knife ____ allergen ____ rotation ____ by manager after demo.\nCertificates: food handler TBC by HR."
    },
    "blockedExample": {
      "input": "Build training plan. Role and skills missing.",
      "output": "TRAINING BLOCKED\nRole unknown; skills unknown.\nSupply both before planning."
    }
  },
  {
    "id": "trial-shift-assessment",
    "title": "Trial shift assessment",
    "zone": "People and Training",
    "summary": "Record a trial shift with observed tasks and a human hiring decision.",
    "aliases": [
      "trial-shift",
      "stage-assessment"
    ],
    "coverageId": "trial-shift-assessment",
    "inputs": [
      "Candidate name, date, station, buddy",
      "Observed tasks with outcomes",
      "Local trial shift rules reference"
    ],
    "outputs": [
      "Assessment form with observations only",
      "Hiring decision left blank for humans"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Assess trial for Jo P on 2026-03-10, Austin Central, prep station, buddy Ana, 4 hours 14:00-18:00. Tasks veg prep 5 kg diced to spec pass, stock rotation FIFO pass, knife handling safe observed. Conduct polite, asked 3 clarifying questions; arrived 10 min late reason traffic stated by candidate. Hours 4 for payroll TBC by HR per local trial rules ref HR-2026-02.",
      "output": "TRIAL ASSESSMENT - Jo P - 2026-03-10\nStation prep, buddy Ana, hours 4 (14:00-18:00).\nTasks: veg prep 5 kg diced to spec pass; stock rotation FIFO pass; knife handling safe observed.\nConduct: polite, asked 3 clarifying questions; arrived 10 min late, reason traffic stated by candidate.\nHours: 4 for payroll TBC by HR per local trial rules ref HR-2026-02.\nDecision: blank for manager and HR. No hiring claim made."
    },
    "blockedExample": {
      "input": "Assess trial. Candidate name and hours missing.",
      "output": "ASSESSMENT BLOCKED\nCandidate unknown; hours unknown.\nSupply both before recording. No assessment invented."
    }
  },
  {
    "id": "upselling-training-script",
    "title": "Upselling training script",
    "zone": "FOH and Guest Experience",
    "summary": "Script honest upsells with triggers, phrases, and limits.",
    "aliases": [
      "upsell-script",
      "selling-training"
    ],
    "coverageId": "upselling-training-script",
    "inputs": [
      "Menu with margins or prices",
      "Upsell moments with triggers",
      "House limits on pressure"
    ],
    "outputs": [
      "Training script with role plays",
      "Limits checklist"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Script for Austin Central Mar 2026. Moments dessert with coffee trigger cleared mains, side upgrade trigger orders soup sourdough 300c, sparkling water trigger water asked. Prices dessert 900c coffee 400c. Limits one ask per moment, never upsell to intoxicated guests, respect decline immediately. Drills pair practice 3 rounds, manager observes Fri.",
      "output": "UPSELL SCRIPT - Austin Central - Mar 2026\nMoment 1 trigger cleared mains: phrase Shall I bring dessert and coffee menus. Accept bring menus; decline thank and clear.\nMoment 2 trigger orders soup: phrase Our sourdough pairs well at 300c. One ask only.\nMoment 3 trigger water asked: phrase Still or sparkling. No push.\nLimits: one ask per moment; never upsell to intoxicated guests; respect decline immediately.\nDrills: pair practice 3 rounds; manager observes Fri.\nStatus: draft for FOH lead."
    },
    "blockedExample": {
      "input": "Write upsell script. Menu and limits missing.",
      "output": "SCRIPT BLOCKED\nMenu unknown; limits unknown.\nSupply both before scripting."
    }
  },
  {
    "id": "usable-yield-verification",
    "title": "Usable yield verification",
    "zone": "Kitchen Operations",
    "summary": "Verify usable yield from gross with explicit unit and true cost per usable.",
    "aliases": [
      "yield-check",
      "usable-yield"
    ],
    "inputs": [
      "Gross qty with unit",
      "Usable qty with same unit",
      "Optional purchase cost with currency"
    ],
    "outputs": [
      "Yield percent with math shown",
      "Cost per usable unit when cost supplied"
    ],
    "tools": [
      "calculate_usable_yield",
      "convert_quantity",
      "validate_kitchen_data"
    ],
    "example": {
      "input": "Verify tomato yield Austin Central 2026-03-10, metric. Gross 10 kg at 1000c USD. Usable 8 kg after trim. Cause skin and core. Observer Ana. Source test T-2026-0310.",
      "output": "YIELD - Tomato - 2026-03-10\nGross: 10 kg; Usable: 8 kg; unit kg both.\nYield: 8/10 equals 80.0 percent.\nCost per usable: 1000/8 equals 125c per kg USD.\nTrim: 2 kg skin and core, observer Ana.\nStatus: verified for costing. Source test T-2026-0310."
    },
    "blockedExample": {
      "input": "Verify yield. Usable qty missing. Units gross kg vs usable g.",
      "output": "YIELD BLOCKED\nUsable qty unknown; units mismatch kg vs g.\nSupply usable in kg or explicit conversion. No yield issued."
    }
  },
  {
    "id": "vip-special-guest-brief",
    "title": "VIP special guest brief",
    "zone": "FOH and Guest Experience",
    "summary": "Brief VIP handling with preferences, privacy, and service touches.",
    "aliases": [
      "vip-brief",
      "special-guest-brief"
    ],
    "coverageId": "vip-special-guest-brief",
    "inputs": [
      "Guest name, date, occasion",
      "Preferences with sources",
      "Privacy needs"
    ],
    "outputs": [
      "VIP brief with actions and owners",
      "Privacy notes"
    ],
    "tools": [
      "get_workflow",
      "create_task"
    ],
    "example": {
      "input": "Brief VIP J Smith 2026-03-25, 4 covers, anniversary per host email 2026-03-20. Pref quiet corner table 12, still water, anniversary dessert candle. Allergy shellfish per host; kitchen flag to Ben; matrix shellfish unknown for soup verify. Privacy no photos, no social posts, staff discretion. Actions FOH lead greets, chef sends amuse TBC, bill to host.",
      "output": "VIP BRIEF - J Smith - 2026-03-25\nPrefs: quiet corner table 12 per host email 2026-03-20; still water; anniversary dessert candle.\nAllergy: shellfish contains risk per host; kitchen flag to Ben; matrix shellfish unknown for soup verify.\nPrivacy: no photos; no social posts; staff discretion.\nActions: FOH lead greets; chef sends amuse TBC; bill to host.\nStatus: draft for manager."
    },
    "blockedExample": {
      "input": "Brief VIP. Guest and preferences missing.",
      "output": "VIP BLOCKED\nGuest unknown; preferences unknown.\nSupply sourced details before briefing."
    }
  },
  {
    "id": "waste-review",
    "title": "Waste review",
    "zone": "Kitchen Operations",
    "summary": "Record observed waste and compare against the prep plan with named causes.",
    "aliases": [
      "waste",
      "waste-tracking",
      "waste-tracker"
    ],
    "coverageId": "waste-tracker",
    "inputs": [
      "Observed waste lines with item, qty, unit, observer, date",
      "Prep plan for the same date for comparison"
    ],
    "outputs": [
      "Waste log with totals by cause",
      "Variance note against prep plan"
    ],
    "tools": [
      "create_task",
      "list_tasks",
      "build_prep_plan"
    ],
    "example": {
      "input": "Review waste for Austin Central 2026-03-10. Observed: tomato trim 0.5 kg by Ana, cause trim. Soup overprep 2 servings by Ben, cause overprep. Prep made 8 servings soup.",
      "output": "WASTE REVIEW - Austin Central - 2026-03-10\nLines: tomato trim 0.5 kg, cause trim, observer Ana; soup 2 servings, cause overprep, observer Ben.\nTotals: trim 0.5 kg; overprep 2 servings.\nPlan comparison: soup made 8 servings, wasted 2 servings equals 25 percent overprep.\nActions: task for Ana to review trim technique; task for Ben to confirm covers forecast source.\nNo other waste observed."
    },
    "blockedExample": {
      "input": "Review waste. No observations provided for 2026-03-10.",
      "output": "WASTE REVIEW - 2026-03-10\nNo observed waste lines supplied.\nResult: none reported. No figures invented.\nAction: confirm with shift lead whether zero waste or missing log; log state unknown until confirmed."
    }
  },
  {
    "id": "wedding-catering-checklist",
    "title": "Wedding catering checklist",
    "zone": "Events and Banqueting",
    "summary": "Checklist wedding catering from tasting to load out with owners.",
    "aliases": [
      "wedding-checklist",
      "wedding-catering"
    ],
    "coverageId": "wedding-catering-checklist",
    "inputs": [
      "Wedding date, venue, covers",
      "Milestones tasting, BEO, staffing, kit",
      "Client contacts and vendors"
    ],
    "outputs": [
      "Dated checklist with owners",
      "Overdue flags"
    ],
    "tools": [
      "create_task",
      "list_tasks",
      "get_workflow"
    ],
    "example": {
      "input": "Checklist Garcia wedding 2026-05-02 Austin Central 80 covers, as of 2026-03-10. Tasting done 2026-02-20 owner Mara. Menu sign done 2026-03-15. BEO due 2026-04-15 owner event manager status draft. Staffing due 2026-04-20 owner manager status TBC. Kit list due 2026-04-22 owner Ben status TBC. Contacts client L Garcia; florist TBC; DJ TBC.",
      "output": "WEDDING CHECKLIST - Garcia - 2026-05-02\nTasting 2026-02-20 done owner Mara; menu sign 2026-03-15 done; BEO due 2026-04-15 owner event manager status draft;\nstaffing due 2026-04-20 owner manager status TBC; kit list due 2026-04-22 owner Ben status TBC.\nOverdue: none as of 2026-03-10.\nContacts: client L Garcia; florist TBC; DJ TBC.\nStatus: on track."
    },
    "blockedExample": {
      "input": "Build wedding checklist. Date and covers missing.",
      "output": "CHECKLIST BLOCKED\nDate unknown; covers unknown.\nSupply both before listing milestones."
    }
  },
  {
    "id": "wine-beverage-pairing-guide",
    "title": "Wine beverage pairing guide",
    "zone": "FOH and Guest Experience",
    "summary": "Pair drinks to dishes with reasons and explicit pricing.",
    "aliases": [
      "pairing-guide",
      "wine-pairing"
    ],
    "coverageId": "wine-beverage-pairing-guide",
    "inputs": [
      "Menu with flavors and weights",
      "Drinks list with prices",
      "House pour rules"
    ],
    "outputs": [
      "Pairing guide with reasons",
      "Upsell prompts"
    ],
    "tools": [
      "get_workflow",
      "cost_recipe"
    ],
    "example": {
      "input": "Pair 3 course Austin Central Mar 2026. Soup, fish, dessert. Wines house white 900c, pinot 1400c. Coffee 400c. Pour 150 ml.",
      "output": "PAIRINGS - Mar 2026 - Austin Central\nSoup with house white 900c: acidity cuts richness; pour 150 ml.\nFish with house white 900c: light weight match; alt pinot 1400c TBC stock.\nDessert with coffee 400c: avoids clash; wine pairing TBC.\nService: age and service rules per local licence TBC by bar lead; water with each pour.\nStatus: draft for bar lead."
    },
    "blockedExample": {
      "input": "Pair drinks. Menu and drinks list missing.",
      "output": "PAIRING BLOCKED\nMenu unknown; drinks unknown.\nSupply both before pairing."
    }
  }
];

export const WORKFLOW_NAMES = [
  'agency-chef-onboarding-generator',
  'allergen-management-system',
  'apprenticeship-tracker',
  'banquet-event-order',
  'bar-cocktail-recipe-builder',
  'burnout-stress-risk-assessment',
  'canape-reception-planner',
  'capacity-aware-prep',
  'catering-quotation',
  'chef-personal-brand-builder',
  'chef-wellbeing-check-in',
  'complaint-handling-resolution-log',
  'corporate-event-menu-planner',
  'coshh-chemical-safety',
  'daily-brief-generator',
  'daily-close-review',
  'data-reconciliation',
  'dietary-requirements-tracker',
  'disciplinary-documentation-helper',
  'dish-development-brief',
  'equipment-maintenance-log',
  'event-catering-brief',
  'event-equipment-kit-list',
  'event-run-of-show',
  'event-staffing-plan',
  'foh-service-brief',
  'food-safety-incident-report',
  'food-truck-event-profitability',
  'guest-feedback-analyser',
  'haccp-checklist-generator',
  'invoice-reconciliation',
  'kitchen-budget-planner',
  'kitchen-culture-health-check',
  'kitchen-ethos-doc-generator',
  'menu-description-writer',
  'menu-margin-review',
  'nutritional-information-calculator',
  'onboarding',
  'ordering-proposals',
  'partnership-growth-finder',
  'plate-photography-brief',
  'post-event-report',
  'prep-planning',
  'price-increase-impact-calculator',
  'private-dining-setup-guide',
  'purchase-price-review',
  'recipe-compliance-checker',
  'recipe-costing',
  'recipe-dependency-impact',
  'recipe-documentation',
  'recipe-scaling',
  'rota-builder',
  'seasonal-menu-planner',
  'social-media-content-generator',
  'sop-drafting',
  'staff-performance-review',
  'station-setup-checklist',
  'stock-take-template-generator',
  'stock-variance',
  'supplier-performance-scorecard',
  'supplier-substitution-review',
  'table-turnover-pacing-plan',
  'tasting-menu-builder',
  'team-meeting-agenda-builder',
  'tender-brief-new-suppliers',
  'training-plan-generator',
  'trial-shift-assessment',
  'upselling-training-script',
  'usable-yield-verification',
  'vip-special-guest-brief',
  'waste-review',
  'wedding-catering-checklist',
  'wine-beverage-pairing-guide',
] as const;
export type WorkflowName = (typeof WORKFLOW_NAMES)[number];

export const WORKFLOW_ZONES = [
  'Connected Workflows',
  'Events and Banqueting',
  'FOH and Guest Experience',
  'Kitchen Operations',
  'Menu and Product Development',
  'People and Training',
  'Suppliers and Finance',
  'Wellbeing and Social Media',
  'Workspace',
] as const;
export type WorkflowZone = (typeof WORKFLOW_ZONES)[number];

export function listCatalogEntries(): WorkflowDefinition[] { return [...WORKFLOW_CATALOG]; }
export function isWorkflowName(name: string): name is WorkflowName { return (WORKFLOW_NAMES as readonly string[]).includes(name); }
export function getWorkflowEntry(name: string): WorkflowDefinition {
  const e = WORKFLOW_CATALOG.find((w) => w.id === name || w.aliases.includes(name));
  if (!e) throw new Error(`unknown workflow ${name}; available: ${WORKFLOW_NAMES.join(', ')}`);
  return e;
}
