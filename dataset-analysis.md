# Candidate Intelligence Engine - Phase 1: Dataset Analysis

## 1. Dataset Inventory

A complete recursive scan of the repository identified the following key dataset and hackathon reference files:

| File Name | Format | Size | Record Count | Description |
|-----------|--------|------|--------------|-------------|
| `candidates.jsonl` | JSON Lines | ~487.26 MB | 100,000 | Primary candidate dataset containing rich profile and behavioral data. |
| `sample_candidates.json` | JSON Array | ~300.10 KB | ~50 | Human-readable sample subset of `candidates.jsonl`. |
| `candidate_schema.json` | JSON Schema | 8.82 KB | N/A | Strict structural definition for candidate records. |
| `job_description.docx` | Word Document | 40.23 KB | N/A | Unstructured text containing the target "Senior AI Engineer" JD. |
| `redrob_signals_doc.docx` | Word Document | 37.17 KB | N/A | Documentation explaining the 23 behavioral platform signals. |
| `submission_spec.docx` | Word Document | 42.71 KB | N/A | Evaluation criteria, honeypot warnings, and submission rules. |
| `sample_submission.csv` | CSV | 9.25 KB | 100 | Example submission output format. |

## 2. Entity Relationship Mapping

The primary entity in this dataset is the **Candidate** (`candidates.jsonl`). The dataset is heavily denormalized, meaning a single JSON line contains a candidate's complete professional ontology. 

The relationships can be mapped as:
- **Candidate (1:1)** ➔ `Profile` (Basic metadata)
- **Candidate (1:N)** ➔ `Career History` (Past/current roles)
- **Candidate (1:N)** ➔ `Education` (Degrees and institutions)
- **Candidate (1:N)** ➔ `Skills` (Endorsements and durations)
- **Candidate (1:N)** ➔ `Certifications` & `Languages`
- **Candidate (1:1)** ➔ `Redrob Signals` (23 behavioral telemetry points)

The target entity is the **Job Description** (`job_description.docx`), which represents a 1:N relationship (One JD to 100,000 Candidate evaluations).

## 3. Candidate Schema Documentation

The schema rigidly enforces candidate structure:
* **`candidate_id`**: String matching `^CAND_[0-9]{7}$`.
* **`profile`**: Nested object requiring `headline`, `summary`, `location`, `years_of_experience` (0-50), `current_title`, `current_company`, and `current_industry`.
* **`career_history`**: Array (1-10 items). Each item details a specific job tenure.
* **`education`**: Array (0-5 items). Captures degrees, institutions, and internal prestige `tier`.
* **`skills`**: Array mapping `name` to `proficiency` (beginner/intermediate/advanced/expert), `endorsements`, and `duration_months`.
* **`certifications` / `languages`**: Optional arrays for supplementary credentials.
* **`redrob_signals`**: Nested object containing exactly 23 required synthetic telemetry fields detailing platform engagement.

## 4. Job Schema Documentation

Unlike the candidate data, the Job Description is entirely **unstructured text**. 
Based on our extraction, the JD implies the following "virtual schema":
* **Target Title**: Senior AI Engineer — Founding Team
* **Target Experience**: 5–9 years (flexible, but specific disqualifiers exist)
* **Required Technical Skills**: Production embedding retrieval, Vector databases (Pinecone, Qdrant, etc.), Python, evaluation frameworks (NDCG, MRR).
* **Negative Signals (Disqualifiers)**: Pure research background, solely consulting background (without product experience), "title chasers", or LangChain/wrapper-only experience.

## 5. Signal Documentation

The dataset includes a proprietary `redrob_signals` object that tracks platform telemetry. Critical signals include:
* **Availability**: `open_to_work_flag`, `notice_period_days`, `last_active_date`.
* **Responsiveness**: `recruiter_response_rate`, `avg_response_time_hours`.
* **Competitiveness**: `search_appearance_30d`, `saved_by_recruiters_30d`, `offer_acceptance_rate`.
* **Verification**: `verified_email`, `verified_phone`, `linkedin_connected`.
* **Quality Multipliers**: `github_activity_score` (ranges -1 to 100), `skill_assessment_scores`.

## 6. Data Quality Assessment

* **Data Types**: Enforced strict enums for `company_size`, `tier`, `proficiency`, and `preferred_work_mode`.
* **Nested Objects**: Present in `profile`, `redrob_signals.expected_salary_range_inr_lpa`, and `redrob_signals.skill_assessment_scores`.
* **Arrays**: `career_history`, `education`, `skills`, `certifications`, `languages`.
* **Nullable Fields**: 
  * `career_history[].end_date` is nullable (represents current employment).
  * `education[].grade` is nullable.

## 7. Missing Values Assessment

The dataset uses distinct conventions for missing data:
* **Dates**: Missing `end_date` in career implies `is_current: true`.
* **Scores**: Missing `github_activity_score` is explicitly `-1` (no GitHub linked).
* **Rates**: Missing `offer_acceptance_rate` is `-1` (no offer history).
* **Assessments**: `skill_assessment_scores` can be an empty dictionary `{}` if no assessments were taken.
* **Arrays**: `skills`, `certifications`, `education`, and `languages` can be empty lists `[]`.

## 8. Potential Features For Ranking

To build an effective scoring mechanism against the specific "Senior AI Engineer" JD, the following composite features should be extracted:
* **Semantic Semantic Match**: Embedding `career_history[].description` against JD requirement text.
* **"Shipper" vs "Researcher" Classifier**: Using career history to detect product deployments vs purely academic roles.
* **Tenure Penalty**: Penalizing candidates who switch jobs every <1.5 years ("title chasers").
* **Availability Multiplier**: A compound score using `last_active_date` and `recruiter_response_rate`. (A perfect match with 0.05 response rate is practically useless).
* **Skill Trust Score**: Using `duration_months` and `endorsements` to validate the authenticity of claimed skills (mitigates keyword stuffing).

## 9. Potential Bias Signals

If fed naively into an LLM or scoring model, the dataset contains fields that could introduce bias:
* `profile.anonymized_name`: Could infer gender or ethnicity.
* `education[].tier`: Heavy weighting could penalize self-taught engineers or those from non-target schools.
* `education[].start_year`: Proxies for candidate age.
* `profile.location` / `country`: Geographic bias (JD asks for Noida/Pune, but remote flexibility exists).
* `expected_salary_range_inr_lpa`: May penalize candidates who undervalue their skills.

## 10. Potential Honeypot Signals

The hackathon explicitly mentions ~80 "honeypot" profiles designed to trick naive keyword-matching engines. Detected honeypot patterns include:
* **Chronological Contradictions**: 8 years of experience at a company founded 3 years ago, or `duration_months` wildly exceeding `years_of_experience`.
* **Skill Stuffing**: Candidates with "Expert" proficiency in highly specific AI tools but `duration_months` of 0.
* **Title/Skill Mismatches**: Candidates with the title "Marketing Manager" but a perfect suite of AI/ML engineering keywords (explicitly warned about in the JD).
* **Improbable Trajectories**: Unrealistic overlaps in `career_history` dates.
