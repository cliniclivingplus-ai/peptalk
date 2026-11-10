import { Protocol } from "@/types";

export const protocols: Protocol[] = [
  {
    "id": "glp-3rt",
    "name": "Retatrutide (GLP-3RT) Protocol",
    "subtitle": "Individualized titration based on personal tolerance and side effect profile",
    "tagline": "GLP-1/GIP/Glucagon Triple Agonist",
    "cycleInfo": "Weekly subcutaneous \u2014 individualized titration",
    "whatIsIt": "",
    "pdfUrl": "/protocols/Retatrutide_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Use 1ml of bacteriostatic water (bac water) per 10mg of peptide. Draw up slowly along the vial wall \u2014 do not shake.",
      "table": [
        {
          "vial": "10mg",
          "water": "1ml (100 units)",
          "concentration": "0.1mg per unit",
          "reference": "1mg = 10 units"
        },
        {
          "vial": "20mg",
          "water": "2ml (200 units)",
          "concentration": "0.1mg per unit",
          "reference": "1mg = 10 units"
        },
        {
          "vial": "30mg",
          "water": "3ml (300 units)",
          "concentration": "0.1mg per unit",
          "reference": "1mg = 10 units"
        }
      ],
      "note": "Example: If your dose is 2mg, draw to the 20-unit mark on your syringe. If your dose is 0.5mg, draw to the 5-unit mark."
    },
    "corePrinciple": "There is no fixed timeline. Everyone responds differently to retatrutide. Progress through dose levels only when you feel ready \u2014 not on a rigid schedule. Slower titration typically means better long-term tolerability and fewer side effects.",
    "injectionFrequency": "",
    "doseSteps": [
      {
        "step": 1,
        "dose": "1\u20132 mg",
        "notes": "Weeks 1\u20134 \u2014 Starting dose. Give your body time to adjust. No rush."
      },
      {
        "step": 2,
        "dose": "2\u20133 mg",
        "notes": "Weeks 4\u20138 \u2014 Only increase if Step 1 is comfortable with mild or no side effects."
      },
      {
        "step": 3,
        "dose": "3\u20134 mg",
        "notes": "Weeks 8\u201312 \u2014 Therapeutic range begins. Many people find their maintenance dose here."
      },
      {
        "step": 4,
        "dose": "4\u20136 mg",
        "notes": "Weeks 12\u201316+ \u2014 Advance only if tolerating well. Max dose is not the goal \u2014 the right dose is."
      }
    ],
    "doseEscalationNote": "Move to the next step only when your current dose feels comfortable with minimal or manageable side effects.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Only if side effects are mild or absent at your current dose for at least 2 consecutive weeks."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you're experiencing noticeable nausea, fatigue, vomiting, or other GI symptoms. Wait until they resolve before considering an increase."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are significantly affecting daily life. Stepping down is not a setback \u2014 it's smart dose management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose indefinitely if you're seeing good results and feeling well. Reaching the maximum dose is not the goal; finding your optimal dose is."
      }
    ],
    "sideEffects": [
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "Eat smaller portions, avoid greasy/spicy food. Usually fades within 1\u20132 weeks."
      },
      {
        "effect": "Nausea",
        "severity": "Moderate\u2013Severe",
        "action": "Pause escalation. Hold current dose until symptoms improve (1\u20133 weeks)."
      },
      {
        "effect": "Vomiting",
        "severity": "Any",
        "action": "Hold dose increase. If persistent (>48h), consider a dose reduction."
      },
      {
        "effect": "Fatigue / Dizziness",
        "severity": "Any",
        "action": "Ensure adequate hydration and caloric intake. Hold escalation."
      },
      {
        "effect": "Constipation",
        "severity": "Any",
        "action": "Increase fiber and fluid intake. A gentle laxative may help."
      },
      {
        "effect": "Severe GI distress",
        "severity": "Severe",
        "action": "Do not escalate. Reduce dose or pause, and consult your provider."
      },
      {
        "effect": "Pancreatitis signs*",
        "severity": "Any",
        "action": "Stop immediately. Seek medical attention."
      }
    ],
    "sideEffectWarning": "* Pancreatitis warning signs: sudden severe abdominal pain (may radiate to the back), persistent nausea/vomiting, fever.",
    "tips": [
      "Inject on the same day each week for consistency.",
      "Eat smaller, lower-fat meals \u2014 especially in the days following a dose increase.",
      "Stay well hydrated. Dehydration worsens nausea and dizziness.",
      "Avoid alcohol, especially during the titration phase.",
      "Keep a brief log: note your dose, injection date, and any side effects to track your patterns.",
      "If you feel great and are progressing at a lower dose, there is no need to escalate."
    ]
  },
  {
    "id": "",
    "name": "GLOW Blend Dosing Protocol",
    "subtitle": "GHK-Cu 50mg | BPC-157 10mg | TB-500 10mg",
    "tagline": "Skin Regeneration & Tissue Repair Blend",
    "cycleInfo": "Daily subcutaneous \u2014 12\u201316 weeks on / 4 weeks off",
    "whatIsIt": "",
    "pdfUrl": "/protocols/GLOW_Dosing_Protocol.pdf",
    "components": [
      {
        "peptide": "GHK-Cu",
        "amount": "50mg",
        "role": "Skin regeneration, anti-aging, wound healing, copper bioavailability"
      },
      {
        "peptide": "BPC-157",
        "amount": "10mg",
        "role": "Tissue repair, gut health, anti-inflammatory, tendon & ligament healing"
      },
      {
        "peptide": "TB-500",
        "amount": "10mg",
        "role": "Systemic tissue regeneration, flexibility, reduced inflammation"
      }
    ],
    "reconstitution": {
      "instructions": "Add 3ml of bacteriostatic water (bac water) per vial. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "70mg",
          "water": "3ml (300 units)",
          "concentration": "0.233mg per unit",
          "reference": "12u = 2.8mg | 15u = 3.5mg"
        }
      ],
      "doseBreakdown": "At 15 units: GHK-Cu 2.5mg | BPC-157 0.5mg | TB-500 0.5mg per dose"
    },
    "corePrinciple": "GLOW is dosed subcutaneously once daily. Daily dosing maximizes cumulative benefit across all three peptides. GHK-Cu and BPC-157 on their own do not require cycling \u2014 the scheduled break is driven by the TB-500 component.",
    "injectionFrequency": "Once daily subcutaneously. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites daily. Mild redness, warmth, or swelling at the injection site is a normal and expected reaction.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "12 units/day (~2.8mg)",
        "notes": "Starting dose. Inject once daily subcutaneously. GHK-Cu ~2mg | BPC-157 ~0.4mg | TB-500 ~0.4mg. Injection site redness or mild swelling is normal \u2014 rotate sites each day."
      },
      {
        "step": 2,
        "dose": "15 units/day (~3.5mg)",
        "notes": "Advance when Step 1 is comfortable. Standard maintenance dose. GHK-Cu 2.5mg | BPC-157 0.5mg | TB-500 0.5mg."
      }
    ],
    "doseEscalationNote": "Move to Step 2 only when your Step 1 dose feels comfortable. Injection site reactions are normal and not a reason to hold.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "When Step 1 is comfortable with no significant systemic side effects. Injection site reaction alone is not a reason to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience notable fatigue, nausea, or other systemic symptoms. Wait until resolved before increasing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are significantly affecting daily life. Stepping down is smart dose management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose if you are seeing good results and feeling well. No need to push to the maximum."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 12\u201316 weeks, take a full 4-week break before resuming. This applies to GLOW and all peptides in this blend."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Expected with GHK-Cu. Rotate sites daily. Apply light pressure post-injection. No action needed unless severe."
      },
      {
        "effect": "Skin Flushing / Warmth",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal copper-peptide response. Resolves within 30\u201360 min post-injection."
      },
      {
        "effect": "Metallic Taste",
        "severity": "Mild",
        "action": "Transient and common with GHK-Cu. No action needed. Ensure doses are not exceeded."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated before and after injection. Usually dose-dependent and transient."
      },
      {
        "effect": "Fatigue / Lethargy",
        "severity": "Any",
        "action": "Ensure adequate sleep and hydration. If persistent, hold escalation until resolved."
      },
      {
        "effect": "Nausea",
        "severity": "Any",
        "action": "Reduce dose. Ensure injection is subcutaneous, not intramuscular."
      },
      {
        "effect": "Copper Toxicity Signs*",
        "severity": "Severe",
        "action": "Stop immediately. Seek medical attention."
      }
    ],
    "sideEffectWarning": "* Copper toxicity warning signs: nausea, vomiting, abdominal pain, jaundice, confusion, or dark urine. Rare at recommended doses.",
    "tips": [
      "Supplement with Zinc 20\u201330mg daily. GHK-Cu increases copper availability \u2014 zinc helps maintain a healthy copper-to-zinc balance.",
      "Inject at the same time each day for consistency.",
      "Rotate injection sites every dose \u2014 abdomen, thigh, and deltoid are all suitable.",
      "Stay well hydrated \u2014 dehydration can amplify fatigue and headache side effects.",
      "Cycle off after 12\u201316 weeks. Take a full 4-week break before resuming. Do not skip the rest phase.",
      "GLOW effects are cumulative. Expect meaningful results at 6\u201312 weeks, not days.",
      "Avoid co-administration with heavy antioxidants (high-dose Vitamin C/E) immediately before or after injection, as these may interfere with copper bioavailability.",
      "Keep a brief log: note your dose, injection date, site, and any side effects to track your patterns.",
      "If you are progressing well at a lower dose, there is no need to escalate."
    ]
  },
  {
    "id": "klow",
    "name": "KLOW Blend Dosing Protocol",
    "subtitle": "GHK-Cu 50mg | KPV 10mg | BPC-157 10mg | TB-500 10mg",
    "tagline": "Anti-Inflammatory & Immune Modulation Blend",
    "cycleInfo": "Daily subcutaneous \u2014 12\u201316 weeks on / 4 weeks off",
    "whatIsIt": "",
    "pdfUrl": "/protocols/KLOW_Dosing_Protocol.pdf",
    "components": [
      {
        "peptide": "GHK-Cu",
        "amount": "50mg",
        "role": "Skin regeneration, anti-aging, wound healing, copper bioavailability"
      },
      {
        "peptide": "KPV",
        "amount": "10mg",
        "role": "Anti-inflammatory, gut barrier repair, immune modulation, skin healing"
      },
      {
        "peptide": "BPC-157",
        "amount": "10mg",
        "role": "Tissue repair, gut health, anti-inflammatory, tendon & ligament healing"
      },
      {
        "peptide": "TB-500",
        "amount": "10mg",
        "role": "Systemic tissue regeneration, flexibility, reduced inflammation"
      }
    ],
    "reconstitution": {
      "instructions": "Add 3ml of bacteriostatic water (bac water) per vial. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "80mg",
          "water": "3ml (300 units)",
          "concentration": "0.267mg per unit",
          "reference": "12u = 3.2mg | 15u = 4.0mg"
        }
      ],
      "doseBreakdown": "At 15 units: GHK-Cu 2.5mg | KPV 0.5mg | BPC-157 0.5mg | TB-500 0.5mg per dose"
    },
    "corePrinciple": "KLOW is dosed subcutaneously once daily. Daily dosing allows all four peptides to work synergistically for compounding benefit. GHK-Cu, BPC-157, and KPV on their own do not require cycling \u2014 the scheduled break is driven by the TB-500 component.",
    "injectionFrequency": "Once daily subcutaneously. Common injection sites: abdomen, outer thigh, or deltoid. Rotate sites daily. Mild redness, warmth, or swelling at the injection site is a normal and expected reaction.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "12 units/day (~3.2mg)",
        "notes": "Starting dose. Inject once daily subcutaneously. GHK-Cu ~2mg | KPV ~0.4mg | BPC-157 ~0.4mg | TB-500 ~0.4mg. Injection site redness or mild swelling is normal \u2014 rotate sites each day."
      },
      {
        "step": 2,
        "dose": "15 units/day (~4.0mg)",
        "notes": "Advance when Step 1 is comfortable. Standard maintenance dose. GHK-Cu 2.5mg | KPV 0.5mg | BPC-157 0.5mg | TB-500 0.5mg."
      }
    ],
    "doseEscalationNote": "Move to Step 2 only when your Step 1 dose feels comfortable. Injection site reactions are normal and not a reason to hold.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "When Step 1 is comfortable with no significant systemic side effects. Injection site reaction alone is not a reason to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience notable fatigue, nausea, or other systemic symptoms. Wait until resolved before increasing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are significantly affecting daily life. Stepping down is smart dose management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose if you are seeing good results and feeling well. No need to push to the maximum."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 12\u201316 weeks, take a full 4-week break before resuming. This applies to KLOW and all peptides in this blend."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Expected with GHK-Cu. Rotate sites daily. Apply light pressure post-injection. No action needed unless severe."
      },
      {
        "effect": "Skin Flushing / Warmth",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal copper-peptide response. Resolves within 30\u201360 min post-injection."
      },
      {
        "effect": "Metallic Taste",
        "severity": "Mild",
        "action": "Transient and common with GHK-Cu. No action needed. Ensure doses are not exceeded."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated before and after injection. Usually dose-dependent and transient."
      },
      {
        "effect": "Fatigue / Lethargy",
        "severity": "Any",
        "action": "Ensure adequate sleep and hydration. If persistent, hold escalation until resolved."
      },
      {
        "effect": "Nausea",
        "severity": "Any",
        "action": "Reduce dose. Ensure injection is subcutaneous, not intramuscular."
      },
      {
        "effect": "GI Discomfort",
        "severity": "Mild",
        "action": "May relate to KPV or BPC-157 gut activity. Usually transient. Reduce dose if persistent."
      },
      {
        "effect": "Copper Toxicity Signs*",
        "severity": "Severe",
        "action": "Stop immediately. Seek medical attention."
      }
    ],
    "sideEffectWarning": "* Copper toxicity warning signs: nausea, vomiting, abdominal pain, jaundice, confusion, or dark urine. Rare at recommended doses.",
    "tips": [
      "Supplement with Zinc 20\u201330mg daily. GHK-Cu increases copper availability \u2014 zinc helps maintain a healthy copper-to-zinc balance.",
      "Inject at the same time each day for consistency.",
      "Rotate injection sites every dose \u2014 abdomen, thigh, and deltoid are all suitable.",
      "Stay well hydrated \u2014 dehydration can amplify fatigue and headache side effects.",
      "Cycle off after 12\u201316 weeks. Take a full 4-week break before resuming. Do not skip the rest phase.",
      "KLOW effects are cumulative. Expect meaningful results at 6\u201312 weeks, not days.",
      "Avoid co-administration with heavy antioxidants (high-dose Vitamin C/E) immediately before or after injection, as these may interfere with copper bioavailability.",
      "KLOW's KPV component offers additional anti-inflammatory and immune-modulating benefits \u2014 users with inflammatory conditions may notice effects earlier than those using GLOW.",
      "Keep a brief log: note your dose, injection date, site, and any side effects to track your patterns.",
      "If you are progressing well at a lower dose, there is no need to escalate."
    ]
  },
  {
    "id": "mots-c",
    "name": "MOTS-c Dosing Protocol",
    "subtitle": "Mitochondria-Derived Peptide \u2014 AMPK Pathway Activator",
    "tagline": "Metabolic Optimization & Longevity",
    "cycleInfo": "Once daily subcutaneous \u2014 fasted morning \u2014 8\u201312 weeks on / 4 weeks off",
    "whatIsIt": "MOTS-c (Mitochondrial Open Reading Frame of the 12S rRNA Type-c) is a mitochondria-derived peptide that activates the AMPK pathway \u2014 the body's primary energy-sensing system. It plays a key role in metabolic regulation, insulin sensitivity, fat oxidation, and cellular stress resilience. MOTS-c is naturally produced during fasting and exercise, and its levels decline with age. Unlike many peptides that target a single tissue, MOTS-c has systemic effects across muscle, fat, liver, and brain \u2014 making it a powerful tool for metabolic health, body composition, and longevity.",
    "pdfUrl": "/protocols/MOTS-c_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Use 1ml of bacteriostatic water (bac water) per 10mg of peptide. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "10mg",
          "water": "1ml (100 units)",
          "concentration": "0.1mg per unit",
          "reference": "1mg = 10u | 2mg = 20u | 3mg = 30u | 5mg = 50u"
        }
      ]
    },
    "corePrinciple": "MOTS-c is dosed subcutaneously once daily, in the morning, in a fasted state. This timing mirrors the body's natural MOTS-c production pattern, which peaks during fasting and caloric restriction, and maximises its metabolic and fat-oxidation effects.",
    "injectionFrequency": "Once daily in the morning, fasted. AMPK vs. mTOR: MOTS-c activates the AMPK pathway, which can transiently suppress mTOR signalling. Allow at least 3\u20134 hours between your MOTS-c injection and any weight training. Ideally pair with fasted cardio, low-intensity movement, or rest days. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "1\u20132mg (10\u201320 units)",
        "notes": "Starting dose. Inject once daily subcutaneously in a fasted state. Assess energy, sleep quality, and metabolic response over 2 weeks before advancing. Injection site redness is normal \u2014 rotate sites daily."
      },
      {
        "step": 2,
        "dose": "3\u20135mg (30\u201350 units)",
        "notes": "Advance when Step 1 is well tolerated. Standard performance and metabolic range. Start at 3mg and increase toward 5mg only if comfortable and needed. Response varies significantly per individual."
      }
    ],
    "doseEscalationNote": "MOTS-c dosing is highly individual. Start low and assess your response \u2014 some users find meaningful benefit at 1mg; others require 4\u20135mg. There is no need to rush escalation.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "After 2 weeks at Step 1 with good tolerability and no significant systemic side effects."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience notable fatigue, sleep disruption, nausea, or other systemic symptoms. Wait until resolved before increasing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are affecting daily life. Stepping down is smart dose management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "If you are seeing good results at your current dose. There is no benefit to pushing to the maximum."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 8\u201312 weeks, take a full 4-week break before resuming. Recommended best practice for mitochondrial peptides."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal subcutaneous response. Rotate sites daily. Apply light pressure post-injection. No action needed unless severe."
      },
      {
        "effect": "Fatigue / Low Energy (initial)",
        "severity": "Mild",
        "action": "May occur as metabolism adjusts in early weeks. Typically resolves within 1\u20132 weeks. Ensure adequate sleep and hydration."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Sleep Disruption",
        "severity": "Mild",
        "action": "Morning fasted dosing should mitigate this. If sleep is still disrupted, ensure no other stimulants are stacked close to MOTS-c injection."
      },
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "Reduce dose. Ensure injection is subcutaneous. Staying well hydrated before injection helps."
      },
      {
        "effect": "Blunted Training / Recovery Response",
        "severity": "Moderate",
        "action": "Likely AMPK/mTOR competition. Ensure at least 3\u20134 hours between injection and resistance training. Time MOTS-c on rest or cardio days where possible."
      },
      {
        "effect": "Hypoglycaemia Signs*",
        "severity": "Severe",
        "action": "Reduce dose immediately. MOTS-c improves insulin sensitivity \u2014 users on insulin or blood sugar medications must monitor closely and consult a healthcare provider before use."
      }
    ],
    "sideEffectWarning": "* Hypoglycaemia warning signs: dizziness, shakiness, cold sweat, confusion, rapid heartbeat. More likely in users already on glucose-lowering medications.",
    "tips": [
      "Always inject fasted in the morning. This mirrors MOTS-c's natural production window and maximises its metabolic and fat-oxidation effects.",
      "Separate from resistance training by at least 3\u20134 hours. AMPK activation can transiently suppress mTOR \u2014 the key driver of muscle protein synthesis. Pair MOTS-c with fasted cardio or rest days where possible.",
      "Rotate injection sites every dose \u2014 abdomen, love handles, upper glute fat, and back of arm fat are all suitable.",
      "Stay well hydrated \u2014 MOTS-c's metabolic activity increases cellular energy demand.",
      "Users on diabetes medications or insulin must consult a healthcare provider before use. MOTS-c meaningfully improves insulin sensitivity and may require medication adjustment.",
      "Effects are cumulative and subtle, particularly in the first 2\u20134 weeks. Track energy levels, body composition, and workout recovery over time rather than day to day.",
      "Cycle off after 8\u201312 weeks. Take a 4-week break before resuming.",
      "Keep a brief log: note your dose, injection date, fasting window, and any side effects to identify your optimal dose.",
      "If you are seeing good results at a lower dose, there is no need to escalate."
    ]
  },
  {
    "id": "ghk-cu",
    "name": "GHK-Cu Dosing Protocol",
    "subtitle": "Copper Peptide \u2014 Regeneration & Anti-Aging",
    "tagline": "Skin Repair, Wound Healing & Longevity",
    "cycleInfo": "Daily subcutaneous \u2014 no titration off required",
    "whatIsIt": "GHK-Cu (Glycyl-L-Histidyl-L-Lysine Copper) is a naturally occurring copper-binding peptide with potent regenerative, anti-inflammatory, and anti-aging properties. It promotes collagen synthesis, skin remodeling, wound healing, and hair growth. GHK-Cu levels decline significantly with age, making supplementation a key tool for tissue repair and longevity.",
    "pdfUrl": "/protocols/GHK-Cu_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Use 1ml of bacteriostatic water (bac water) per 10mg of peptide. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "50mg",
          "water": "3ml (300 units)",
          "concentration": "0.167mg per unit",
          "reference": "1mg = 6u | 2mg = 12u | 3mg = 18u"
        }
      ],
      "note": "Example: If your dose is 1mg, draw to the 6-unit mark on your syringe. If your dose is 2mg, draw to the 12-unit mark. If your dose is 3mg, draw to the 18-unit mark."
    },
    "corePrinciple": "There is no fixed timeline. GHK-Cu effects are cumulative and subtle \u2014 patience is key. Progress through dose levels only when comfortable, and do not rush escalation in pursuit of faster results.",
    "injectionFrequency": "GHK-Cu is dosed subcutaneously once daily. Daily dosing maximizes cumulative benefit. There is no need to cycle off or taper \u2014 GHK-Cu can be used on an ongoing basis without a structured discontinuation protocol. Common injection sites: abdomen, outer thigh, or deltoid. Rotate sites daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "1\u20132mg daily",
        "notes": "Starting dose. Inject once daily subcutaneously. Injection site redness or mild swelling is normal and expected \u2014 rotate sites each day."
      },
      {
        "step": 2,
        "dose": "2.5\u20133mg daily",
        "notes": "Advance when Step 1 is comfortable. Standard maintenance range for most users. No need to taper or cycle off \u2014 GHK-Cu can be used continuously."
      }
    ],
    "doseEscalationNote": "Move to Step 2 only when your Step 1 dose feels comfortable. Injection site reactions are normal and not a reason to hold.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "When Step 1 is comfortable with no significant systemic side effects. Injection site reaction alone is not a reason to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience notable fatigue, nausea, or other systemic symptoms. Wait until resolved before increasing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are significantly affecting daily life. Stepping down is smart dose management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose if you are seeing good results and feeling well. No need to push to the maximum."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Expected and normal with GHK-Cu. Rotate sites daily. Apply light pressure after injection. No action needed unless severe."
      },
      {
        "effect": "Skin Flushing / Warmth",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal copper-peptide response. Usually resolves within 30\u201360 min post-injection. No action needed."
      },
      {
        "effect": "Metallic Taste",
        "severity": "Mild",
        "action": "Transient and common. No action needed. Ensure you are not exceeding recommended doses."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated before and after injection. Usually dose-dependent and transient."
      },
      {
        "effect": "Fatigue / Lethargy",
        "severity": "Any",
        "action": "Ensure adequate sleep and hydration. If persistent, hold escalation until resolved."
      },
      {
        "effect": "Nausea",
        "severity": "Any",
        "action": "Reduce dose. Ensure injection is subcutaneous, not intramuscular."
      },
      {
        "effect": "Copper Toxicity Signs*",
        "severity": "Severe",
        "action": "Stop immediately. Seek medical attention."
      }
    ],
    "sideEffectWarning": "* Copper toxicity warning signs: nausea, vomiting, abdominal pain, jaundice, confusion, or dark urine. Rare at recommended doses.",
    "tips": [
      "Supplement with Zinc 20\u201330mg daily. GHK-Cu increases copper availability, and supplementing zinc helps maintain a healthy copper-to-zinc balance.",
      "Inject at the same time each day for consistency.",
      "Rotate injection sites every dose \u2014 abdomen, thigh, and deltoid are all suitable.",
      "Stay well hydrated \u2014 dehydration can amplify fatigue and headache side effects.",
      "GHK-Cu effects are gradual. Expect to see meaningful results at 6\u201312 weeks, not days.",
      "Avoid co-administration with heavy antioxidants (high-dose Vitamin C/E) immediately before or after injection, as these may interfere with copper bioavailability.",
      "Keep a brief log: note your dose, injection date, site, and any side effects to track your patterns.",
      "If you are progressing well at a lower dose, there is no need to escalate."
    ]
  },
  {
    "id": "nad",
    "name": "NAD+ Dosing Protocol",
    "subtitle": "Nicotinamide Adenine Dinucleotide \u2014 Cellular Energy & Longevity",
    "tagline": "Cellular Energy, DNA Repair & Longevity",
    "cycleInfo": "2\u20133x per week subcutaneous \u2014 morning dosing \u2014 3 months on / 1 month off",
    "whatIsIt": "NAD+ (Nicotinamide Adenine Dinucleotide) is a coenzyme found in every cell in the body. It is essential for energy production, DNA repair, sirtuin activation, and cellular stress response. NAD+ levels decline significantly with age \u2014 by the time most people reach their 50s, levels can be less than half of what they were in youth. Restoring NAD+ levels through injection bypasses the digestive conversion pathway entirely, delivering higher bioavailability than oral NMN or NR supplementation. The effects span metabolic efficiency, cognitive clarity, physical recovery, inflammation reduction, and healthy ageing.",
    "pdfUrl": "/protocols/NAD_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Add 3ml of bacteriostatic water (bac water) to the 500mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate. Allow to dissolve fully \u2014 NAD+ may take a moment to go into solution.",
      "table": [
        {
          "vial": "500mg",
          "water": "3ml (300 units)",
          "concentration": "1.667mg per unit",
          "reference": "25mg = 15u | 50mg = 30u | 75mg = 45u | 100mg = 60u"
        }
      ]
    },
    "corePrinciple": "NAD+ is dosed subcutaneously 2\u20133 times per week. Daily dosing is not necessary \u2014 NAD+ has a meaningful half-life in tissue and accumulates with consistent use. Spacing doses across the week (e.g. Monday / Wednesday / Friday) produces consistent elevation of NAD+ levels.",
    "injectionFrequency": "Inject in the morning. NAD+ has a notable energising effect \u2014 morning dosing allows this to work with your natural energy cycle. Avoid evening injections as they may interfere with sleep. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. Intramuscular injection is also acceptable. Rotate sites with each dose. Cycling: 3 months on / 1 month off \u2014 approximately 3 cycles per year.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "25mg (15 units)",
        "notes": "Weeks 1\u20132 \u2014 Tolerance building. Flushing, warmth, and tingling are common and expected \u2014 they are a normal vasodilation response and subside with consistent use. Inject 2\u20133x per week on non-consecutive days (e.g. Mon / Wed / Fri)."
      },
      {
        "step": 2,
        "dose": "50mg (30 units)",
        "notes": "Weeks 3\u20134 \u2014 Dose build. Advance when previous dose is comfortable with manageable flush. Flush intensity typically reduces significantly at this stage. Most users find 50mg a highly effective long-term dose."
      },
      {
        "step": 3,
        "dose": "100mg (60 units)",
        "notes": "Weeks 5\u20136 \u2014 Full maintenance dose. Introduce at 1\u20132x per week first, then increase to 2\u20133x per week. This is the performance and longevity maintenance range. Continue for the remainder of your 3-month cycle."
      }
    ],
    "doseEscalationNote": "NAD+ injections can cause a strong flushing sensation, nausea, or warmth at higher doses \u2014 particularly early on. This protocol uses a structured titration approach to build tolerance gradually. Do not skip ahead.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "When current dose is comfortable with manageable flush. Flushing alone is not a reason to hold \u2014 it is an expected vasodilation response that subsides after 1\u20132 weeks."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience persistent nausea, palpitations, cramping, or significant systemic discomfort beyond the flush. Wait until resolved before advancing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are significantly affecting daily life. Many users find 50mg 2\u20133x per week to be an excellent long-term maintenance dose without needing to reach 100mg."
      },
      {
        "label": "Space",
        "color": "text-primary",
        "description": "Do not inject on consecutive days. Space doses across the week (e.g. Mon / Wed / Fri) to allow NAD+ to accumulate and tissue to recover."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After approximately 3 months, take a 4-week break to preserve endogenous NAD+ synthesis pathways before beginning your next cycle."
      }
    ],
    "sideEffects": [
      {
        "effect": "Flushing / Skin Warmth / Tingling",
        "severity": "Mild \u2014 NORMAL",
        "action": "The most common NAD+ reaction. Caused by vasodilation. Typically peaks within 10\u201320 minutes and resolves within an hour. Subsides significantly after the first few doses. Injecting slowly and staying well hydrated reduces intensity."
      },
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal subcutaneous response. Rotate sites with every dose. Apply light pressure post-injection."
      },
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "Stay hydrated. Reduce dose if persistent. Usually resolves after the first 1\u20132 weeks."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Transient. Taking magnesium daily can help reduce occurrence."
      },
      {
        "effect": "Sleep Disruption / Vivid Dreams",
        "severity": "Mild",
        "action": "Switch to strict morning dosing if this occurs. Avoid injecting after midday. Usually resolves once timing is corrected."
      },
      {
        "effect": "Heart Palpitations",
        "severity": "Moderate",
        "action": "Reduce dose immediately and inject more slowly next time. If persistent, hold and consult a healthcare provider. Usually dose-dependent and resolves at lower doses."
      },
      {
        "effect": "Anxiety / Overstimulation",
        "severity": "Moderate",
        "action": "Consider adding TMG if not already supplementing, as methyl depletion can contribute to mood changes."
      },
      {
        "effect": "Severe Palpitations or Chest Pain",
        "severity": "Severe",
        "action": "Stop immediately. Seek medical attention."
      }
    ],
    "sideEffectWarning": "The flush is not dangerous, but it is uncomfortable enough to cause users to abandon the protocol if they escalate too fast. Start low and build tolerance gradually.",
    "tips": [
      "Always inject in the morning. NAD+ is energising \u2014 evening doses frequently cause sleep disruption and vivid dreams.",
      "Inject slowly. Rapid injection increases the intensity of the flush response. Take 30\u201360 seconds to deliver the full dose.",
      "Add TMG (500\u20131000mg daily) to your stack. This is the single most important supporting supplement. NAD+ supplementation consumes methyl groups \u2014 TMG replenishes them and prevents fatigue, mood changes, and long-term depletion.",
      "Stay well hydrated \u2014 before, during, and after injection. Dehydration amplifies flushing, nausea, and headache.",
      "Rotate injection sites every dose \u2014 abdomen, love handles, upper glute fat, back of arm fat, and intramuscular are all suitable.",
      "The flush gets better with time. Most users find it largely resolves within 1\u20132 weeks of consistent use. Do not abandon the protocol because of early flush reactions.",
      "Pair with oral NMN or NR (250\u2013500mg daily) on non-injection days to maintain elevated baseline NAD+ levels between doses.",
      "Consider adding Apigenin 50\u2013100mg daily to inhibit CD38 and preserve NAD+ levels \u2014 particularly beneficial for users over 40.",
      "Track energy, sleep quality, cognitive clarity, and recovery week over week \u2014 NAD+ effects are cumulative and most pronounced after 4\u20136 weeks of consistent use.",
      "Cycle off after approximately 3 months. Take a 4-week break to support endogenous NAD+ synthesis pathways before beginning the next cycle."
    ]
  },
  {
    "id": "cjc-ipamorelin",
    "name": "CJC-1295 + Ipamorelin Protocol",
    "subtitle": "CJC-1295 (No DAC) 5mg + Ipamorelin 5mg \u2014 Pre-Blended GH Secretagogue Stack",
    "tagline": "Synergistic GH Secretagogue Stack",
    "cycleInfo": "Once daily subcutaneous \u2014 evening / pre-sleep \u2014 12\u201316 weeks on / 2\u20134 weeks off",
    "whatIsIt": "CJC-1295 (No DAC / Mod GRF 1-29) is a GHRH analogue that stimulates the pituitary gland to produce and release GH in a pulsatile manner with a ~30-minute half-life, mimicking the body's natural GH rhythm. Ipamorelin is a selective ghrelin receptor agonist (GHRP) that triggers a clean, sharp GH pulse without significantly raising cortisol or prolactin. Stacked together, they work on two different receptors (GHRH and ghrelin) producing a synergistic pulsatile GH release larger than either peptide alone.",
    "pdfUrl": "/protocols/CJC1295_Ipamorelin_Dosing_Protocol.pdf",
    "components": [
      {
        "peptide": "CJC-1295 (No DAC)",
        "amount": "5mg",
        "role": "GHRH analogue \u2014 stimulates pituitary GH release in pulsatile manner, ~30 min half-life"
      },
      {
        "peptide": "Ipamorelin",
        "amount": "5mg",
        "role": "Selective ghrelin receptor agonist \u2014 clean GH pulse without raising cortisol or prolactin"
      }
    ],
    "reconstitution": {
      "instructions": "Add 3ml of bacteriostatic water (bac water) to the 10mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "10mg (5mg + 5mg)",
          "water": "3ml (300 units)",
          "concentration": "0.1667mg per unit per peptide",
          "reference": "12u = 200mcg each | 18u = 300mcg each"
        }
      ]
    },
    "corePrinciple": "Insulin and GH are antagonistic hormones. Injecting within 1\u20131.5 hours of eating raises insulin levels and significantly blunts the GH pulse. Always inject at least 1 hour before eating or 1.5 hours after your last meal. Pre-sleep dosing on an empty stomach is the gold standard.",
    "injectionFrequency": "Once daily subcutaneously, in the evening, approximately 1\u20131.5 hours after your last meal and 30\u201360 minutes before sleep. This timing aligns the exogenous GH pulse with the body's natural nocturnal GH release window. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "12 units (200mcg each)",
        "notes": "Starting dose. Inject once daily subcutaneously, evening / pre-sleep in a fasted state. Assess water retention, sleep quality, hunger response, and injection site reaction over 2 weeks."
      },
      {
        "step": 2,
        "dose": "18 units (300mcg each)",
        "notes": "Advance when Step 1 is comfortable. Standard full maintenance dose. Most users experience improved sleep quality, enhanced recovery, and progressive body composition changes within 4\u20138 weeks."
      }
    ],
    "doseEscalationNote": "Most users tolerate this stack very well from the start. Begin at the lower dose to assess your individual response \u2014 particularly any water retention or tingling \u2014 before advancing.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "After 2 weeks at Step 1 with good tolerability. Mild water retention and increased hunger are not reasons to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience significant oedema, persistent headaches, joint pain beyond mild discomfort, or notable fatigue. Wait until resolved."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are affecting daily life. 200mcg of each peptide is an effective long-term dose \u2014 you do not need to reach 300mcg to see strong results."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose if seeing good results. Consistency over 12\u201316 weeks matters more than maximising dose."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 12\u201316 weeks, a 2\u20134 week break is recommended to preserve long-term pituitary sensitivity."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Tingling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Common with Ipamorelin. Rotate sites daily. Apply light pressure post-injection. Resolves quickly."
      },
      {
        "effect": "Increased Hunger",
        "severity": "Mild \u2014 NORMAL",
        "action": "Expected ghrelin-pathway response from Ipamorelin. Inject pre-sleep to minimise eating in response. Common in first 2\u20134 weeks."
      },
      {
        "effect": "Mild Water Retention",
        "severity": "Mild",
        "action": "Usually resolves as the body adapts. Stay well hydrated. Reduce sodium intake if uncomfortable."
      },
      {
        "effect": "Vivid Dreams / Disrupted Sleep",
        "severity": "Mild",
        "action": "Usually transient, resolves within 1\u20132 weeks. Adjust injection timing slightly earlier if persistent."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Ensure adequate hydration. Usually dose-dependent and transient. Can occur in first 1\u20132 weeks."
      },
      {
        "effect": "Fatigue / Lethargy",
        "severity": "Mild",
        "action": "Ensure adequate sleep \u2014 this stack requires quality rest to work effectively."
      },
      {
        "effect": "Significant Joint Pain or Oedema",
        "severity": "Moderate",
        "action": "Reduce dose. Signs of excessive GH elevation. Drop to Step 1 and reassess. If persistent, discontinue and consult provider."
      },
      {
        "effect": "Numbness / Carpal Tunnel Symptoms",
        "severity": "Moderate",
        "action": "Reduce dose immediately. Known effect of excess GH. Usually resolves within days of dose reduction."
      }
    ],
    "tips": [
      "Always inject in a fasted state \u2014 at least 1 hour before eating or 1.5 hours after your last meal. Elevated insulin directly blunts GH release.",
      "Pre-sleep dosing is the gold standard. Aligning your injection with the natural nocturnal GH pulse produces the greatest total GH output. Aim for 30\u201360 minutes before sleep.",
      "Rotate injection sites every dose \u2014 abdomen, love handles, upper glute fat, and back of arm fat are all suitable.",
      "Prioritise sleep quality. CJC-1295 + Ipamorelin works by amplifying GH release during deep sleep. Poor sleep directly reduces the benefit. Aim for 7\u20139 hours.",
      "Track your results week by week. Body composition changes are gradual \u2014 take weekly measurements or photos.",
      "Manage carbohydrate intake in the evening. A low-carb evening meal 2+ hours before injection is ideal.",
      "Do not use this stack if you have a history of cancer or active malignancy. GH and IGF-1 elevation is contraindicated.",
      "This stack can be run indefinitely. A 2\u20134 week break every 12\u201316 weeks is recommended to preserve pituitary sensitivity.",
      "If you are progressing well at 200mcg (12 units), there is no need to advance to 300mcg. Consistent long-term use at a lower dose outperforms short-term high-dose use."
    ]
  },
  {
    "id": "wolverine-stack",
    "name": "Wolverine Stack Dosing Protocol",
    "subtitle": "BPC-157 10mg | TB-500 10mg \u2014 Tissue Repair & Systemic Recovery",
    "tagline": "The most effective peptide combination for injury recovery",
    "cycleInfo": "Once daily subcutaneous \u2014 12\u201316 weeks on / 4 weeks off",
    "whatIsIt": "The Wolverine Stack combines BPC-157 (Body Protection Compound) and TB-500 (Thymosin Beta-4 Fragment) \u2014 two peptides that work through complementary repair pathways. BPC-157 drives repair via angiogenesis, collagen synthesis, and nitric oxide / growth hormone receptor signalling, with an enhanced local effect when injected near the injury site. TB-500 drives repair via cell migration, actin regulation, and broad anti-inflammatory signalling throughout the body. Stacking them activates two complementary repair cascades simultaneously, producing significantly greater recovery than either peptide achieves alone.",
    "pdfUrl": "/protocols/Wolverine_Stack_Dosing_Protocol.pdf",
    "components": [
      {
        "peptide": "BPC-157",
        "amount": "10mg per vial",
        "role": "A 15 amino acid peptide derived from a protective gastric protein. Promotes tissue repair through angiogenesis, collagen synthesis, and growth factor upregulation. Highly effective for tendons, ligaments, muscle, gut lining, joint tissue, and neurological recovery."
      },
      {
        "peptide": "TB-500",
        "amount": "10mg per vial",
        "role": "A synthetic fragment of Thymosin Beta-4. Promotes systemic healing by driving cell migration, actin regulation, and anti-inflammatory signalling throughout the body. Ideal for widespread or hard-to-reach injuries and full-body recovery."
      }
    ],
    "reconstitution": {
      "instructions": "Add 2ml of bacteriostatic water (bac water) to the 20mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "20mg (10mg + 10mg)",
          "water": "2ml (200 units)",
          "concentration": "0.05mg (50mcg) per unit per peptide",
          "reference": "6 units = 300mcg each | 10 units = 500mcg each"
        }
      ],
      "note": "Targeted vs. General Injection: Both BPC-157 and TB-500 work systemically from any injection site. However, for localised injuries (tendons, ligaments, joints), injecting subcutaneously near the affected area enhances BPC-157's local repair effect. For general recovery, gut health, and wellness use, standard rotation sites (abdomen, love handles, etc.) work equally well."
    },
    "corePrinciple": "Both peptides work systemically, but through different pathways. Stacking them activates two complementary repair cascades simultaneously. Daily dosing is recommended during active injury recovery to maintain consistent peptide levels and sustain the repair cascade.",
    "injectionFrequency": "Once daily subcutaneous. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. For localised injuries, subcutaneous injection near the site of damage is preferred. Rotate sites daily. Injection timing is flexible \u2014 morning or evening are both acceptable.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "6 units (300mcg BPC-157 + 300mcg TB-500)",
        "notes": "Starting dose. Inject once daily subcutaneously. Assess tolerability, injection site response, and early recovery signals over 1\u20132 weeks. Mild redness and warmth at injection site is normal."
      },
      {
        "step": 2,
        "dose": "10 units (500mcg BPC-157 + 500mcg TB-500)",
        "notes": "Advance when Step 1 is comfortable. Standard full maintenance and injury recovery dose. Most commonly cited therapeutic range. Users with acute injuries may start here directly if experienced."
      }
    ],
    "doseEscalationNote": "The Wolverine Stack is well tolerated by most users. Begin at Step 1 for 1\u20132 weeks to confirm tolerability, then advance to the standard maintenance dose.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "After 1\u20132 weeks at Step 1 with good tolerability. Mild injection site reactions are not a reason to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience notable fatigue, nausea, or systemic discomfort beyond mild injection site reactions. Wait until resolved before advancing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are affecting daily life. 300mcg of each peptide daily is a highly effective dose \u2014 you do not need to reach 500mcg to see strong results."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose if you are seeing good recovery results. Consistency over the full cycle matters more than maximising dose."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 12\u201316 weeks, take a 4-week break before resuming. Most acute injuries will have substantially healed within this window."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal subcutaneous response. Rotate sites daily. Apply light pressure post-injection. More common when injecting near injury sites."
      },
      {
        "effect": "Temporary Increase in Injury Discomfort",
        "severity": "Mild \u2014 NORMAL",
        "action": "A transient increase in inflammation or sensitivity at the injury site in the first few days is a sign the repair cascade has been activated. Typically resolves within 3\u20135 days. Do not stop the protocol."
      },
      {
        "effect": "Fatigue / Lethargy",
        "severity": "Mild",
        "action": "Can occur in the early weeks as systemic healing processes ramp up. Ensure adequate sleep and nutrition. If persistent, hold escalation until resolved."
      },
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "Reduce dose. Ensure injection is subcutaneous, not intramuscular. Staying well hydrated helps."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Dizziness / Lightheadedness",
        "severity": "Mild",
        "action": "Sit or lie down after injection until it resolves. Ensure you are well hydrated. Usually transient."
      },
      {
        "effect": "Rapid Heart Rate",
        "severity": "Moderate",
        "action": "Reduce dose. Usually transient and dose-dependent. If persistent or severe, discontinue and consult a healthcare provider."
      }
    ],
    "tips": [
      "For targeted injuries, inject near the site. BPC-157 and TB-500 both circulate systemically from any injection site, but injecting subcutaneously close to an affected tendon, ligament, or joint increases regional BPC-157 concentration and enhances its local repair effect.",
      "A temporary flare at the injury site is a good sign. Mild increased discomfort in the first 3\u20135 days indicates the repair cascade is active. Do not stop the protocol \u2014 this resolves quickly.",
      "Rotate injection sites every dose \u2014 abdomen, love handles, upper glute fat, back of arm fat, and near-injury subcutaneous sites are all suitable.",
      "Pair with physiotherapy and structured rest. Peptides accelerate the biological repair process, but they do not replace mechanical rehabilitation.",
      "Stay well hydrated \u2014 adequate hydration supports the angiogenesis and cell migration processes driven by both peptides.",
      "Optimise protein intake. BPC-157 and TB-500 drive collagen synthesis and tissue regeneration \u2014 aim for at least 1.6\u20132g of protein per kg of bodyweight daily during your cycle.",
      "For gut health use, maintain consistency and pair with a low-inflammatory diet during the cycle for best results.",
      "Cycle off after 12\u201316 weeks. A 4-week break allows receptor sensitivity to reset.",
      "If you are seeing strong recovery at 300mcg (6 units), there is no need to advance to 500mcg."
    ]
  },
  {
    "id": "tesamorelin",
    "name": "Tesamorelin Dosing Protocol",
    "subtitle": "GHRH Analogue \u2014 Visceral Fat Reduction & GH Optimisation",
    "tagline": "FDA-approved GHRH analogue for targeted visceral fat reduction",
    "cycleInfo": "Once daily subcutaneous \u2014 evening / pre-sleep dosing \u2014 12\u201316 weeks on / 4 weeks off",
    "whatIsIt": "Tesamorelin is a stabilised synthetic analogue of Growth Hormone Releasing Hormone (GHRH) \u2014 the body's own signal that tells the pituitary gland to produce and release growth hormone. Unlike direct GH injections, tesamorelin works physiologically by triggering the pituitary's own pulsatile GH secretion, resulting in a more natural hormonal rhythm with a lower risk of supraphysiological GH spikes. Tesamorelin is the only FDA-approved peptide for visceral fat reduction (approved under the brand name Egrifta), with robust clinical trial evidence supporting its use. Its primary documented effect is selective reduction of visceral adipose tissue (VAT) \u2014 the metabolically active fat stored deep in the abdomen around organs \u2014 alongside improvements in IGF-1 levels, body composition, cognitive function, and lipid profiles.",
    "pdfUrl": "/protocols/Tesamorelin_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Use 1ml of bacteriostatic water (bac water) per 5mg of peptide. Both vial sizes reconstitute to the same concentration \u2014 0.05mg per unit \u2014 making dose measurement identical regardless of which vial you use. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "5mg",
          "water": "1ml (100 units)",
          "concentration": "0.05mg per unit",
          "reference": "20 units = 1mg / 40 units = 2mg"
        },
        {
          "vial": "10mg",
          "water": "2ml (200 units)",
          "concentration": "0.05mg per unit",
          "reference": "20 units = 1mg / 40 units = 2mg"
        }
      ],
      "doseBreakdown": "Both vial sizes are interchangeable. The 5mg vial contains 2.5 full 2mg doses. The 10mg vial contains 5 full 2mg doses. Always draw to 40 units for the 2mg maintenance dose.",
      "note": "Critical Timing Rule: Tesamorelin stimulates pituitary GH secretion. Elevated insulin \u2014 caused by eating \u2014 directly antagonises this process. Always inject at least 1 hour before eating or 1.5\u20132 hours after your last meal. Pre-sleep injection on an empty stomach is optimal."
    },
    "corePrinciple": "Tesamorelin produces a pulsatile, physiological GH release rather than a sustained supraphysiological spike. This means the GH response mirrors what your own body would produce if functioning optimally \u2014 a significantly safer and more natural hormonal profile.",
    "injectionFrequency": "Once daily subcutaneously, in the evening, 30\u201360 minutes before sleep in a fasted state. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "1mg (20 units / 0.2ml)",
        "notes": "Starting dose. Inject once daily subcutaneously, pre-sleep in a fasted state. Assess tolerability, sleep quality, and any side effects over 2 weeks."
      },
      {
        "step": 2,
        "dose": "2mg (40 units / 0.4ml)",
        "notes": "Full therapeutic dose. Clinical standard based on FDA-approved trials. Maintain for the remainder of the 12\u201316 week cycle."
      }
    ],
    "doseEscalationNote": "The clinically established dose for tesamorelin is 2mg daily. A conservative two-step approach is recommended to assess tolerability before advancing to the full therapeutic dose \u2014 particularly for users new to GH secretagogues.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "After 2 weeks at 1mg with good tolerability. Mild water retention and increased hunger are expected and not a reason to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience significant oedema, persistent joint pain, carpal tunnel symptoms, or notable fatigue. Wait until resolved before advancing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are affecting daily life. Some users achieve meaningful results at 1mg daily, particularly for cognitive and sleep benefits."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At 2mg once reached. No clinical evidence supports doses above 2mg daily \u2014 higher doses increase side effect risk without additional benefit."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal subcutaneous response. Rotate sites daily. Apply light pressure post-injection."
      },
      {
        "effect": "Mild Water Retention",
        "severity": "Mild \u2014 NORMAL",
        "action": "Common in first 2\u20134 weeks as GH and IGF-1 levels rise. Usually resolves. Stay hydrated, reduce sodium if uncomfortable."
      },
      {
        "effect": "Increased Hunger",
        "severity": "Mild",
        "action": "GH-related appetite increase. Inject pre-sleep to minimise impact. Does not require dose adjustment."
      },
      {
        "effect": "Joint Aches / Stiffness",
        "severity": "Mild",
        "action": "Common GH-related side effect, usually transient. Ensure adequate hydration. Reduce dose if persistent."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Vivid Dreams / Sleep Changes",
        "severity": "Mild",
        "action": "Usually transient as body adjusts to enhanced nocturnal GH secretion. Resolves within 1\u20132 weeks."
      },
      {
        "effect": "Carpal Tunnel Symptoms",
        "severity": "Moderate",
        "action": "Reduce dose immediately. A known GH excess effect. Usually resolves within days of dose reduction."
      },
      {
        "effect": "Significant Oedema or Joint Pain",
        "severity": "Moderate",
        "action": "Reduce or hold dose. Signs of excessive GH elevation. Drop to 1mg and reassess."
      },
      {
        "effect": "Blood Glucose Elevation",
        "severity": "Severe",
        "action": "Discontinue and consult a healthcare provider immediately. GH can reduce insulin sensitivity. Monitor blood glucose closely."
      }
    ],
    "sideEffectWarning": "Contraindications: Active malignancy, pituitary disorders, pregnancy/breastfeeding, uncontrolled diabetes, or hypersensitivity to GHRH. Signs of elevated blood glucose: increased thirst, frequent urination, fatigue, blurred vision.",
    "tips": [
      "Always inject pre-sleep in a fasted state. Insulin suppresses GH release. Evening injection 30\u201360 minutes before sleep on an empty stomach is the gold standard.",
      "Be patient \u2014 visceral fat reduction is gradual. Clinical trials show the most significant changes between weeks 8 and 16. Do not evaluate results early.",
      "Pair with a reduced-calorie, lower-carbohydrate evening meal. Keeping insulin low before injection enhances GH output. Avoid high-carb meals within 2 hours of dosing.",
      "Rotate injection sites every dose \u2014 abdomen, love handles, upper glute fat, and back of arm fat are all suitable.",
      "Prioritise sleep quality. Tesamorelin amplifies nocturnal GH secretion \u2014 poor sleep directly reduces the benefit. Aim for 7\u20139 hours per night.",
      "Monitor blood glucose if you have any history of insulin resistance, pre-diabetes, or metabolic syndrome.",
      "Mild water retention and joint stiffness in the first 2\u20134 weeks are normal adaptation responses that typically resolve.",
      "Visceral fat can return after discontinuation if lifestyle habits are not maintained. Use the cycle to establish sustainable habits.",
      "Do not exceed 2mg daily. No clinical evidence supports higher doses, and side effect risk increases significantly.",
      "If seeing good results at 1mg, there is no need to advance to 2mg. Some users find 1mg an effective long-term maintenance dose."
    ]
  },
  {
    "id": "semax",
    "name": "Semax Dosing Protocol",
    "subtitle": "Nootropic Peptide \u2014 Cognitive Enhancement, Neuroprotection & BDNF Upregulation",
    "tagline": "Cognitive enhancement, neuroprotection & BDNF upregulation",
    "cycleInfo": "Short cycle: 10\u201314 days on / 10\u201314 days off | Extended cycle: 4\u20138 weeks on / 2\u20134 weeks off",
    "whatIsIt": "Semax is a synthetic heptapeptide analogue of ACTH developed in Russia, where it is a registered pharmaceutical approved for stroke recovery, cognitive impairment, optic nerve disease, and ADHD-related conditions. It works primarily by upregulating Brain-Derived Neurotrophic Factor (BDNF) and other neurotrophins, which drive neuroplasticity, neuronal survival, and synapse formation. It also modulates the dopamine and serotonin systems, contributing to its pronounced effects on focus, memory, stress resilience, and mood. Unlike most peptides, Semax is effective at very low doses and its cognitive effects are often felt within a single administration.",
    "pdfUrl": "/protocols/Semax_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Add 1ml of bacteriostatic water (bac water) to the 10mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate the solution.",
      "table": [
        {
          "vial": "10mg",
          "water": "1ml (100 units)",
          "concentration": "0.1mg per unit",
          "reference": "0.5mg = 5 units | 1mg = 10 units"
        }
      ],
      "note": "Also available as a ready-to-use nasal spray (100mcg per actuation). 0.5mg = 5 sprays, 1mg = 10 sprays. No reconstitution required for intranasal."
    },
    "corePrinciple": "Semax is effective at low doses \u2014 many users find 0.5mg daily to be their optimal dose. Do not escalate unnecessarily. The goal is the lowest effective dose that produces the desired cognitive effect. Morning or early afternoon dosing only \u2014 evening dosing may disrupt sleep.",
    "injectionFrequency": "Once daily in the morning or early afternoon \u2014 subcutaneously or intranasally. Peak cognitive effects 1\u20132 hours after administration, lasting 4\u20136 hours. Rotate subcutaneous sites daily. For intranasal, alternate nostrils.",
    "doseEscalationNote": "Semax is one of the most dose-sensitive peptides. Many users find 0.5mg to be their optimal dose. Effects should be noticeable within 1\u20133 days.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "0.5mg (5 units SubQ / 5 sprays intranasal)",
        "notes": "Starting dose for all users. Assess cognitive response, mood, energy, and sleep quality over 3\u20135 days. Many users remain at this dose for the entire cycle."
      },
      {
        "step": 2,
        "dose": "1mg (10 units SubQ / 10 sprays intranasal)",
        "notes": "Advance only if Step 1 produces minimal effect. Upper range for most users. Higher doses do not reliably produce greater benefit and increase risk of anxiety, overstimulation, and sleep disruption."
      }
    ],
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Only if 0.5mg produces no noticeable effect after 3\u20135 days."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience anxiety, overstimulation, racing thoughts, or sleep disruption."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are present at 1mg. Return to 0.5mg. If they persist, discontinue and reassess after a rest period."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "If seeing clear cognitive benefit at 0.5mg. No benefit to escalating if results are already good."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "Short cycle: 10\u201314 days off after each run. Extended cycle: 2\u20134 weeks off after 4\u20138 weeks on. Do not run continuously."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness (SubQ)",
        "severity": "Mild \u2014 NORMAL",
        "action": "Rotate sites daily. Apply light pressure post-injection."
      },
      {
        "effect": "Nasal Irritation / Drip (Intranasal)",
        "severity": "Mild \u2014 NORMAL",
        "action": "Tilt head slightly forward. Sniff gently. Rinse with saline spray if persistent. Common in first few doses."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Usually resolves within first week. Reduce dose if persistent."
      },
      {
        "effect": "Fatigue / Crash (afternoon)",
        "severity": "Mild",
        "action": "Stay hydrated and maintain consistent sleep. Usually adapts within 1\u20132 weeks. Reduce dose to 0.5mg."
      },
      {
        "effect": "Anxiety / Overstimulation",
        "severity": "Moderate",
        "action": "Reduce dose. Avoid stacking with other stimulants. If persistent at 0.5mg, discontinue and take a rest period."
      },
      {
        "effect": "Sleep Disruption / Insomnia",
        "severity": "Moderate",
        "action": "Avoid evening dosing. Shift dose earlier in the day. Reduce dose if disruption continues."
      }
    ],
    "sideEffectWarning": "Do not combine with MAO Inhibitors (MAOIs) \u2014 risk of serotonin syndrome. Use caution with stimulant medications (may increase anxiety and overstimulation). Consult a healthcare provider before combining with SSRIs/SNRIs.",
    "tips": [
      "Avoid evening dosing \u2014 Semax increases cognitive arousal and can disrupt sleep quality or cause insomnia. Morning or early afternoon is recommended.",
      "Start at 0.5mg and assess before escalating. Many users find this is their optimal dose.",
      "First-time users: start with a short cycle (10\u201314 days) to assess individual response before committing to a longer run.",
      "Do not combine with MAOIs \u2014 this is a hard contraindication due to risk of serotonin syndrome.",
      "If combining with stimulant medications, reduce Semax to 0.5mg and monitor for overstimulation.",
      "Intranasal offers rapid onset (15\u201330 min); subcutaneous offers more consistent absorption and longer duration. Both are effective.",
      "Stay well hydrated \u2014 cognitive peptides increase neuronal activity and metabolic demand.",
      "Keep a brief log of cognitive response, mood, sleep quality, and dose to identify your optimal protocol.",
      "Take the rest period seriously \u2014 BDNF and receptor sensitivity attenuate with continuous use."
    ]
  },
  {
    "id": "selank",
    "name": "Selank Dosing Protocol",
    "subtitle": "Subcutaneous or intranasal \u2014 once daily or split dosing \u2014 12 weeks on / 4 weeks off",
    "tagline": "Anxiolytic nootropic peptide for calm clarity and stress resilience",
    "cycleInfo": "12 weeks on / 4 weeks off (short cycles: 14 days on / 7\u201314 days off also valid)",
    "pdfUrl": "/protocols/Selank_Dosing_Protocol.pdf",
    "whatIsIt": "Selank is a synthetic heptapeptide analogue of Tuftsin, developed in Russia alongside Semax. It is a registered pharmaceutical in Russia for anxiety disorders, asthenic conditions, and cognitive dysfunction. Selank works primarily through GABA-A receptor modulation and enkephalin stabilisation, producing a calming anxiolytic effect without sedation, amnesia, or dependence risk. It also upregulates BDNF and serotonin expression. The defining character of Selank is calm, clear focus \u2014 it reduces anxious thoughts and stress reactivity while leaving cognitive function intact. It is the anxiolytic counterpart to Semax's stimulating profile.",
    "reconstitution": {
      "instructions": "Add 1ml of bacteriostatic water to the 10mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate. For intranasal use, Selank is available as a ready-to-use nasal spray (no reconstitution required). Each nasal actuation delivers 100mcg.",
      "table": [
        {
          "vial": "10mg",
          "water": "1ml (100 units)",
          "concentration": "0.1mg per unit",
          "reference": "250mcg = 2.5 units / 500mcg = 5 units"
        }
      ],
      "note": "Intranasal: 100mcg per actuation. Daily dose 250\u2013500mcg split across 2\u20133 sessions (3\u20135 sprays per session, 1\u20132 per nostril)."
    },
    "corePrinciple": "Selank is effective at low doses. Start at 250mcg and assess your response before advancing. Many users find 250mcg to be their optimal dose \u2014 do not escalate unnecessarily. Unlike benzodiazepines, Selank does not produce physical dependence or withdrawal.",
    "injectionFrequency": "Once daily subcutaneously, or 2\u20133 times daily intranasally. Common SubQ sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites daily. Timing is flexible \u2014 morning through early evening. Selank is calming rather than stimulating, so it does not carry sleep-disruption risk.",
    "doseEscalationNote": "Start at 250mcg. Advance only if minimal response after 3\u20135 days. Many users remain at 250mcg throughout their cycle.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "250mcg",
        "notes": "Starting dose. SubQ: 2.5 units once daily. Intranasal: 2\u20133 sprays per session. Assess anxiolytic response, mood, and cognitive clarity over 3\u20135 days."
      },
      {
        "step": 2,
        "dose": "500mcg",
        "notes": "Advance if 250mcg produces minimal effect after 3\u20135 days. Standard full therapeutic dose. SubQ: 5 units. Intranasal: 4\u20135 sprays per session."
      }
    ],
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Only if 250mcg produces no noticeable anxiolytic or mood effect after 3\u20135 days."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If excessive sedation, low motivation, or emotional blunting \u2014 signs dose may be too high."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects at 500mcg. Return to 250mcg. Effective at lower doses for many users."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "If experiencing clear anxiety relief and mood benefit. Do not escalate if results are already good."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 12 weeks, take 4-week break. As-needed use for acute stress is also valid without a full cycle."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness (SubQ)",
        "severity": "Mild \u2014 NORMAL",
        "action": "Rotate sites daily. Apply light pressure post-injection."
      },
      {
        "effect": "Nasal Irritation (Intranasal)",
        "severity": "Mild \u2014 NORMAL",
        "action": "Tilt head slightly forward. Sniff gently. Usually transient."
      },
      {
        "effect": "Mild Sedation / Drowsiness",
        "severity": "Mild",
        "action": "More common at higher doses. Reduce to 250mcg. Adjust timing."
      },
      {
        "effect": "Low Motivation / Emotional Blunting",
        "severity": "Mild",
        "action": "Reduce dose or take a short break. If stacking with Semax, rarely an issue."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "Uncommon. Reduce dose. Check SubQ technique. Usually resolves within days."
      }
    ],
    "tips": [
      "Start at 250mcg and hold there unless clearly insufficient \u2014 Selank's effects are subtle but real. Give 3\u20135 days to assess before escalating.",
      "Timing is flexible. Unlike Semax, Selank is calming and unlikely to disrupt sleep. Morning through early evening dosing is appropriate.",
      "Consider stacking with Semax \u2014 Semax for cognitive output, Selank for stress and anxiety management. Many find the combination superior to either alone.",
      "For intranasal use, split daily dose across 2\u20133 sessions for more consistent anxiolytic coverage due to rapid nasal clearance.",
      "Rotate subcutaneous injection sites every dose \u2014 abdomen, love handles, upper glute fat, back of arm fat.",
      "Selank is suitable for as-needed use \u2014 a single dose or a few days during acute stress is valid without a full cycle.",
      "No dependence or withdrawal risk. Discontinuing at any point is safe and does not require tapering.",
      "Keep a brief log of anxiety levels, mood, and sleep quality. Effects are often gradual and cumulative."
    ]
  },
  {
    "id": "kpv",
    "name": "KPV Dosing Protocol",
    "subtitle": "Tripeptide Anti-Inflammatory \u2014 Gut Health, Immune Modulation & Systemic Inflammation",
    "tagline": "Anti-Inflammatory & Gut Health Tripeptide",
    "cycleInfo": "Once or twice daily subcutaneous \u2014 flexible cycle duration \u2014 goal-directed use",
    "whatIsIt": "KPV (Lysine-Proline-Valine) is a tripeptide fragment derived from the C-terminus of Alpha-MSH (Alpha-Melanocyte-Stimulating Hormone) \u2014 the body's own potent anti-inflammatory signalling molecule. KPV retains Alpha-MSH's anti-inflammatory activity in a smaller, more targeted form. KPV works primarily by directly inhibiting NF-\u03baB \u2014 the master regulator of inflammatory gene expression. By suppressing NF-\u03baB, KPV prevents the production of pro-inflammatory cytokines including TNF-\u03b1, IL-1\u03b2, and IL-6, while preserving beneficial immune responses. This targeted mechanism makes it significantly more selective than broad-spectrum anti-inflammatories. KPV's effects are systemic \u2014 it reduces inflammation throughout the body \u2014 but it has particularly well-documented efficacy in the gastrointestinal tract, where it has been studied for inflammatory bowel disease (IBD), Crohn's disease, and ulcerative colitis. It also demonstrates meaningful effects on skin inflammatory conditions and systemic immune dysregulation.",
    "pdfUrl": "/protocols/KPV_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Use 1ml of bacteriostatic water (bac water) per 10mg of peptide. Both vial sizes reconstitute to the same concentration \u2014 0.1mg per unit \u2014 making dose measurement identical regardless of which vial you use. Draw up slowly along the vial wall \u2014 do not shake or agitate.",
      "table": [
        {
          "vial": "5mg",
          "water": "0.5ml (50 units)",
          "concentration": "0.1mg per unit",
          "reference": "200\u2013300mcg = 2\u20133 units | 500mcg = 5 units"
        },
        {
          "vial": "10mg",
          "water": "1ml (100 units)",
          "concentration": "0.1mg per unit",
          "reference": "200\u2013300mcg = 2\u20133 units | 500mcg = 5 units"
        }
      ],
      "note": "Both vial sizes are interchangeable. The 5mg vial contains 10 full 500mcg doses. The 10mg vial contains 20 full 500mcg doses."
    },
    "corePrinciple": "KPV is dosed subcutaneously once or twice daily. For general anti-inflammatory and immune support, once daily is standard. For acute inflammatory conditions, gut flares, or higher target doses, twice daily dosing (morning and evening) is appropriate. Timing is flexible \u2014 KPV's anti-inflammatory mechanism is not dependent on hormonal cycles or circadian rhythm. For twice daily dosing, space injections approximately 8\u201312 hours apart.",
    "injectionFrequency": "Once or twice daily subcutaneously. Common injection sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites daily. Mild redness or warmth at the injection site is a normal and expected reaction.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "200\u2013300mcg (2\u20133 units) once daily",
        "notes": "Starting dose. Inject once daily subcutaneously. Assess tolerability and early anti-inflammatory response over 5\u20137 days. Users with mild or preventive goals may remain at this dose throughout their cycle."
      },
      {
        "step": 2,
        "dose": "500mcg (5 units) once or twice daily",
        "notes": "Standard maintenance dose for most users. Advance after 5\u20137 days at Step 1. For acute inflammatory conditions or active gut disease, twice daily dosing at 500mcg (total 1000mcg/day) is appropriate. Most users achieve meaningful results at this level."
      }
    ],
    "doseEscalationNote": "KPV is well tolerated by most users. Begin at Step 1 for the first week to confirm tolerability before advancing to the standard maintenance dose.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "After 5\u20137 days at Step 1 with good tolerability. Mild injection site reactions are not a reason to hold."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If you experience notable fatigue, nausea, or systemic discomfort beyond mild injection site reactions. Wait until resolved before advancing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are affecting daily life. 200\u2013300mcg daily is an effective long-term dose for many users \u2014 you do not need to reach 500mcg to see meaningful anti-inflammatory benefit."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At your current dose if you are seeing meaningful results. Consistent use at a moderate dose outperforms intermittent use at higher doses."
      },
      {
        "label": "Discontinue",
        "color": "text-red-400",
        "description": "When your therapeutic goal is achieved. KPV does not need to be continued indefinitely unless managing a chronic condition under healthcare supervision. A 2\u20134 week break after 8\u201312 weeks of use is a sensible precaution for long-term users."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Swelling",
        "severity": "Mild \u2014 NORMAL",
        "action": "Normal subcutaneous response. Rotate sites daily. Apply light pressure post-injection. No action needed unless severe."
      },
      {
        "effect": "Fatigue / Lethargy",
        "severity": "Mild",
        "action": "May occur as immune activity modulates in the early days. Ensure adequate sleep and hydration. If persistent, hold escalation until resolved."
      },
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "Reduce dose. Ensure injection is subcutaneous. Usually resolves within a few days. Stay well hydrated."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Transient Gut Discomfort",
        "severity": "Mild",
        "action": "May occur in users with active gut inflammation as KPV begins modulating the inflammatory response. Usually resolves within 3\u20135 days. Reduce dose if uncomfortable."
      },
      {
        "effect": "Allergic Reaction Signs*",
        "severity": "Severe",
        "action": "Stop immediately and seek medical attention. Signs: hives, swelling, difficulty breathing, or anaphylaxis. Rare at standard doses."
      }
    ],
    "sideEffectWarning": "* Allergic reactions are rare. KPV is a naturally occurring tripeptide fragment with a strong safety profile in the literature.",
    "tips": [
      "Timing is flexible \u2014 choose what is most consistent for you. KPV's anti-inflammatory mechanism is not circadian-dependent.",
      "For twice daily dosing, space injections 8\u201312 hours apart \u2014 morning and evening work well for most users.",
      "For gut conditions, pair KPV with a low-inflammatory diet during your cycle. Removing processed foods, refined sugars, and common irritants amplifies KPV's gut barrier repair effects.",
      "KPV pairs exceptionally well with BPC-157 for gut and tissue repair \u2014 BPC-157 drives the healing cascade while KPV reduces the inflammatory environment that slows recovery.",
      "For skin conditions, consider stacking with GHK-Cu (or using the KLOW Blend). The anti-inflammatory and collagen-stimulating effects are highly complementary.",
      "Rotate injection sites every dose \u2014 abdomen, love handles, upper glute fat, and back of arm fat are all suitable.",
      "Continue until your goal is achieved \u2014 KPV does not require strict cycling. For chronic conditions, ongoing low-dose use under healthcare guidance is a valid approach.",
      "Users with autoimmune conditions or those on immunosuppressant medications should consult a healthcare provider before use.",
      "Stay well hydrated throughout your cycle."
    ]
  },
  {
    "id": "l-glutathione",
    "name": "L-Glutathione Dosing Protocol",
    "subtitle": "Master Antioxidant \u2014 Skin Brightening, Detoxification & Cellular Health",
    "tagline": "IM or SubQ (IM preferred) \u2014 1500mg vial \u2014 gradual titration",
    "cycleInfo": "3x/week IM or SubQ \u2014 4\u20136 weeks on / 4 weeks off",
    "whatIsIt": "L-Glutathione (GSH) is the body's most abundant endogenous antioxidant \u2014 a tripeptide of cysteine, glycine, and glutamic acid produced in virtually every cell. Often called the 'master antioxidant,' it neutralises free radicals directly and regenerates other antioxidants including Vitamins C and E. Glutathione levels decline with age, chronic illness, oxidative stress, and poor lifestyle. Injectable glutathione bypasses the digestive system, delivering dramatically higher bioavailability than oral forms. IM offers sustained tissue-level delivery; SubQ is a convenient home-use alternative at lower doses. Beyond skin brightening and tone evening (via tyrosinase inhibition), glutathione supports liver detoxification, immune function, mitochondrial health, inflammation reduction, and cellular repair.",
    "reconstitution": {
      "instructions": "Add 7.5ml of bacteriostatic water (bac water) to the 1500mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate. This single reconstitution covers all phases of the titration protocol.",
      "table": [
        {
          "vial": "1500mg",
          "water": "7.5ml (750 units)",
          "concentration": "200mg/ml (2mg per unit)",
          "reference": "50mg = 25u | 100mg = 50u | 150mg = 75u | 200mg = 100u"
        }
      ],
      "note": "At the maintenance dose of 200mg 3x/week (600mg/week), one 1500mg vial lasts ~2.5 weeks. Plan accordingly for continuous cycling."
    },
    "corePrinciple": "You must titrate slowly. Glutathione injections can cause significant nausea, flushing, dizziness, and malaise when started at too high a dose \u2014 due to rapid mobilisation of stored toxins and heavy metals during detoxification. Starting low is not optional; it is the difference between a smooth, effective cycle and abandoning the protocol in week one.",
    "injectionFrequency": "3 injections per week (Monday / Wednesday / Friday) via IM or SubQ \u2014 IM preferred. IM sites: deltoid, vastus lateralis (outer thigh), or ventrogluteal. SubQ sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate sites each dose.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "50mg (25 units / 0.25ml)",
        "notes": "Phase 1 \u2014 Tolerance Building. 3x/week (Mon/Wed/Fri). Weekly total 150mg. Duration: 2 weeks. Allows your body to adapt to detoxification activity."
      },
      {
        "step": 2,
        "dose": "100mg (50 units / 0.5ml)",
        "notes": "Phase 2 \u2014 Dose Build. 3x/week. Weekly total 300mg. Duration: 2 weeks. Advance only if Phase 1 was well tolerated."
      },
      {
        "step": 3,
        "dose": "200mg (100 units / 1ml)",
        "notes": "Phase 3 \u2014 Maintenance. 3x/week. Weekly total 600mg. Ongoing for remainder of the 4\u20136 week cycle. IM preferred at this dose for maximum systemic effect."
      }
    ],
    "doseEscalationNote": "Move to the next phase only when the current dose is well tolerated. If detox symptoms appear, hold the current dose for an additional week before advancing.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "When the current phase is comfortable with mild or no detox symptoms for the full 2-week window."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If experiencing notable nausea, flushing, headache, or fatigue. Stay at the current dose until symptoms resolve."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects are significantly affecting daily life. Step down to the previous phase and re-attempt advancement later."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At maintenance (200mg 3x/week) for the remainder of the 4\u20136 week cycle if results and tolerability are good."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 4\u20136 weeks on, take a strict 4-week break. Continuous use reduces efficacy and may affect endogenous GSH synthesis and thyroid function."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Flushing / Warmth",
        "severity": "Mild \u2014 NORMAL",
        "action": "Common with IM. Inject slowly. Resolves within 30\u201360 minutes."
      },
      {
        "effect": "Nausea",
        "severity": "Mild",
        "action": "More common at higher doses early in the cycle. Stay well hydrated. Inject slowly. Reduce dose if persistent. Usually resolves within 1\u20132 weeks."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Dizziness / Malaise",
        "severity": "Mild",
        "action": "Sign of rapid detox mobilisation. Reduce dose by one phase. Add Vitamin C and NAC support."
      },
      {
        "effect": "Uneven Skin Lightening",
        "severity": "Moderate",
        "action": "Reduce dose or frequency. Can occur with overly aggressive dosing or inconsistent application. Apply sunscreen daily \u2014 UV exposure significantly worsens uneven pigmentation."
      },
      {
        "effect": "Thyroid Function Changes*",
        "severity": "Moderate",
        "action": "Cycle off strictly. Continuous use without breaks may affect thyroid function. Users with thyroid disorders should consult a provider before use."
      },
      {
        "effect": "Allergic Reaction",
        "severity": "Severe",
        "action": "Stop immediately. Seek medical attention. Rare."
      }
    ],
    "sideEffectWarning": "* Users with liver conditions, kidney disease, or thyroid disorders should consult a healthcare provider before use. Cycle off strictly \u2014 4 weeks off after every 4\u20136 week cycle.",
    "tips": [
      "Pair with Vitamin C 500\u20131000mg daily \u2014 regenerates oxidised glutathione back to its active reduced form. The single most important supporting supplement.",
      "Add NAC (N-Acetyl Cysteine) 600\u2013900mg daily during the cycle and off-period to support endogenous glutathione synthesis between injection days.",
      "Alpha Lipoic Acid (ALA) 300\u2013600mg daily regenerates both glutathione and Vitamin C \u2014 a powerful cycle amplifier.",
      "Selenium 100\u2013200mcg daily supports glutathione peroxidase activity.",
      "Magnesium 300\u2013400mg daily (glycinate or malate) supports ATP production and glutathione synthesis pathways.",
      "IM is preferred for maximum systemic effect and skin brightening protocols. SubQ is a convenient alternative at lower doses.",
      "Inject slowly \u2014 particularly IM \u2014 to minimise localised discomfort and flushing.",
      "Rotate injection sites every dose to minimise tissue irritation.",
      "Expect gradual results. Skin brightening and tone improvement are progressive \u2014 most users see meaningful changes between weeks 4\u20136. Do not evaluate before completing a full cycle.",
      "Apply sunscreen daily \u2014 UV exposure significantly worsens pigmentation and counteracts brightening effects.",
      "Cycle off strictly. 4 weeks off after every 4\u20136 week cycle. Continuous use reduces efficacy and may affect thyroid function.",
      "Keep a brief log of injection dates, dose, site, and skin observations. Week-by-week comparison is more revealing than daily assessment."
    ]
  },
  {
    "id": "igf1-lr3",
    "name": "IGF-1 LR3 Dosing Protocol",
    "subtitle": "Insulin-Like Growth Factor 1 Long Arg3 \u2014 Muscle Growth, Recovery & Body Composition",
    "tagline": "Once daily subcutaneous \u2014 post-workout preferred \u2014 8 weeks on / 8 weeks off",
    "cycleInfo": "Daily subcutaneous \u2014 8 weeks on / 8 weeks off",
    "whatIsIt": "IGF-1 LR3 (Insulin-Like Growth Factor 1 Long Arg3) is a synthetic analogue of the naturally occurring IGF-1 hormone, engineered with an arginine substitution at position 3 and 13 additional amino acids at the N-terminus. These structural modifications reduce its affinity for IGF-binding proteins, resulting in a half-life of 20\u201330 hours and approximately 3x greater potency than native IGF-1. It circulates freely for an extended window, binding to IGF-1 receptors throughout muscle and fat to drive anabolic signalling, satellite cell activation, protein synthesis, and fat oxidation simultaneously. Acts on muscle via the PI3K/Akt/mTOR pathway while stimulating lipolysis in adipose tissue. Post-workout timing maximises uptake via elevated muscle insulin sensitivity.",
    "reconstitution": {
      "instructions": "Add 1ml of bacteriostatic water (bac water) to the 1mg vial. Draw up slowly along the vial wall \u2014 do not shake or agitate. Allow to dissolve fully.",
      "table": [
        {
          "vial": "1mg (1000mcg)",
          "water": "1ml (100 units)",
          "concentration": "10mcg per unit (0.01mg per unit)",
          "reference": "20mcg = 2u | 40mcg = 4u | 60mcg = 6u | 80mcg = 8u"
        }
      ],
      "note": "Reconstituted IGF-1 LR3 is significantly less stable than most peptides. Refrigerate immediately and use within 2\u20133 weeks. Sensitive to temperature fluctuation \u2014 do not leave out of the fridge for extended periods."
    },
    "corePrinciple": "Two critical timing rules: (1) Post-workout is the preferred injection window \u2014 elevated muscle insulin sensitivity maximises IGF-1 receptor uptake and nutrient partitioning. Inject within 30 minutes of finishing training. (2) Never inject within 2 hours of bedtime \u2014 IGF-1 LR3 suppresses pituitary GH release and blunts your natural nocturnal GH pulse, undermining the growth hormone environment IGF-1 works with.",
    "injectionFrequency": "Once daily subcutaneous. The 20\u201330 hour half-life maintains effective blood levels with a single injection \u2014 multiple daily injections increase receptor desensitisation risk. On rest days, inject in the morning fasted or semi-fasted (minimum 2-hour fast). Common sites: abdomen, love handles, upper glute fat, back of arm fat. Rotate daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "20\u201340mcg (2\u20134 units / 0.02\u20130.04ml)",
        "notes": "Week 1 \u2014 Tolerance Assessment. Once daily post-workout (or morning on rest days). Deliberate sensitivity check, particularly for blood glucose. Do not start at the maintenance dose."
      },
      {
        "step": 2,
        "dose": "60mcg (6 units / 0.06ml)",
        "notes": "Weeks 2\u20138 \u2014 Maintenance entry. Advance here first (not 80mcg) at the start of Week 2. Effective long-term dose \u2014 many users run the full cycle at 60mcg."
      },
      {
        "step": 3,
        "dose": "80mcg (8 units / 0.08ml)",
        "notes": "Weeks 2\u20138 \u2014 Upper Maintenance. Advance only after 1\u20132 weeks at 60mcg with good tolerability. Do not exceed 80mcg daily outside advanced supervised protocols."
      }
    ],
    "doseEscalationNote": "IGF-1 LR3's high potency and long half-life require a conservative start. Advance only when the current dose is well tolerated with stable blood glucose response.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Week 1 \u2192 60mcg after 7 days with good tolerability and stable glucose. 60 \u2192 80mcg only after 1\u20132 weeks at 60mcg well tolerated."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If hypoglycaemia, significant fatigue, joint pain, or systemic side effects appear. Wait until resolved before advancing. Blood glucose issues require immediate dose reduction."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If side effects persist at your current dose. Stepping back to the lower end of the range (or to 60mcg) is effective management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At 60mcg for the full cycle if results and tolerability are good. Reaching 80mcg is not the goal."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "After 8 weeks on, take a strict 8-week break. Receptor upregulation during the break is what makes the next cycle as potent as the first. Do not shorten."
      }
    ],
    "sideEffects": [
      {
        "effect": "Injection Site Redness / Discomfort",
        "severity": "Mild \u2014 Normal",
        "action": "Normal subcutaneous response. Rotate sites daily. Apply light pressure post-injection. Common in the first 1\u20132 weeks."
      },
      {
        "effect": "Mild Fatigue / Lethargy",
        "severity": "Mild",
        "action": "Ensure adequate hydration and nutrition. Usually transient."
      },
      {
        "effect": "Hypoglycaemia (dizziness, shakiness, cold sweat)",
        "severity": "Moderate",
        "action": "Consume fast-acting carbohydrates immediately (glucose tablets, juice, regular soft drink). Reduce dose. Always inject post-meal, not fasted. If recurrent, drop to Week 1 dose and titrate up more slowly."
      },
      {
        "effect": "Joint Pain / Water Retention",
        "severity": "Mild\u2013Moderate",
        "action": "Reduce dose. Common at higher doses or in sensitive users. Usually resolves within days of dose reduction."
      },
      {
        "effect": "Carpal Tunnel Symptoms (numbness / tingling in hands)",
        "severity": "Moderate",
        "action": "Reduce dose immediately. Sign of IGF-1 excess. Usually resolves within days. Consult a healthcare provider if it persists."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Stay well hydrated. Usually transient and dose-dependent. Reduce dose if persistent."
      },
      {
        "effect": "Severe Hypoglycaemia (confusion, loss of consciousness)",
        "severity": "Severe",
        "action": "Emergency medical attention required. Administer fast-acting glucose (juice, glucose gel) and call emergency services if person is unable to self-administer."
      }
    ],
    "sideEffectWarning": "Contraindicated with active malignancy or history of cancer (IGF-1 promotes cellular proliferation \u2014 hard contraindication), active diabetic retinopathy, and users under 25 years of age (axis still developing; risk of accelerated growth plate closure).",
    "tips": [
      "Always inject post-workout \u2014 within 30 minutes of finishing training. This is the single most important timing rule for superior anabolic and body composition effects.",
      "Never inject fasted in the post-workout window. Eat a protein-containing post-workout meal before or alongside your injection to prevent hypoglycaemia. Keep fast-acting carbohydrates on hand.",
      "Never inject within 2 hours of bedtime \u2014 IGF-1 LR3 suppresses pituitary GH release and blunts your natural nocturnal GH pulse.",
      "On rest days, inject in the morning in a fasted or semi-fasted state (minimum 2-hour fast before injection).",
      "Rotate injection sites daily \u2014 abdomen, love handles, upper glute fat, back of arm fat.",
      "Refrigerate immediately after reconstitution and use within 2\u20133 weeks. Consider small aliquots to minimise freeze-thaw cycles.",
      "Strictly observe the 8-week off period. Receptor upregulation during the break is what keeps subsequent cycles potent.",
      "Plan vial usage: 60mcg cycle \u2248 3\u20134 vials total; 80mcg cycle \u2248 4\u20135 vials total for the full 8 weeks including Week 1.",
      "Many users run IGF-1 LR3 after a GH secretagogue cycle (e.g. CJC-1295 + Ipamorelin) to consolidate lean gains.",
      "Pair with quality post-workout nutrition \u2014 carbohydrates consumed in the post-injection window are preferentially shuttled into muscle.",
      "Keep a brief log: dose, injection time relative to training, blood glucose response, and weekly body composition observations."
    ]
  },
  {
    "id": "cagrilintide",
    "name": "Cagrilintide Dosing Protocol",
    "subtitle": "Long-acting Amylin Receptor Agonist \u2014 Weekly SC Administration",
    "tagline": "Amylin analogue \u2014 appetite, satiety & body composition",
    "cycleInfo": "Weekly subcutaneous \u2014 16+ week structured titration",
    "whatIsIt": "Cagrilintide is a long-acting amylin analogue developed by Novo Nordisk, engineered for once-weekly subcutaneous injection. Unlike native amylin (half-life of minutes), cagrilintide is acylated with a C18 fatty di-acid chain that binds plasma albumin, extending its half-life to approximately 7 days \u2014 enabling stable weekly dosing. It selectively activates amylin receptors (AMY1/2/3) in the brainstem (area postrema) and hypothalamus, driving satiety independent of the GLP-1 pathway, slowing gastric emptying, suppressing postprandial glucagon, and potentially enhancing leptin sensitivity. It has been studied standalone and in combination with semaglutide (CagriSema / REDEFINE trials), producing dose-dependent weight loss with a favorable tolerability profile relative to GLP-1 agonists alone.",
    "pdfUrl": "/protocols/Cagrilintide_Dosing_Protocol.pdf",
    "reconstitution": {
      "instructions": "Add 1ml of bacteriostatic water to the 5mg vial. Allow vial and bac water to reach room temperature before handling. Wipe both tops with an alcohol swab and let dry fully. Inject the bac water slowly down the side of the vial \u2014 do not inject directly onto the lyophilized powder or agitate. Gently roll the vial between your palms until fully dissolved. Do not shake. Solution should appear clear and colorless \u2014 discard if cloudy, discolored, or particulate present.",
      "table": [
        {
          "vial": "5mg",
          "water": "1ml (100 units)",
          "concentration": "5mg/ml (5,000mcg/ml)",
          "reference": "1mg = 20 units | 0.25mg = 5u | 0.5mg = 10u | 1mg = 20u | 1.7mg = 34u | 2mg = 40u | 2.4mg = 48u"
        }
      ],
      "doseBreakdown": "Concentration: 5 mg/mL \u2192 1 mg = 20 units on a 100U insulin syringe.",
      "note": "Store reconstituted vial refrigerated at 2\u20138\u00b0C. Stable for up to 28 days. Do not freeze."
    },
    "corePrinciple": "Titrate slowly. GI side effects (nausea, vomiting) are significantly mitigated by the gradual phased ramp \u2014 do not skip phases. If side effects are severe at a given phase, HOLD the current dose for an additional 2\u20134 weeks before advancing rather than reducing. Because of the ~7-day half-life, dosing consistency matters less than with short-acting peptides, but injecting on the same day each week helps with protocol tracking.",
    "injectionFrequency": "Once weekly subcutaneous injection. Sites: abdomen, thigh, or upper arm. Rotate injection sites weekly to minimize tissue buildup. No food-timing requirement \u2014 inject any time of day.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "0.25 mg (250 mcg) \u2014 5 units",
        "notes": "Phase 1 \u2014 Weeks 1\u20134 (RAMP). Once weekly SC. Deliberate low starting dose to build GI tolerance."
      },
      {
        "step": 2,
        "dose": "0.50 mg (500 mcg) \u2014 10 units",
        "notes": "Phase 2 \u2014 Weeks 4\u20138 (RAMP). Advance only if Phase 1 comfortable with mild or no GI symptoms."
      },
      {
        "step": 3,
        "dose": "1.0 mg (1,000 mcg) \u2014 20 units",
        "notes": "Phase 3 \u2014 Weeks 8\u201312 (BUILD). Advance only when Phase 2 is well tolerated."
      },
      {
        "step": 4,
        "dose": "1.7 mg (1,700 mcg) \u2014 34 units",
        "notes": "Phase 4 \u2014 Weeks 12\u201316 (BUILD). Effective range approaching maintenance."
      },
      {
        "step": 5,
        "dose": "2.0 mg (2,000 mcg) \u2014 40 units",
        "notes": "Phase 5A \u2014 Weeks 16+ (MAINTAIN). Standard maintenance option."
      },
      {
        "step": 6,
        "dose": "2.4 mg (2,400 mcg) \u2014 48 units",
        "notes": "Phase 5B \u2014 Weeks 16+ (MAINTAIN). Upper maintenance where the majority of trial weight-loss effects have been observed. Most subjects plateau 4\u20138 months after reaching this dose."
      }
    ],
    "doseEscalationNote": "Do not skip phases. Move to the next phase only when the current phase is well tolerated. If GI side effects are severe at any phase, hold the current dose 2\u20134 additional weeks before advancing \u2014 do not reduce first.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Only if the current phase is comfortable with mild or absent GI symptoms for at least 2 consecutive weeks."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If nausea, vomiting, or GI symptoms are notable. Hold current dose for an additional 2\u20134 weeks before advancing \u2014 do not reduce prematurely."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "Only if side effects are significantly affecting daily life after extending the hold. Stepping down is smart dose management."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "At 2.0 or 2.4 mg indefinitely if seeing good results and feeling well. Reaching the maximum dose is not the goal; finding your optimal dose is."
      }
    ],
    "sideEffects": [
      {
        "effect": "Nausea",
        "severity": "Mild \u2014 Most common",
        "action": "Typically transient and dose-related. Smaller portions, avoid greasy/spicy food. Usually fades within 1\u20132 weeks at a given phase."
      },
      {
        "effect": "Nausea",
        "severity": "Moderate\u2013Severe",
        "action": "Hold escalation. Extend the current phase 2\u20134 weeks before advancing."
      },
      {
        "effect": "Vomiting",
        "severity": "Any",
        "action": "More likely during titration phases. Hold escalation. If persistent (>48h), consider dose reduction."
      },
      {
        "effect": "Decreased appetite",
        "severity": "Any",
        "action": "Can be significant at higher doses. Ensure adequate protein intake (1.6\u20132.0 g/kg lean body mass) to protect lean mass."
      },
      {
        "effect": "Diarrhea or constipation",
        "severity": "Mild",
        "action": "Increase fluid and fiber intake. Usually transient."
      },
      {
        "effect": "Injection site reactions",
        "severity": "Mild",
        "action": "Mild erythema or induration is expected. Rotate sites weekly."
      },
      {
        "effect": "Fatigue",
        "severity": "Mild",
        "action": "More common during early titration. Ensure hydration and adequate caloric/protein intake."
      },
      {
        "effect": "Headache",
        "severity": "Less common",
        "action": "Stay well hydrated. Usually transient."
      },
      {
        "effect": "Excessive muscle loss risk",
        "severity": "Moderate",
        "action": "Possible if protein intake is inadequate. Prioritize 1.6\u20132.0 g/kg LBM protein and resistance training during any fat loss phase."
      }
    ],
    "sideEffectWarning": "Cagrilintide is an investigational compound and is not FDA-approved as a standalone agent. Research use only.",
    "tips": [
      "Titrate slowly \u2014 GI side effects are significantly mitigated by following the phased ramp above. Do not skip phases.",
      "Inject subcutaneously into abdomen, thigh, or upper arm. Rotate injection sites weekly to minimize tissue buildup.",
      "Administer on the same day each week. The ~7-day half-life is forgiving, but a fixed day helps with protocol tracking.",
      "No food-timing requirement \u2014 inject any time of day.",
      "Monitor body composition, not just scale weight. Cagrilintide preserves lean mass better than caloric restriction alone, but adequate protein intake (1.6\u20132.0 g/kg LBM) and resistance training are strongly recommended during fat loss.",
      "If GI side effects are severe at a given phase, hold that dose an additional 2\u20134 weeks before advancing rather than reducing first.",
      "The maintenance range (2.0\u20132.4 mg) is where the majority of clinical trials have observed maximal weight-loss effects. Most users plateau 4\u20138 months after reaching this dose.",
      "Co-administration with a GLP-1 receptor agonist (e.g. semaglutide, as CagriSema) is a distinct protocol with separate dosing considerations \u2014 do not stack without a dedicated protocol.",
      "Reconstituted vial: refrigerate at 2\u20138\u00b0C, use within 28 days, do not freeze."
    ]
  },
  {
    "id": "kisspeptin-10",
    "name": "Kisspeptin-10 Dosing Protocol",
    "subtitle": "KP-10 \u2014 KISS1R Agonist \u2014 Daily SC Administration, 16-Week Cycle",
    "tagline": "HPG axis stimulation, LH/testosterone support & libido signaling",
    "cycleInfo": "Daily subcutaneous \u2014 12 weeks on / mandatory 4-week washout (16-week cycle)",
    "whatIsIt": "Kisspeptin-10 (KP-10) is the minimal bioactive fragment of the kisspeptin family \u2014 a 10-amino-acid C-terminal sequence that retains full binding affinity for the KISS1R (GPR54) receptor. It is derived from proteolytic cleavage of the full-length KISS1 gene product (145 amino acids), with KP-54 being the predominant circulating isoform and KP-10 the shortest fragment maintaining complete receptor activity. In human studies KP-10 produces equivalent acute LH stimulation to KP-54 at matched molar doses, though KP-54 sustains the LH response longer due to its extended half-life. For research focused on acute HPG axis stimulation \u2014 testosterone axis support, libido signaling, and testicular function \u2014 KP-10 is the more practical isoform. Structure: 10 amino acids, MW ~1302 Da. Half-life: ~4 minutes IV (SC absorption extends the active window). Receptor: KISS1R / GPR54, a Gq-coupled GPCR on GnRH neurons. BBB penetration: limited \u2014 acts primarily on hypothalamic neurons at the median eminence.",
    "reconstitution": {
      "instructions": "Add 3ml of bacteriostatic water to the 10mg vial (or two 1.5ml pulls if using a smaller syringe). Inject the water slowly down the vial wall \u2014 never directly onto the lyophilized powder. Roll gently between palms until dissolved; do not shake. Solution should be clear and colorless \u2014 discard if cloudy, discolored, or if particulate is present.",
      "table": [
        {
          "vial": "10mg",
          "water": "3ml (300 units)",
          "concentration": "3.33mg/ml (3,333mcg/ml)",
          "reference": "100mcg = 3 units | 200mcg = 6 units | 300mcg = 9 units"
        }
      ],
      "doseBreakdown": "100 mcg = 3 units | 200 mcg = 6 units | 300 mcg = 9 units on a 100-unit insulin syringe.",
      "note": "Store reconstituted vial refrigerated at 2\u20138\u00b0C. Stable up to 28 days with bacteriostatic water. Do not freeze. Use a 29\u201331 gauge, 0.5 inch insulin syringe for precision at these small volumes."
    },
    "corePrinciple": "Kisspeptin causes tachyphylaxis. Clinical research clearly documents that daily kisspeptin administration produces progressive KISS1R desensitization beginning within roughly 2 weeks of continuous use \u2014 the LH response blunts and can reverse entirely, suppressing rather than stimulating the HPG axis. This protocol runs 12 weeks of daily dosing followed by a mandatory 4-week washout for receptor resensitization. Monitor LH and testosterone as objective markers of receptor engagement. If effects blunt before Week 12, reduce to every-other-day or twice-weekly dosing \u2014 never increase the dose.",
    "injectionFrequency": "Once daily subcutaneously, fasted in the morning before any food or caloric intake. LH pulsatility naturally peaks in the early morning, and the fasted state avoids blunting of the acute LH response from postprandial insulin and IGF-1 signaling. Keep timing consistent day to day. Inject into abdomen, thigh, or upper arm and rotate sites daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "100 mcg (3 units) \u2014 Weeks 1\u20134",
        "notes": "RAMP. Once daily SC, fasted morning. Baseline LH, FSH, and total testosterone bloodwork before starting; retest at end of Week 4."
      },
      {
        "step": 2,
        "dose": "200 mcg (6 units) \u2014 Weeks 5\u20138",
        "notes": "BUILD. Once daily SC. Watch for any blunting of subjective or lab-measured response."
      },
      {
        "step": 3,
        "dose": "300 mcg (9 units) \u2014 Weeks 9\u201312",
        "notes": "PEAK. Once daily SC. Retest LH, FSH, and total testosterone at end of Week 12."
      },
      {
        "step": 4,
        "dose": "OFF \u2014 Weeks 13\u201316",
        "notes": "WASHOUT. Zero administration for the full 4 weeks. This restores KISS1R density and sensitivity. A transient dip in LH and testosterone in the first 1\u20132 weeks off is expected and normalizes before the next cycle."
      }
    ],
    "doseEscalationNote": "Advance on the fixed 4-week schedule only if labs and subjective response show maintained receptor engagement. If LH or testosterone decline from baseline, that is desensitization \u2014 reduce frequency rather than escalating dose. If repeating the cycle, always restart at Phase 1 (100 mcg) after the full 4 weeks off.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Move to the next phase on schedule only if the current phase is well tolerated and LH/testosterone response is maintained or improved."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If flushing, nausea, or headache are notable, hold the current dose rather than advancing."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If LH or testosterone decline from baseline \u2014 a sign of KISS1R desensitization \u2014 reduce to every-other-day or twice-weekly dosing before considering ending the cycle early."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "Staying at 100\u2013200 mcg for the full run is a valid research decision if response is good. Higher is not better with a receptor that desensitizes."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "The 4-week washout (Weeks 13\u201316) is mandatory and non-negotiable. Continuing past Week 12 risks converting a stimulatory protocol into a suppressive one via KISS1R downregulation."
      }
    ],
    "sideEffects": [
      {
        "effect": "Tachyphylaxis (blunted LH response)",
        "severity": "Expected with daily use from ~Week 2",
        "action": "Monitor LH/testosterone. Reduce frequency to every-other-day or twice-weekly. Never increase the dose to chase effect."
      },
      {
        "effect": "HPG axis suppression",
        "severity": "Moderate\u2013Serious",
        "action": "Occurs if receptor desensitization is sustained. Stop dosing and begin the washout early if labs trend below baseline."
      },
      {
        "effect": "Flushing or warmth at injection site",
        "severity": "Mild \u2014 Transient",
        "action": "Rotate sites daily. Typically resolves within minutes."
      },
      {
        "effect": "Nausea",
        "severity": "Mild \u2014 Less common SC",
        "action": "Reported mainly at higher IV doses. Reduce dose if persistent."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Reported in a small subset of trial subjects. Stay hydrated; usually transient."
      },
      {
        "effect": "Narrow effect window",
        "severity": "Informational",
        "action": "Half-life is ~4 minutes IV. SC extends the window but effects on libido and mood are cumulative and subtle rather than immediate."
      }
    ],
    "sideEffectWarning": "Do not combine with GnRH analogues (agonists or antagonists) \u2014 concurrent use directly interferes with the downstream signaling KP-10 depends on. Long-term safety data for chronic daily SC use is limited. Research use only.",
    "tips": [
      "Baseline bloodwork before starting is strongly recommended \u2014 LH, FSH, and total testosterone at minimum. Retest at Week 4 and Week 12.",
      "Administer fasted in the morning, before any food or caloric intake, and keep timing consistent day to day.",
      "At 3.33 mg/ml the doses draw to clean 3, 6, and 9 unit marks. Draw slowly and verify the fill line before injecting.",
      "Rotate injection sites daily \u2014 at these small volumes repeated micro-trauma to one site can affect absorption.",
      "If LH or testosterone drop below baseline mid-cycle, that's desensitization. Reduce frequency, don't increase dose.",
      "Do not stack with GnRH agonists or antagonists during this protocol.",
      "Take the 4-week washout seriously \u2014 it is the mechanism by which receptor sensitivity is restored for the next cycle.",
      "Reconstituted vial: refrigerate at 2\u20138\u00b0C, use within 28 days, do not freeze."
    ]
  },
  {
    "id": "dsip",
    "name": "DSIP Dosing Protocol",
    "subtitle": "Delta Sleep-Inducing Peptide \u2014 Daily SC Administration",
    "tagline": "Delta-wave sleep promotion, HPA axis modulation & recovery",
    "cycleInfo": "Daily subcutaneous before bed \u2014 8\u201310 weeks on / 4\u20136 weeks off",
    "whatIsIt": "Delta Sleep-Inducing Peptide (DSIP) is a naturally occurring nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) first isolated from rabbit cerebral venous blood in 1977 at the University of Basel. It was named for its observed ability to increase slow-wave (delta) EEG activity \u2014 corresponding to deep, restorative sleep \u2014 but subsequent research revealed a much broader profile including effects on stress, pain, hormone regulation, and antioxidant activity. Unlike most neuropeptides, DSIP's gene has never been identified. It is found in the hypothalamus, limbic system, and pituitary, has been detected in peripheral organs and human breast milk, and crosses the blood-brain barrier. MW ~850 Da, plasma half-life ~30 minutes \u2014 hence daily dosing. Investigational, with no FDA-approved indication.",
    "reconstitution": {
      "instructions": "Add 1ml of bacteriostatic water to the 10mg vial. Inject the water slowly down the vial wall \u2014 never directly onto the lyophilized powder. Roll gently between palms until dissolved; do not shake. Solution should be clear and colorless \u2014 discard if cloudy, discolored, or if particulate is present.",
      "table": [
        {
          "vial": "10mg",
          "water": "1ml (100 units)",
          "concentration": "10mg/ml (10,000mcg/ml)",
          "reference": "100mcg = 1 unit | 1mg = 10 units"
        }
      ],
      "doseBreakdown": "300 mcg = 3 units | 500 mcg = 5 units | 1,000 mcg = 10 units on a 100-unit insulin syringe.",
      "note": "Store reconstituted vial refrigerated at 2\u20138\u00b0C. Stable up to 28 days with bacteriostatic water. Do not freeze. DSIP has low molecular stability \u2014 source quality and cold-chain handling matter more here than with most peptides. Inspect the solution before every use."
    },
    "corePrinciple": "DSIP acts as a neuromodulator, not a sedative \u2014 its effects are normalizing rather than dose-linear. More is not better. If the target sleep effect is achieved at 500 mcg, staying there is a sound research decision rather than advancing to 1 mg. Effects can attenuate with continuous daily use; diminishing response is a signal to take a break, not to raise the dose.",
    "injectionFrequency": "Once daily subcutaneously, 30\u201360 minutes before bed. Given the ~30-minute plasma half-life, pre-bed timing aligns peak plasma concentration with sleep onset. Note the documented paradoxical mild arousing effect in the first ~60 minutes post-injection before sleep-promoting effects take over \u2014 another reason to dose slightly before the intended sleep window rather than at lights out. Inject into abdomen, thigh, or upper arm and rotate sites daily.",
    "doseSteps": [
      {
        "step": 1,
        "dose": "300 mcg (3 units) \u2014 Weeks 1\u20132",
        "notes": "RAMP. Once daily SC, 30\u201360 min before bed. Establish a consistent sleep-tracking method from day one."
      },
      {
        "step": 2,
        "dose": "500 mcg (5 units) \u2014 Weeks 2\u20134",
        "notes": "RAMP. Once daily SC. Many researchers find this the effective plateau and remain here."
      },
      {
        "step": 3,
        "dose": "1,000 mcg (10 units) \u2014 Week 4+",
        "notes": "MAINTENANCE. Once daily SC. This is at the higher end of the research literature \u2014 most human trials used 25 nmol/kg IV (roughly 550\u2013750 mcg for an average adult), so consider SC vs IV bioavailability differences before advancing."
      }
    ],
    "doseEscalationNote": "Advance only if the lower dose produces insufficient sleep improvement after 1\u20132 weeks. Because DSIP's effects are normalizing rather than dose-linear, the lowest effective dose is the target.",
    "decisionRules": [
      {
        "label": "Advance",
        "color": "text-green-400",
        "description": "Only if sleep quality metrics show no meaningful improvement after 1\u20132 weeks at the current dose."
      },
      {
        "label": "Hold",
        "color": "text-warning",
        "description": "If headache or persistent post-injection arousal occurs, hold the current dose until it settles."
      },
      {
        "label": "Reduce",
        "color": "text-warning",
        "description": "If effects feel excessive or grogginess develops, step back to the previous dose. 500 mcg is a valid long-term maintenance level."
      },
      {
        "label": "Stay",
        "color": "text-primary",
        "description": "If sleep architecture and morning recovery are good at 300\u2013500 mcg, stay there. Reaching 1 mg is not the goal."
      },
      {
        "label": "Cycle off",
        "color": "text-red-400",
        "description": "8\u201310 weeks on, then 4\u20136 weeks off. If subjective effects noticeably diminish, that's tolerance \u2014 take the break rather than increasing the dose."
      }
    ],
    "sideEffects": [
      {
        "effect": "Transient mild arousal post-injection",
        "severity": "Mild \u2014 Expected",
        "action": "Paradoxical effect in the first ~60 minutes. Inject 30\u201360 minutes before bed rather than at lights out."
      },
      {
        "effect": "Headache",
        "severity": "Mild",
        "action": "Reported in a small subset of subjects in withdrawal trials. Stay hydrated; usually transient."
      },
      {
        "effect": "Injection site reactions",
        "severity": "Mild",
        "action": "Standard SC consideration. Rotate sites daily and use a 29\u201331 gauge syringe."
      },
      {
        "effect": "Tolerance / attenuating effect",
        "severity": "Moderate",
        "action": "Sleep and HPA-modulating effects can blunt with continuous daily use. Take a 4\u20136 week break rather than escalating."
      },
      {
        "effect": "Product instability",
        "severity": "Informational",
        "action": "DSIP has low molecular stability \u2014 inspect solution before each use and maintain strict cold-chain handling."
      }
    ],
    "sideEffectWarning": "Generally well tolerated in human studies with no major adverse events reported, but long-term safety data is limited \u2014 most studies were short duration. Exercise caution if combining with any CNS-active compounds given DSIP's neuromodulatory activity. Research use only.",
    "tips": [
      "Inject 30\u201360 minutes before bed \u2014 not at lights out \u2014 to work around the paradoxical first-hour arousal effect.",
      "At 10 mg/ml the volumes are very small (3\u20135 units in Phases 1 and 2). Use a 29\u201331 gauge insulin syringe for precision.",
      "Track sleep consistently throughout the protocol \u2014 subjective sleep logs plus wearable sleep-staging data where possible.",
      "DSIP's effects are normalizing, not dose-linear. If 500 mcg works, there's no reason to push to 1 mg.",
      "Rotate injection sites daily to minimize local tissue reaction.",
      "An alternative to continuous daily use is a 5-days-on / 2-days-off weekly structure to help preserve receptor responsiveness.",
      "Source quality matters more than usual here \u2014 DSIP is one of the less stable peptides in solution.",
      "Reconstituted vial: refrigerate at 2\u20138\u00b0C, use within 28 days, do not freeze."
    ]
  }
];
