# Evidence-grounded peptide RAG: initial design

## Goal and boundary

Build an evidence navigator that accepts a health goal or therapy question and returns **what the evidence says about peptide candidates**, with citations, uncertainty, safety/regulatory context, and an explicit account of gaps. In the first version, it should not diagnose, prescribe, select a treatment for an individual, or provide dosing/cycling/reconstitution instructions. A clinician remains responsible for decisions for a particular patient.

The phrase “recommend peptides” needs a careful product definition: the initial product should rank and compare *evidence relevance*, not tell an individual what to take. It should be able to say “no peptide has adequate human evidence for this goal” and leave the result empty. “Peptide” is not itself evidence of efficacy or safety.

## What is already in this workspace

`Peptalk_Classroom_Archive` contains 797 accessible lesson pages across 75 courses. Its `Coverage_Report.txt` says claims have not been independently verified, videos were not transcribed, and linked papers and external pages were not downloaded. This is useful for discovering aliases, questions, and claims to check. It must be labeled **community/educational material**, kept out of clinical evidence scoring, and never allowed to outweigh a regulator, trial report, or peer-reviewed study.

## User input and output

Keep the initial intake low risk and collect only what is needed to search evidence:

- Goal/condition in the user's own words; optionally age band, sex where clinically relevant, and country/region.
- Whether they want approved treatments only, human research, or a broad research landscape.
- Optional exclusions/preferences. Do not ask for name, exact birth date, address, or full medical record in the prototype.

Do not infer diagnoses. If the user includes symptoms, medication lists, pregnancy, serious illness, or an urgent red flag, show a clear handoff to a licensed clinician or emergency service rather than generate a personalized regimen.

For each candidate (or a clear “no supported candidate” result), return:

1. **Evidence status:** approved for this indication / investigated in humans / preclinical only / no relevant evidence found. State jurisdiction and the date checked.
2. **Why it matched:** exact condition, population, intervention/formulation/route, comparator, and outcome studied; identify mismatches to the user's query.
3. **Findings:** outcome and effect estimate when the source reports one, study design, sample size, duration, and uncertainty. Do not turn animal, cell, mechanism, anecdote, or an ongoing trial into a human efficacy claim.
4. **Safety and regulatory facts:** known adverse events and contraindications from authoritative sources; distinguish FDA approval from compounding status and from a substance merely being studied or listed for review.
5. **Citations:** source title, authors/organization, date, DOI/PMID/NCT or record identifier, direct link, and a short supporting excerpt or location. Every factual efficacy/safety statement must cite a retrieved source.
6. **Evidence gaps and limits:** missing human data, low certainty, indirect population/route, short follow-up, unpublished results, or conflicting findings.

Do not use a single opaque “best peptide” score. If sorting is useful, label it “match to evidence for this question” and expose the reason: indication match, human evidence, study quality, recency, and safety/regulatory status.

## Evidence source policy

Use source classes and show them visibly in every result:

