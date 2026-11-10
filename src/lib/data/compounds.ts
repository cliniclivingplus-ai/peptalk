import { Compound } from "@/types";

export const corePeptides: Compound[] = [
  {
    "id": "bpc-157",
    "name": "BPC-157",
    "fullName": "Body Protection Compound-157",
    "category": "Recovery",
    "overview": "BPC-157 is a synthetic peptide derived from a protective protein found in gastric juice. It is widely studied for its potential role in tissue repair, wound healing, and gut protection in preclinical models.",
    "mechanismOfAction": "BPC-157 is believed to promote angiogenesis (formation of new blood vessels), upregulate growth factor expression, and modulate the nitric oxide system. Research suggests it may interact with the dopaminergic and GABAergic systems.",
    "researchContexts": [
      "Tissue repair",
      "Tendon and ligament healing",
      "Gut protection",
      "Anti-inflammatory effects",
      "Neuroprotection"
    ],
    "dosageRanges": "PepPal publishes BPC-157 dosing only as part of the Wolverine Stack (BPC-157 + TB-500), GLOW, and KLOW blend protocols. See /protocols for the vetted protocols \u2014 we do not publish standalone BPC-157 dosing from outside research literature.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "tb-500",
    "name": "TB-500",
    "fullName": "Thymosin Beta-4 Fragment",
    "category": "Recovery",
    "overview": "TB-500 is a synthetic version of a naturally occurring peptide (Thymosin Beta-4) present in virtually all human and animal cells. It is extensively researched for wound healing, tissue repair, and anti-inflammatory properties.",
    "mechanismOfAction": "TB-500 promotes cell migration, blood vessel formation, and regulation of actin, a cell-building protein. It may also reduce inflammation and fibrosis by modulating inflammatory cytokines.",
    "researchContexts": [
      "Muscle repair",
      "Cardiac tissue repair",
      "Hair regrowth",
      "Anti-fibrotic effects",
      "Wound healing"
    ],
    "dosageRanges": "PepPal publishes TB-500 dosing only as part of the Wolverine Stack (BPC-157 + TB-500), GLOW, and KLOW blend protocols. See /protocols for the vetted protocols \u2014 we do not publish standalone TB-500 dosing from outside research literature.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "cjc-1295",
    "name": "CJC-1295 + Ipamorelin",
    "fullName": "CJC-1295 (No DAC) 5mg + Ipamorelin 5mg \u2014 Pre-Blended GH Secretagogue Stack",
    "category": "Growth Hormone",
    "tags": [
      "Recovery",
      "Fat Loss"
    ],
    "overview": "CJC-1295 (No DAC) and Ipamorelin are a pre-blended GH secretagogue stack that work on two different receptors in the GH axis \u2014 GHRH and ghrelin receptors \u2014 producing synergistic pulsatile GH release larger than either peptide alone. The no-DAC version preserves the body's natural pulsatile GH rhythm.",
    "mechanismOfAction": "CJC-1295 (No DAC / Mod GRF 1-29) is a GHRH analogue stimulating pituitary GH production. Ipamorelin is a selective ghrelin receptor agonist triggering clean GH pulses without significantly raising cortisol or prolactin. Together they produce synergistic pulsatile GH release.",
    "researchContexts": [
      "Growth hormone elevation",
      "Body composition",
      "Sleep quality",
      "Anti-aging research",
      "Recovery",
      "Cognitive clarity"
    ],
    "dosageRanges": "Step 1: 12 units/day (200 mcg of each). Step 2: 18 units/day (300 mcg of each). Once daily subcutaneous, evening/pre-sleep, fasted. 12\u201316 weeks on / 2\u20134 weeks off.",
    "reconstitution": {
      "typicalVialSize": "10 mg (5 mg CJC-1295 + 5 mg Ipamorelin)",
      "waterVolume": "3 mL bacteriostatic water",
      "resultingConcentration": "0.1667 mg per unit per peptide",
      "instructions": "Add 3 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 12 units = 200 mcg of each, 18 units = 300 mcg of each. Inject at least 1 hour before eating or 1.5 hours after last meal. Pre-sleep on empty stomach is optimal (insulin blunts GH release)."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C. Protect from light and moisture.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "CJC-1295 (No DAC): ~30 minutes. Ipamorelin: ~2 hours. Each injection produces a discrete GH pulse that clears within 30\u201360 minutes.",
    "stability": "Use promptly after reconstitution. Can be run indefinitely though 12\u201316 weeks on / 2\u20134 weeks off is recommended best practice."
  },
  {
    "id": "ipamorelin",
    "name": "Ipamorelin",
    "fullName": "Ipamorelin Acetate",
    "category": "Growth Hormone",
    "overview": "Ipamorelin is a selective growth hormone secretagogue (GHS) that mimics ghrelin to stimulate GH release. It is considered one of the mildest GH-releasing peptides with fewer side effects. Most commonly used as part of the CJC-1295 + Ipamorelin pre-blended stack for synergistic GH release.",
    "mechanismOfAction": "Ipamorelin selectively binds to the ghrelin receptor (GHS-R1a) in the pituitary gland, stimulating GH release without significantly affecting cortisol, prolactin, or ACTH levels. Amplifies the GH release triggered by CJC-1295.",
    "researchContexts": [
      "Growth hormone release",
      "Body composition",
      "Bone density",
      "Anti-aging",
      "Sleep improvement"
    ],
    "dosageRanges": "As part of pre-blended CJC-1295 + Ipamorelin stack: 200\u2013300 mcg per injection, once daily evening/pre-sleep in fasted state. See CJC-1295 + Ipamorelin entry for full protocol.",
    "reconstitution": {
      "typicalVialSize": "Typically supplied as pre-blended 10 mg vial (5 mg CJC-1295 + 5 mg Ipamorelin)",
      "waterVolume": "3 mL bacteriostatic water for 10 mg blended vial",
      "resultingConcentration": "0.1667 mg per unit per peptide",
      "instructions": "See CJC-1295 + Ipamorelin entry for full reconstitution and dosing protocol."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C or refrigerated. Keep away from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "Approximately 2 hours",
    "stability": "Moderately stable in solution when properly stored."
  },
  {
    "id": "semax",
    "name": "Semax",
    "fullName": "Semax (Synthetic ACTH 4-10 Analogue)",
    "category": "Cognitive",
    "tags": [
      "Cognitive"
    ],
    "overview": "Semax is a synthetic heptapeptide analogue of ACTH developed in Russia, where it is a registered pharmaceutical approved for stroke recovery, cognitive impairment, optic nerve disease, and ADHD-related conditions. It works primarily by upregulating BDNF and other neurotrophins, driving neuroplasticity, neuronal survival, and synapse formation. Cognitive effects are often felt within a single administration.",
    "mechanismOfAction": "Semax upregulates Brain-Derived Neurotrophic Factor (BDNF) and other neurotrophins, enhancing neuroplasticity and synapse formation. It also modulates the dopamine and serotonin systems, contributing to pronounced effects on focus, memory, stress resilience, and mood. Unlike most peptides, Semax is effective at very low doses.",
    "researchContexts": [
      "Cognitive enhancement",
      "BDNF upregulation",
      "Neuroprotection",
      "Focus & memory",
      "Neuroplasticity",
      "Mood stabilisation"
    ],
    "dosageRanges": "0.5\u20131 mg subcutaneous or intranasal daily (morning or early afternoon). Short cycle: 10\u201314 days on / 10\u201314 days off. Extended cycle: 4\u20138 weeks on / 2\u20134 weeks off. Many users find 0.5 mg to be their optimal dose.",
    "reconstitution": {
      "typicalVialSize": "10 mg",
      "waterVolume": "1 mL bacteriostatic water",
      "resultingConcentration": "0.1 mg per unit (10 mg/mL)",
      "instructions": "Add 1 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 0.5 mg = 5 units, 1 mg = 10 units. Also available as a ready-to-use nasal spray (100 mcg per actuation \u2014 0.5 mg = 5 sprays)."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C or refrigerated. Protect from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "Rapidly metabolized (minutes), but cognitive effects persist 4\u20136 hours via downstream BDNF signaling",
    "stability": "Stable when refrigerated. Morning or early afternoon dosing only \u2014 evening use may disrupt sleep."
  },
  {
    "id": "selank",
    "name": "Selank",
    "fullName": "Selank (Synthetic Tuftsin Analogue)",
    "category": "Cognitive",
    "tags": [
      "Cognitive",
      "Anti-Inflammatory"
    ],
    "overview": "Selank is a synthetic heptapeptide analogue of Tuftsin, developed in Russia alongside Semax. It is a registered pharmaceutical for anxiety disorders, asthenic conditions, and cognitive dysfunction. Selank produces a calming anxiolytic effect without sedation, amnesia, or dependence risk \u2014 the anxiolytic counterpart to Semax's stimulating profile.",
    "mechanismOfAction": "Selank works primarily through GABA-A receptor modulation and enkephalin stabilisation, producing anxiolytic effects without sedation or dependence. It also upregulates BDNF and serotonin expression, contributing to mood stability, stress resilience, and cognitive clarity.",
    "researchContexts": [
      "Anxiety reduction",
      "Cognitive enhancement",
      "Stress resilience",
      "GABA modulation",
      "Mood stabilisation",
      "Immune modulation"
    ],
    "dosageRanges": "250\u2013500 mcg subcutaneous or intranasal daily. 12 weeks on / 4 weeks off. Short cycles (14 days on / 7\u201314 days off) also valid. Many users find 250 mcg to be their optimal dose. Also suitable for as-needed use during acute stress.",
    "reconstitution": {
      "typicalVialSize": "10 mg",
      "waterVolume": "1 mL bacteriostatic water",
      "resultingConcentration": "0.1 mg per unit (10 mg/mL)",
      "instructions": "Add 1 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 250 mcg = 2.5 units, 500 mcg = 5 units. Also available as a ready-to-use nasal spray (100 mcg per actuation \u2014 split daily dose across 2\u20133 sessions)."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C or refrigerated. Protect from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "Rapidly metabolized (minutes), but anxiolytic and cognitive effects persist 1\u20134 hours via downstream signaling",
    "stability": "Stable when refrigerated. Timing is flexible \u2014 calming rather than stimulating, so no sleep disruption risk. No dependence or withdrawal."
  },
  {
    "id": "ghk-cu",
    "name": "GHK-Cu",
    "fullName": "Copper Peptide GHK-Cu",
    "category": "Anti-Aging",
    "tags": [
      "Anti-Inflammatory"
    ],
    "overview": "GHK-Cu is a naturally occurring copper-binding tripeptide found in human plasma, saliva, and urine. It is extensively researched for skin remodeling, wound healing, and anti-aging effects. Effects are cumulative and subtle \u2014 patience is key.",
    "mechanismOfAction": "GHK-Cu stimulates collagen and glycosaminoglycan synthesis, promotes stem cell activity, has anti-inflammatory and antioxidant effects, and modulates gene expression related to tissue remodeling.",
    "researchContexts": [
      "Skin rejuvenation",
      "Wound healing",
      "Hair growth",
      "Anti-aging",
      "Collagen synthesis"
    ],
    "dosageRanges": "Step 1: 1\u20132 mg daily subcutaneously. Step 2: 2.5\u20133 mg daily (advance when Step 1 is comfortable). No cycling off required \u2014 GHK-Cu can be used continuously.",
    "reconstitution": {
      "typicalVialSize": "50 mg",
      "waterVolume": "3 mL bacteriostatic water",
      "resultingConcentration": "0.167 mg per unit",
      "instructions": "Add 3 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 1 mg = 6 units, 2 mg = 12 units, 3 mg = 18 units. Rotate injection sites daily (abdomen, outer thigh, or deltoid)."
    },
    "storage": {
      "beforeReconstitution": "Store powder at -20\u00b0C, protected from light and moisture.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 4 weeks."
    },
    "halfLife": "Not well characterized for peptide form; copper complex is relatively stable",
    "stability": "Stable when properly stored. Mild injection site redness/swelling is normal and expected \u2014 not a reason to hold dose."
  },
  {
    "id": "tesamorelin",
    "name": "Tesamorelin",
    "fullName": "Tesamorelin Acetate",
    "category": "Growth Hormone",
    "tags": [
      "Fat Loss"
    ],
    "overview": "Tesamorelin is a stabilised synthetic analogue of Growth Hormone Releasing Hormone (GHRH). It is the only FDA-approved peptide for visceral fat reduction (brand name Egrifta), with robust clinical trial evidence. It triggers the pituitary's own pulsatile GH secretion for a natural hormonal rhythm.",
    "mechanismOfAction": "Tesamorelin binds to GHRH receptors, stimulating the synthesis and release of endogenous growth hormone from the pituitary while maintaining the physiological pulsatile pattern of GH secretion.",
    "researchContexts": [
      "Visceral fat reduction",
      "IGF-1 elevation",
      "Cognitive function",
      "Lipid profile improvement",
      "Body composition",
      "Sleep quality"
    ],
    "dosageRanges": "Step 1: 1 mg daily for 2 weeks (20 units). Step 2: 2 mg daily ongoing (40 units). Once daily subcutaneous, evening/pre-sleep, fasted. 12\u201316 weeks on / 4 weeks off.",
    "reconstitution": {
      "typicalVialSize": "5 mg or 10 mg",
      "waterVolume": "1 mL per 5 mg (5 mg vial = 1 mL, 10 mg vial = 2 mL)",
      "resultingConcentration": "0.05 mg per unit (both vial sizes identical concentration)",
      "instructions": "Draw up slowly along the vial wall \u2014 do not shake. 1 mg dose = 20 units, 2 mg dose = 40 units. Inject at least 1 hour before eating or 1.5\u20132 hours after last meal. Pre-sleep on empty stomach is optimal."
    },
    "storage": {
      "beforeReconstitution": "Refrigerate at 2\u20138\u00b0C. Do not freeze.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "26\u201338 minutes",
    "stability": "Less stable than some peptides; use promptly after reconstitution. Visceral fat results are most pronounced between weeks 8\u201316."
  },
  {
    "id": "pt-141",
    "name": "PT-141",
    "fullName": "Bremelanotide (PT-141)",
    "category": "Sexual Health",
    "overview": "PT-141 (Bremelanotide) is a synthetic peptide analog of alpha-melanocyte-stimulating hormone. It is FDA-approved (as Vyleesi) for hypoactive sexual desire disorder in premenopausal women and studied for sexual dysfunction.",
    "mechanismOfAction": "PT-141 activates melanocortin-4 receptors (MC4R) in the central nervous system, which are involved in sexual arousal pathways. Unlike PDE5 inhibitors, it works through the CNS rather than vascular mechanisms.",
    "researchContexts": [
      "Sexual dysfunction",
      "Hypoactive sexual desire",
      "Melanocortin system research",
      "CNS signaling"
    ],
    "dosageRanges": "We don't have an official PepPal protocol for this peptide yet, so we don't publish specific dosing, frequency, or cycle numbers here. For compounds we do have vetted protocols on, see the Protocols page.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "mt-2",
    "name": "MT-2",
    "fullName": "Melanotan II",
    "category": "Sexual Health",
    "overview": "Melanotan II is a synthetic analog of alpha-melanocyte-stimulating hormone (\u03b1-MSH). It is researched for its effects on skin pigmentation, sexual function, and appetite suppression.",
    "mechanismOfAction": "MT-2 is a non-selective agonist of melanocortin receptors (MC1R through MC5R). Activation of MC1R stimulates melanogenesis (tanning), while MC4R activation affects sexual arousal and appetite.",
    "researchContexts": [
      "Skin pigmentation",
      "UV protection research",
      "Sexual dysfunction",
      "Appetite modulation"
    ],
    "dosageRanges": "We don't have an official PepPal protocol for this peptide yet, so we don't publish specific dosing, frequency, or cycle numbers here. For compounds we do have vetted protocols on, see the Protocols page.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "glp-1",
    "name": "GLP-1 Agonists",
    "fullName": "Glucagon-Like Peptide-1 Receptor Agonists",
    "category": "Metabolic",
    "tags": [
      "Fat Loss"
    ],
    "overview": "GLP-1 receptor agonists are a class of peptides that mimic the incretin hormone GLP-1. They are FDA-approved for type 2 diabetes and obesity management and are among the most widely studied peptide-based therapies.",
    "mechanismOfAction": "GLP-1 agonists bind to GLP-1 receptors, enhancing glucose-dependent insulin secretion, suppressing glucagon, slowing gastric emptying, and promoting satiety through CNS mechanisms.",
    "researchContexts": [
      "Type 2 diabetes",
      "Obesity / weight management",
      "Cardiovascular protection",
      "Neuroprotection",
      "NAFLD/NASH"
    ],
    "dosageRanges": "PepPal's vetted GLP-class protocol is Retatrutide (GLP-3RT, triple agonist). See /protocols for the full Retatrutide protocol. We do not publish dosing for generic GLP-1 analogs.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "glp-2",
    "name": "GLP-2 Analogs",
    "fullName": "Glucagon-Like Peptide-2 Receptor Agonists",
    "category": "Metabolic",
    "overview": "GLP-2 analogs, such as teduglutide, are researched for their role in intestinal growth and repair. Teduglutide is FDA-approved for short bowel syndrome.",
    "mechanismOfAction": "GLP-2 activates GLP-2 receptors on intestinal subepithelial myofibroblasts, promoting crypt cell proliferation, reducing apoptosis, and enhancing intestinal absorption capacity.",
    "researchContexts": [
      "Short bowel syndrome",
      "Intestinal adaptation",
      "Gut barrier function",
      "Intestinal mucosal growth"
    ],
    "dosageRanges": "We don't have an official PepPal protocol for this peptide yet, so we don't publish specific dosing, frequency, or cycle numbers here. For compounds we do have vetted protocols on, see the Protocols page.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "glp-3rt",
    "name": "GLP-3RT",
    "fullName": "Retatrutide (GLP-1/GIP/Glucagon Triple Receptor Agonist)",
    "category": "Metabolic",
    "tags": [
      "Fat Loss"
    ],
    "overview": "GLP-3RT (Retatrutide) is a novel triple-agonist peptide that activates GLP-1, GIP, and glucagon receptors simultaneously. It is being investigated for obesity and type 2 diabetes, with early clinical trials showing significant weight loss results.",
    "mechanismOfAction": "Retatrutide activates three key metabolic receptors: GLP-1R (appetite suppression, insulin secretion), GIPR (enhanced incretin effect), and GCGR (increased energy expenditure, hepatic fat reduction). This triple mechanism may produce greater metabolic effects than single or dual agonists.",
    "researchContexts": [
      "Obesity / weight management",
      "Type 2 diabetes",
      "Metabolic syndrome",
      "NAFLD/NASH",
      "Cardiovascular risk reduction"
    ],
    "dosageRanges": "Dose escalation: Step 1: 1\u20132 mg/week (weeks 1\u20134). Step 2: 2\u20133 mg (weeks 4\u20138). Step 3: 3\u20134 mg (weeks 8\u201312). Step 4: 4\u20136 mg (weeks 12\u201316+). Advance only when current dose is comfortable for 2+ consecutive weeks.",
    "reconstitution": {
      "typicalVialSize": "10 mg, 20 mg, or 30 mg",
      "waterVolume": "1 mL per 10 mg of peptide",
      "resultingConcentration": "0.1 mg per unit (all vial sizes)",
      "instructions": "Draw up slowly along the vial wall \u2014 do not shake. 2 mg dose = 20 units, 4 mg dose = 40 units. Once weekly subcutaneous injection. Inject on the same day each week for consistency."
    },
    "storage": {
      "beforeReconstitution": "Refrigerate at 2\u20138\u00b0C. Do not freeze.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 28 days."
    },
    "halfLife": "Approximately 6 days (once weekly dosing)",
    "stability": "Generally stable when refrigerated. Slower titration typically means better long-term tolerability."
  },
  {
    "id": "nad-plus",
    "name": "NAD+",
    "fullName": "Nicotinamide Adenine Dinucleotide",
    "category": "Anti-Aging",
    "overview": "NAD+ is a coenzyme found in every cell in the body, essential for energy production, DNA repair, sirtuin activation, and cellular stress response. NAD+ levels decline significantly with age. Subcutaneous injection bypasses the digestive conversion pathway for higher bioavailability than oral NMN/NR supplementation.",
    "mechanismOfAction": "NAD+ serves as a substrate for sirtuins (SIRT1-7), PARPs (DNA repair enzymes), and CD38. It plays a critical role in mitochondrial function, oxidative phosphorylation, and epigenetic regulation.",
    "researchContexts": [
      "Anti-aging",
      "Mitochondrial function",
      "Neuroprotection",
      "DNA repair",
      "Metabolic health",
      "Cognitive clarity",
      "Physical recovery"
    ],
    "dosageRanges": "Weeks 1\u20132: 25 mg (15 units) 2\u20133x/week. Weeks 3\u20134: 50 mg (30 units) 2\u20133x/week. Weeks 5+: 100 mg (60 units) 2\u20133x/week. 3 months on / 1 month off.",
    "reconstitution": {
      "typicalVialSize": "500 mg",
      "waterVolume": "3 mL bacteriostatic water",
      "resultingConcentration": "1.667 mg per unit",
      "instructions": "Add 3 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. Allow to dissolve fully. 25 mg = 15 units, 50 mg = 30 units, 100 mg = 60 units. Inject on non-consecutive days (e.g. Mon/Wed/Fri). Morning dosing recommended \u2014 NAD+ is energising."
    },
    "storage": {
      "beforeReconstitution": "Refrigerate at 2\u20138\u00b0C. Protect from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 4 weeks."
    },
    "halfLife": "Approximately 30\u201345 minutes; effects accumulate with consistent use",
    "stability": "Moderately stable when refrigerated. Sensitive to heat and light. Flushing/warmth is a normal vasodilation response that subsides with continued use."
  },
  {
    "id": "kpv",
    "name": "KPV",
    "fullName": "Lysine-Proline-Valine (KPV Tripeptide)",
    "category": "Anti-Inflammatory",
    "tags": [
      "Anti-Aging"
    ],
    "overview": "KPV is a tripeptide derived from alpha-melanocyte-stimulating hormone (\u03b1-MSH). It is researched for its potent anti-inflammatory properties, particularly in gut inflammation, skin conditions, and immune modulation.",
    "mechanismOfAction": "KPV enters cells and inhibits NF-\u03baB activation and inflammatory cytokine production (IL-1\u03b2, TNF-\u03b1, IL-6). It can cross the blood-brain barrier and has been studied for both systemic and localized anti-inflammatory effects.",
    "researchContexts": [
      "Gut inflammation / IBD",
      "Skin inflammation",
      "Immune modulation",
      "Wound healing",
      "Autoimmune conditions"
    ],
    "dosageRanges": "Research literature discusses oral/capsule forms at 200\u2013500 mcg per day, or subcutaneous at 200\u2013400 mcg per day. Topical and suppository forms are also studied.",
    "reconstitution": {
      "typicalVialSize": "5 mg",
      "waterVolume": "2 mL bacteriostatic water",
      "resultingConcentration": "2,500 mcg/mL (2.5 mg/mL)",
      "instructions": "Add bacteriostatic water slowly. Gently swirl to dissolve."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C or refrigerated.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "Short (minutes); effects are downstream and longer lasting",
    "stability": "Relatively stable when stored properly."
  },
  {
    "id": "mots-c",
    "name": "MOTS-c",
    "fullName": "Mitochondrial Open Reading Frame of the 12S rRNA-c",
    "category": "Metabolic",
    "tags": [
      "Fat Loss"
    ],
    "overview": "MOTS-c is a mitochondria-derived peptide that activates the AMPK pathway \u2014 the body's primary energy-sensing system. It plays a key role in metabolic regulation, insulin sensitivity, fat oxidation, and cellular stress resilience. Naturally produced during fasting and exercise; levels decline with age.",
    "mechanismOfAction": "MOTS-c activates AMPK signaling, enhances glucose uptake and fatty acid oxidation, and promotes mitochondrial biogenesis. It translocates to the nucleus under metabolic stress to regulate gene expression related to antioxidant response. Has systemic effects across muscle, fat, liver, and brain.",
    "researchContexts": [
      "Metabolic regulation",
      "AMPK activation",
      "Insulin sensitivity",
      "Fat oxidation",
      "Aging and longevity",
      "Exercise mimetic"
    ],
    "dosageRanges": "Step 1: 1\u20132 mg daily (10\u201320 units) for 2 weeks. Step 2: 3\u20135 mg daily (30\u201350 units). Once daily subcutaneous, fasted morning. 8\u201312 weeks on / 4 weeks off.",
    "reconstitution": {
      "typicalVialSize": "10 mg",
      "waterVolume": "1 mL bacteriostatic water",
      "resultingConcentration": "0.1 mg per unit",
      "instructions": "Add 1 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 1 mg = 10 units, 2 mg = 20 units, 5 mg = 50 units. Inject fasted in the morning. Allow 3\u20134 hours between injection and resistance training (AMPK can transiently suppress mTOR)."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C. Protect from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 2\u20133 weeks."
    },
    "halfLife": "Not well characterized in humans; estimated hours",
    "stability": "Store cold; less stable at room temperature. Dosing is highly individual \u2014 some users find benefit at 1 mg, others require 4\u20135 mg."
  },
  {
    "id": "tirzepatide",
    "name": "Tirzepatide",
    "fullName": "Tirzepatide (GLP-1/GIP Dual Agonist)",
    "category": "Metabolic",
    "tags": [
      "Fat Loss"
    ],
    "overview": "Tirzepatide is an FDA-approved dual GIP/GLP-1 receptor agonist used for type 2 diabetes (Mounjaro) and obesity (Zepbound). It has shown superior weight loss results compared to single GLP-1 agonists in clinical trials.",
    "mechanismOfAction": "Tirzepatide activates both GIP and GLP-1 receptors, enhancing insulin secretion, suppressing glucagon, slowing gastric emptying, and reducing appetite through central and peripheral mechanisms. The dual agonism provides additive metabolic benefits.",
    "researchContexts": [
      "Type 2 diabetes",
      "Obesity / weight loss",
      "Cardiovascular health",
      "NAFLD/NASH",
      "Metabolic syndrome"
    ],
    "dosageRanges": "PepPal's vetted GLP-class protocol is Retatrutide (GLP-3RT). See /protocols for the full Retatrutide protocol. We do not publish dosing for Tirzepatide \u2014 for prescribed Mounjaro/Zepbound, follow your prescriber's titration plan.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "semaglutide",
    "name": "Semaglutide",
    "fullName": "Semaglutide (GLP-1 Receptor Agonist)",
    "category": "Metabolic",
    "tags": [
      "Fat Loss"
    ],
    "overview": "Semaglutide is an FDA-approved GLP-1 receptor agonist available as injectable (Ozempic, Wegovy) and oral (Rybelsus) formulations. It is widely used for type 2 diabetes and chronic weight management.",
    "mechanismOfAction": "Semaglutide binds to and activates GLP-1 receptors, stimulating glucose-dependent insulin release, inhibiting glucagon secretion, slowing gastric emptying, and reducing appetite via hypothalamic signaling. Its albumin-binding modification extends its half-life.",
    "researchContexts": [
      "Type 2 diabetes",
      "Obesity / weight management",
      "Cardiovascular risk reduction",
      "NAFLD/NASH",
      "Alzheimer's research"
    ],
    "dosageRanges": "PepPal's vetted GLP-class protocol is Retatrutide (GLP-3RT). See /protocols for the full Retatrutide protocol. We do not publish dosing for Semaglutide \u2014 for prescribed Ozempic/Wegovy, follow your prescriber's titration plan.",
    "reconstitution": {
      "typicalVialSize": "See PepPal protocol (not yet available for this peptide)",
      "waterVolume": "See PepPal protocol (not yet available for this peptide)",
      "resultingConcentration": "See PepPal protocol (not yet available for this peptide)",
      "instructions": "Reconstitution math depends on dosing \u2014 and we only publish reconstitution guidance for peptides that have an official PepPal protocol PDF. Check /protocols for vetted protocols."
    },
    "storage": {
      "beforeReconstitution": "General peptide guidance: refrigerate or freeze, protect from light. Specific guidance only published for peptides with an official PepPal protocol.",
      "afterReconstitution": "General peptide guidance: refrigerate at 2\u20138\u00b0C. Specific guidance only published for peptides with an official PepPal protocol."
    },
    "halfLife": "Not published here \u2014 PepPal only publishes detailed pharmacokinetic guidance for peptides covered by an official protocol PDF.",
    "stability": "PepPal does not publish a stability/cycling protocol for this peptide. See /protocols for vetted protocols."
  },
  {
    "id": "klow-blend",
    "name": "KLOW",
    "fullName": "KLOW Peptide Blend (GHK-Cu 50mg + KPV 10mg + BPC-157 10mg + TB-500 10mg)",
    "category": "Blend",
    "overview": "KLOW is a four-peptide blend combining GHK-Cu, KPV, BPC-157, and TB-500 for synergistic gut health, skin repair, and systemic anti-inflammatory support. Daily dosing allows all four peptides to work together for compounding benefit.",
    "mechanismOfAction": "GHK-Cu drives skin regeneration and collagen synthesis. KPV provides NF-\u03baB inhibition, gut barrier repair, and immune modulation. BPC-157 targets tissue repair and gut health. TB-500 promotes systemic tissue regeneration and reduces inflammation.",
    "researchContexts": [
      "Gut health",
      "Skin healing",
      "Anti-inflammatory support",
      "Tissue repair",
      "Immune modulation"
    ],
    "dosageRanges": "Step 1: 12 units/day (~3.2 mg total \u2014 GHK-Cu ~2 mg, KPV ~0.4 mg, BPC-157 ~0.4 mg, TB-500 ~0.4 mg). Step 2: 15 units/day (~4.0 mg total \u2014 GHK-Cu 2.5 mg, KPV 0.5 mg, BPC-157 0.5 mg, TB-500 0.5 mg). 12\u201316 weeks on / 4 weeks off.",
    "reconstitution": {
      "typicalVialSize": "80 mg (GHK-Cu 50mg + KPV 10mg + BPC-157 10mg + TB-500 10mg)",
      "waterVolume": "3 mL bacteriostatic water",
      "resultingConcentration": "0.267 mg per unit",
      "instructions": "Add 3 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 12 units = ~3.2 mg total, 15 units = ~4.0 mg total. Rotate injection sites daily. Mild redness/swelling is normal (GHK-Cu response)."
    },
    "storage": {
      "beforeReconstitution": "Refrigerate or freeze per guidance.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 4 weeks."
    },
    "halfLife": "Varies by component peptides",
    "stability": "Cycling driven by TB-500 component. GHK-Cu, BPC-157, and KPV do not individually require cycling."
  },
  {
    "id": "cagrilintide",
    "name": "Cagrilintide",
    "fullName": "Cagrilintide (Long-Acting Amylin Receptor Agonist)",
    "category": "Metabolic",
    "tags": [
      "Fat Loss"
    ],
    "overview": "Cagrilintide is a long-acting acylated amylin analogue developed by Novo Nordisk for once-weekly subcutaneous injection. It selectively activates amylin receptors (AMY1/2/3) in the brainstem and hypothalamus, driving satiety independent of the GLP-1 pathway, slowing gastric emptying, and suppressing postprandial glucagon. Studied standalone and in combination with semaglutide (CagriSema / REDEFINE trials), it produces dose-dependent weight loss with a favorable tolerability profile relative to GLP-1 agonists alone.",
    "mechanismOfAction": "Cagrilintide binds amylin receptors (calcitonin receptor heterodimers with RAMP1/2/3) in the area postrema and nucleus tractus solitarius, triggering satiety signaling via a distinct neuronal circuit from GLP-1 \u2014 which is why it shows additive effects with GLP-1 agonists. It slows gastric emptying via vagal pathways, suppresses postprandial glucagon in a glucose-dependent manner, may enhance leptin sensitivity, and its C18 fatty di-acid acylation enables reversible albumin binding for a ~7-day half-life and stable weekly dosing.",
    "researchContexts": [
      "Obesity / weight management",
      "Appetite & satiety regulation",
      "Body composition (fat mass reduction with lean-mass preservation)",
      "Glycemic control (fasting glucose, HbA1c)",
      "Combination with GLP-1 receptor agonists (CagriSema)"
    ],
    "dosageRanges": "Weekly SC titration: 0.25 mg (wk 1\u20134) \u2192 0.50 mg (wk 4\u20138) \u2192 1.0 mg (wk 8\u201312) \u2192 1.7 mg (wk 12\u201316) \u2192 2.0 or 2.4 mg (wk 16+ maintenance). See the full Cagrilintide protocol at /protocol/cagrilintide.",
    "reconstitution": {
      "typicalVialSize": "5 mg",
      "waterVolume": "1 mL bacteriostatic water",
      "resultingConcentration": "5 mg/mL (5,000 mcg/mL) \u2014 1 mg = 20 units on a 100U insulin syringe",
      "instructions": "Bring vial and bac water to room temperature. Wipe tops with alcohol. Inject bac water slowly down the side of the vial \u2014 do not agitate. Gently roll (do not shake) until fully dissolved. Solution should be clear and colorless \u2014 discard if cloudy or particulate. Once weekly SC (abdomen, thigh, or upper arm). Rotate sites weekly."
    },
    "storage": {
      "beforeReconstitution": "Refrigerate at 2\u20138\u00b0C. Do not freeze.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Stable for up to 28 days. Do not freeze."
    },
    "halfLife": "Approximately 7 days \u2014 enables true once-weekly dosing",
    "stability": "Generally stable when refrigerated for the 28-day reconstituted window. Slower titration (extending phases 2\u20134 weeks if GI symptoms appear) markedly improves long-term tolerability."
  },
  {
    "id": "glow-blend",
    "name": "GLOW",
    "fullName": "GLOW Peptide Blend (GHK-Cu 50mg + BPC-157 10mg + TB-500 10mg)",
    "category": "Blend",
    "overview": "GLOW is a three-peptide blend combining GHK-Cu, BPC-157, and TB-500 for skin regeneration, tissue repair, and systemic recovery. Daily dosing maximizes cumulative benefit across all three peptides.",
    "mechanismOfAction": "GHK-Cu drives skin regeneration, collagen synthesis, and anti-aging effects. BPC-157 promotes tissue repair, gut health, and anti-inflammatory response. TB-500 provides systemic tissue regeneration, flexibility, and reduced inflammation.",
    "researchContexts": [
      "Skin rejuvenation",
      "Anti-aging",
      "Collagen synthesis",
      "Tissue repair",
      "Systemic recovery"
    ],
    "dosageRanges": "Step 1: 12 units/day (~2.8 mg total \u2014 GHK-Cu ~2 mg, BPC-157 ~0.4 mg, TB-500 ~0.4 mg). Step 2: 15 units/day (~3.5 mg total \u2014 GHK-Cu 2.5 mg, BPC-157 0.5 mg, TB-500 0.5 mg). 12\u201316 weeks on / 4 weeks off.",
    "reconstitution": {
      "typicalVialSize": "70 mg (GHK-Cu 50mg + BPC-157 10mg + TB-500 10mg)",
      "waterVolume": "3 mL bacteriostatic water",
      "resultingConcentration": "0.233 mg per unit",
      "instructions": "Add 3 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 12 units = ~2.8 mg total, 15 units = ~3.5 mg total. Rotate injection sites daily. Mild redness/swelling is normal (GHK-Cu response)."
    },
    "storage": {
      "beforeReconstitution": "Refrigerate or freeze per guidance.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 4 weeks."
    },
    "halfLife": "Varies by component peptides",
    "stability": "Cycling driven by TB-500 component. GHK-Cu and BPC-157 do not individually require cycling."
  },
  {
    "id": "wolverine-stack",
    "name": "Wolverine Stack",
    "fullName": "Wolverine Stack (BPC-157 10mg + TB-500 10mg)",
    "category": "Blend",
    "tags": [
      "Anti-Inflammatory",
      "Recovery"
    ],
    "overview": "The Wolverine Stack is a pre-blended combination of BPC-157 and TB-500 \u2014 the two most widely studied tissue-repair peptides. Both work systemically but through different pathways, activating two complementary repair cascades simultaneously for significantly greater recovery than either peptide alone.",
    "mechanismOfAction": "BPC-157 drives repair via angiogenesis, collagen synthesis, and nitric oxide / growth hormone receptor signalling with enhanced local effect near injury sites. TB-500 drives repair via cell migration, actin regulation, and broad anti-inflammatory signalling throughout the body.",
    "researchContexts": [
      "Tissue repair",
      "Tendon & ligament healing",
      "Post-surgical recovery",
      "Systemic recovery",
      "Gut health",
      "Anti-inflammatory"
    ],
    "dosageRanges": "Step 1: 6 units/day (300 mcg BPC-157 + 300 mcg TB-500) for 1\u20132 weeks. Step 2: 10 units/day (500 mcg BPC-157 + 500 mcg TB-500) \u2014 standard maintenance dose. 12\u201316 weeks on / 4 weeks off.",
    "reconstitution": {
      "typicalVialSize": "20 mg (10 mg BPC-157 + 10 mg TB-500)",
      "waterVolume": "2 mL bacteriostatic water",
      "resultingConcentration": "0.05 mg (50 mcg) per unit per peptide",
      "instructions": "Add 2 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 6 units = 300 mcg of each, 10 units = 500 mcg of each. For localised injuries, inject subcutaneously near the affected area for enhanced BPC-157 local repair."
    },
    "storage": {
      "beforeReconstitution": "Store at -20\u00b0C or refrigerated. Protect from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "BPC-157: ~4 hours. TB-500: ~12\u201314 days.",
    "stability": "Well tolerated by most users. Rest period recommended to keep peptide receptors responsive."
  },
  {
    "id": "igf1-lr3",
    "name": "IGF-1 LR3",
    "fullName": "Insulin-Like Growth Factor 1 Long Arg3",
    "category": "Growth Hormone",
    "tags": [
      "Recovery",
      "Fat Loss"
    ],
    "overview": "IGF-1 LR3 is a synthetic analogue of the naturally occurring IGF-1 hormone with an arginine substitution at position 3 and 13 additional N-terminus amino acids. These modifications reduce binding-protein affinity, giving it a 20\u201330 hour half-life and ~3x the potency of native IGF-1. Uniquely, it drives muscle hypertrophy and fat oxidation simultaneously.",
    "mechanismOfAction": "Binds IGF-1 receptors throughout muscle and adipose tissue, activating the PI3K/Akt/mTOR pathway to drive protein synthesis and satellite cell proliferation, while stimulating lipolysis in fat tissue. Post-workout timing leverages elevated muscle insulin sensitivity and GLUT4 upregulation for superior nutrient partitioning.",
    "researchContexts": [
      "Muscle hypertrophy",
      "Body composition",
      "Recovery acceleration",
      "Nutrient partitioning",
      "Connective tissue support",
      "Lean gain retention"
    ],
    "dosageRanges": "Week 1: 20\u201340 mcg/day (2\u20134 units) tolerance assessment. Weeks 2\u20138: 60\u201380 mcg/day (6\u20138 units) maintenance. Once daily subcutaneous, post-workout preferred (within 30 minutes) or morning fasted on rest days. Never inject within 2 hours of bedtime. 8 weeks on / 8 weeks off.",
    "reconstitution": {
      "typicalVialSize": "1 mg (1000 mcg)",
      "waterVolume": "1 mL bacteriostatic water",
      "resultingConcentration": "10 mcg per unit (0.01 mg per unit)",
      "instructions": "Add 1 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake or agitate. 20mcg = 2u, 40mcg = 4u, 60mcg = 6u, 80mcg = 8u."
    },
    "storage": {
      "beforeReconstitution": "Store lyophilized powder at -20\u00b0C, protected from light.",
      "afterReconstitution": "Refrigerate immediately at 2\u20138\u00b0C. Use within 2\u20133 weeks. Significantly less stable than most peptides \u2014 do not leave out of the fridge. Some users aliquot to minimise freeze-thaw cycles."
    },
    "halfLife": "Approximately 20\u201330 hours.",
    "stability": "Lower solution stability than most peptides \u2014 strict refrigeration required. Hypoglycaemia risk: always inject post-meal, never fasted in the post-workout window. Contraindicated with active malignancy/cancer history, active diabetic retinopathy, and users under 25."
  },
  {
    "id": "l-glutathione",
    "name": "L-Glutathione",
    "fullName": "L-Glutathione (GSH)",
    "category": "Anti-Aging",
    "tags": [
      "Detoxification",
      "Skin Health"
    ],
    "overview": "L-Glutathione (GSH) is the body's most abundant endogenous antioxidant \u2014 a tripeptide of cysteine, glycine, and glutamic acid produced in virtually every cell. Often called the 'master antioxidant,' it neutralises free radicals directly and regenerates other antioxidants including Vitamins C and E. Glutathione levels decline with age, chronic illness, oxidative stress, and poor lifestyle. Injectable glutathione bypasses the digestive system, delivering dramatically higher bioavailability than oral forms.",
    "mechanismOfAction": "L-Glutathione neutralises reactive oxygen species and free radicals directly, while also regenerating oxidised Vitamin C and Vitamin E back to their active reduced forms. It inhibits tyrosinase activity in melanocytes, contributing to skin brightening and even tone. It supports Phase I and Phase II liver detoxification pathways, binds heavy metals for elimination, and maintains mitochondrial integrity under oxidative stress.",
    "researchContexts": [
      "Skin brightening",
      "Liver detoxification",
      "Antioxidant status",
      "Immune support",
      "Heavy metal chelation",
      "Anti-aging",
      "Cellular health"
    ],
    "dosageRanges": "Phase 1: 50mg 3x/week (Mon/Wed/Fri) for 2 weeks. Phase 2: 100mg 3x/week for 2 weeks. Phase 3: 200mg 3x/week for remainder of 4\u20136 week cycle. IM preferred (deltoid, vastus lateralis, ventrogluteal); SubQ alternative at lower doses. 4\u20136 weeks on / 4 weeks off.",
    "reconstitution": {
      "typicalVialSize": "1500 mg",
      "waterVolume": "7.5 mL bacteriostatic water",
      "resultingConcentration": "200 mg/mL (2 mg per unit)",
      "instructions": "Add 7.5 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake or agitate. This single reconstitution covers all phases. 50mg = 25 units, 100mg = 50 units, 200mg = 100 units."
    },
    "storage": {
      "beforeReconstitution": "Store lyophilized powder at -20\u00b0C or in a cool, dry place away from light. Stable for 12+ months.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Use within 3\u20134 weeks."
    },
    "halfLife": "Relatively short (minutes to a few hours); effects are driven by antioxidant regeneration and downstream signaling rather than sustained plasma levels",
    "stability": "Moderate stability in solution when refrigerated. Pair with Vitamin C 500\u20131000mg daily to regenerate oxidised glutathione. Cycle off strictly \u2014 4 weeks off after every 4\u20136 week cycle."
  },
  {
    "id": "kisspeptin-10",
    "name": "Kisspeptin-10",
    "fullName": "Kisspeptin-10 (KP-10, KISS1R/GPR54 Agonist)",
    "category": "Sexual Health",
    "tags": [
      "Hormonal",
      "Sexual Health"
    ],
    "overview": "Kisspeptin-10 (KP-10) is the minimal bioactive fragment of the kisspeptin family \u2014 a 10-amino-acid C-terminal sequence that retains full binding affinity for the KISS1R (GPR54) receptor. It is the most potent known stimulator of the human reproductive hormone axis, driving GnRH release and downstream LH/FSH secretion. Two 2023 JAMA Network Open RCTs confirmed kisspeptin improves sexual brain processing and penile tumescence in men with hypoactive sexual desire disorder, including when testosterone was already normal. Originally characterised in oncology as 'metastin' for its antimetastatic activity.",
    "mechanismOfAction": "KP-10 binds KISS1R (GPR54), a Gq-coupled GPCR on GnRH neurons in the arcuate and anteroventral periventricular nuclei. Binding activates phospholipase C, generating IP3 and DAG, triggering calcium release and action potential firing in GnRH neurons \u2014 driving pulsatile GnRH secretion, then LH and FSH release from the anterior pituitary and downstream Leydig cell testosterone production. It also acts on limbic regions including the medial amygdala to modulate sexual motivation independent of testosterone. KP-10 neurons co-express neurokinin B and dynorphin (KNDy neurons), forming the central GnRH pulse generator \u2014 which is why sustained, non-pulsatile stimulation causes desensitization.",
    "researchContexts": [
      "HPG axis stimulation",
      "LH & FSH elevation",
      "Testosterone axis support",
      "Libido & sexual motivation",
      "Testicular function preservation",
      "Antimetastatic research (oncology)"
    ],
    "dosageRanges": "Daily SC, 16-week cycle: 100 mcg (wk 1\u20134) \u2192 200 mcg (wk 5\u20138) \u2192 300 mcg (wk 9\u201312) \u2192 mandatory 4-week washout (wk 13\u201316). Fasted morning dosing. Tachyphylaxis begins around Week 2 of continuous daily use \u2014 monitor LH and testosterone. See the full Kisspeptin-10 protocol at /protocol/kisspeptin-10.",
    "reconstitution": {
      "typicalVialSize": "10 mg",
      "waterVolume": "3 mL bacteriostatic water",
      "resultingConcentration": "3.33 mg/mL (3,333 mcg/mL)",
      "instructions": "Add 3 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 100 mcg = 3 units, 200 mcg = 6 units, 300 mcg = 9 units on a 100-unit insulin syringe. Use a 29\u201331 gauge, 0.5 inch syringe for precision."
    },
    "storage": {
      "beforeReconstitution": "Store lyophilized powder frozen or refrigerated, protected from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Stable up to 28 days with bacteriostatic water. Do not freeze."
    },
    "halfLife": "~4 minutes IV \u2014 subcutaneous absorption extends the active window, but the effect period remains brief",
    "stability": "Stable up to 28 days refrigerated after reconstitution. Cycling is mandatory: 12 weeks on / 4 weeks off. KISS1R desensitizes with sustained daily stimulation, so the washout is required to restore receptor sensitivity. Do not combine with GnRH agonists or antagonists."
  },
  {
    "id": "dsip",
    "name": "DSIP",
    "fullName": "Delta Sleep-Inducing Peptide",
    "category": "Sleep",
    "tags": [
      "Sleep",
      "Cognitive",
      "Recovery"
    ],
    "overview": "DSIP is a naturally occurring nonapeptide first isolated from rabbit cerebral venous blood in 1977 at the University of Basel, named for its ability to increase slow-wave (delta) EEG activity \u2014 the deepest, most restorative sleep stage. Subsequent research revealed a far broader profile spanning stress, pain, hormone regulation, and antioxidant activity. Unusually, its gene has never been identified. It crosses the blood-brain barrier, which distinguishes it from most peptides and underpins its central effects.",
    "mechanismOfAction": "DSIP acts as a neuromodulator rather than a sedative, normalizing dysregulated sleep architecture and increasing delta-wave activity. It reduces basal ACTH and blunts stress-induced cortisol elevation (HPA axis modulation), shares partial structural similarity with dermorphin and is hypothesized to have partial opioid receptor agonism (mild analgesia, attenuation of alcohol and opiate withdrawal), scavenges reactive oxygen species and protects mitochondrial function under hypoxia, and stimulates GHRH and GH release while inhibiting somatostatin \u2014 producing a net pro-GH environment. Anticonvulsant activity has also been documented in animal models.",
    "researchContexts": [
      "Slow-wave sleep enhancement",
      "Sleep onset latency",
      "Cortisol & HPA axis modulation",
      "Stress resilience",
      "Mild analgesia",
      "Antioxidant & neuroprotection",
      "GH axis support"
    ],
    "dosageRanges": "Daily SC 30\u201360 minutes before bed: 300 mcg (wk 1\u20132) \u2192 500 mcg (wk 2\u20134) \u2192 1,000 mcg (wk 4+ maintenance). Cycle 8\u201310 weeks on / 4\u20136 weeks off, or a 5-days-on / 2-days-off weekly structure. See the full DSIP protocol at /protocol/dsip.",
    "reconstitution": {
      "typicalVialSize": "10 mg",
      "waterVolume": "1 mL bacteriostatic water",
      "resultingConcentration": "10 mg/mL (10,000 mcg/mL) \u2014 100 mcg per unit",
      "instructions": "Add 1 mL of bacteriostatic water slowly along the vial wall \u2014 do not shake. 300 mcg = 3 units, 500 mcg = 5 units, 1,000 mcg = 10 units. Use a 29\u201331 gauge insulin syringe for precision at these low volumes."
    },
    "storage": {
      "beforeReconstitution": "Store lyophilized powder frozen or refrigerated, protected from light.",
      "afterReconstitution": "Refrigerate at 2\u20138\u00b0C. Stable up to 28 days with bacteriostatic water. Do not freeze."
    },
    "halfLife": "~30 minutes in plasma \u2014 short, which is why dosing is daily and timed 30\u201360 minutes before bed",
    "stability": "Low molecular stability compared with most peptides \u2014 source quality and cold-chain handling matter significantly. Inspect solution before each use. Effects can attenuate with continuous daily use; cycle 8\u201310 weeks on / 4\u20136 weeks off to preserve responsiveness."
  }
];

export const vaultItems: Compound[] = [];

export const allCompounds: Compound[] = [...corePeptides, ...vaultItems];