| Tier | Sources | Use |
|---|---|---|
| A | Current regulator-approved labels/databases and safety notices (for example FDA Drugs@FDA/labels and current FDA compounding notices; corresponding official agency in the user's region) | Approval, labeled use, contraindications, warnings, regulatory status |
| B | Published systematic reviews/guidelines and completed human randomized or well-designed comparative studies | Clinical benefit and harm; assess certainty by outcome, not just article count |
| C | Human observational studies, early-phase trials, registered trial records | Context and hypothesis; clearly label limitations and whether results are posted |
| D | Animal/in-vitro studies, mechanisms, patents, conference abstracts | Biological rationale only; never as evidence of clinical benefit |
| E | The archived classroom, forums, vendor pages, testimonials | Query expansion and claim discovery only; label as non-clinical, exclude from efficacy ranking |

The system should prefer primary papers for individual findings and use systematic reviews to find/assess the body of evidence. Evidence certainty should be reviewed using GRADE-like domains (risk of bias, inconsistency, indirectness, imprecision, publication bias); an LLM's self-assigned certainty is not a validated clinical grade. A trial registration is not proof of benefit, and an abstract is not equivalent to a complete result report.

Maintain a curated source registry with source owner, jurisdiction, evidence tier, update cadence, last successful sync, and parser version. Candidate integrations: PubMed/NCBI E-utilities, PubMed Central open full text, ClinicalTrials.gov API v2, official drug labels/regulatory pages, and curated guideline/review sources. Respect licensing and reuse rules; use abstracts/open access text when full text is not licensed. Store canonical IDs and links rather than copying large copyrighted articles into prompts.

## Retrieval and answer pipeline

1. Normalize the query into a structured PICO-like request: population, condition/goal, intervention (including synonyms), comparator, outcome, setting, region, and requested evidence scope. Ask one focused clarification only if ambiguity would materially change retrieval.
2. Expand peptide aliases and condition terms from a reviewed synonym table; preserve the original terms for display.
3. Search structured records and full text with hybrid lexical + vector retrieval. Apply metadata filters for human vs nonhuman, trial phase/status, publication type, population, intervention, route/formulation, outcome, date, jurisdiction, and evidence tier. Do not rely on embeddings alone for molecule names or numeric outcomes.
4. Rerank by exact indication/population/outcome match and source quality. Keep competing and null/negative results; deduplicate the same trial across registry, abstract, and publication.
5. Build a compact evidence table from retrieved records. Generate the narrative only from this table and source passages. Validate that each generated claim has a citation and that citations resolve to retrieved records.
6. If sources do not support an answer, abstain: “I could not find adequate evidence for this question.” Never fill gaps with model memory.
7. Apply safety/output checks: no individualized dosing, injection/compounding instructions, cycling, or advice to stop prescribed therapy; detect urgent symptoms and route out.

## Ingestion and data model

Store one record per evidence item, plus passage chunks linked to that record. Suggested fields:

```text
EvidenceRecord(
  id, source_tier, source_type, title, authors, publication_date, updated_at,
  doi, pmid, pmcid, nct_id, url, jurisdiction, source_owner,
  peptide_canonical, peptide_aliases[], indication_terms[],
  study_design, species, phase, status, n, population, route, formulation,
  comparator, outcomes[], results_summary, adverse_events[], limitations[],
  approval_status, extraction_method, human_review_status, content_hash
)
```

Keep source text and model-generated structured summaries separate. Record provenance down to the page/section or abstract passage. Re-ingestion should be idempotent by canonical identifier and content hash. Log when sources change and re-review safety/regulatory records frequently. Human review is required before summaries can be labeled clinically reviewed.

For the classroom archive, use a separate collection/namespace with `source_tier=E` and `clinical_claim=false`. It may provide synonyms and questions to search, but retrieval policy should prevent it from being used as evidence for “works,” benefit, or safety.

## A pragmatic first implementation

- **Backend:** Python + FastAPI, Pydantic schemas.
- **Evidence storage:** PostgreSQL for normalized records; `pgvector` for passages. Full-text/BM25 search (Postgres initially; OpenSearch later only if needed).
- **Ingestion:** scheduled source-specific fetchers with a review queue and provenance logs.
- **LLM:** structured output constrained to retrieved evidence IDs; no free-form ungrounded peptide generation.
- **UI:** simple web form and an evidence comparison table with expandable citations and evidence gaps.
- **Deployment:** private prototype first; no personal health data persistence by default. Before any external/public deployment, determine jurisdiction, privacy/security requirements, intended user (consumer vs clinician), and whether the claims/functionality may create medical-device or other regulatory obligations.

## Validation before anyone relies on it

Create a clinician/pharmacologist-reviewed gold set of realistic questions, including unsupported indications, animal-only evidence, mixed/negative trials, aliases, formulation mismatches, and urgent/high-risk inputs. Measure retrieval recall of key studies, source-tier correctness, citation entailment/link correctness, evidence classification, appropriate abstention, and unsafe-output rate. Test every update against the same set. Do not market or release it as a treatment recommender based only on retrieval metrics; clinical, privacy, and regulatory review are separate gates.

## Suggested build sequence

1. Start with an evidence-search/comparison prototype for a narrow set of conditions and peptides; read only curated human/official sources.
2. Add ingestion for PubMed and ClinicalTrials.gov, deduplication, and a manually reviewed synonym/indication map.
3. Add citation-grounded summaries, uncertainty and abstention behavior, and the review queue.
4. Evaluate on the reviewed gold set; fix misses and unsafe answers before expanding the topic scope.
5. Only then decide whether the product should remain an evidence navigator or pursue a regulated clinical decision-support pathway.

## Reference links

- [FDA: Certain bulk drug substances for compounding that may present significant safety risks](https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks)
- [FDA: Bulk drug substances used in compounding under section 503A](https://www.fda.gov/drugs/human-drug-compounding/bulk-drug-substances-used-compounding-under-section-503a-fdc-act)
- [FDA: Compounding questions and answers](https://www.fda.gov/drugs/human-drug-compounding/compounding-and-fda-questions-and-answers)
- [PubMed: E-utilities/API help](https://pubmed.ncbi.nlm.nih.gov/help/)
- [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api)
- [Cochrane Handbook: GRADE certainty of evidence](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14)

