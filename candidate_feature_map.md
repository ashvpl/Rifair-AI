# Candidate Feature Map

This document maps the fields found in the Redrob candidate dataset, explaining their significance, their role in ranking logic, suggested weights, and their overall value to recruiters.

## Profile Block

| Field | Representation | Influence on Ranking | Suggested Weight | Recruiter Value |
|-------|----------------|----------------------|------------------|-----------------|
| `anonymized_name` | String name | **No**. Avoid to prevent bias. | 0 | Identifies candidate post-ranking. |
| `headline` | Professional summary | **Yes**. Quick proxy for role identity. | Low/Medium | High for visual scanning. |
| `summary` | Free-text bio | **Yes**. Semantic context for career intent. | Medium | Explains transition narrative. |
| `location`/`country` | Geography | **Yes**. JD specifies Pune/Noida/India. | High (Filter/Boost) | Crucial for logistics. |
| `years_of_experience` | Total work history | **Yes**. JD targets 5-9 years. | High (Curve) | Immediate disqualification proxy. |
| `current_title` | Job Title | **Yes**. Strongest signal of actual day-to-day. | High | Prevents "Marketing Manager" honeypots. |
| `current_company_size` | Scale of work | **Yes**. Startups vs Enterprise. | Low | Contextualizes system scale. |
| `current_industry` | Domain | **Yes**. Product vs Pure Consulting. | Medium | JD explicitly prefers product companies. |

## Career History Block

| Field | Representation | Influence on Ranking | Suggested Weight | Recruiter Value |
|-------|----------------|----------------------|------------------|-----------------|
| `company` | Employer name | **Yes**. Detecting consulting-only careers. | Medium | Identifies pedigree and company culture. |
| `title` | Role held | **Yes**. Tracks trajectory and seniority. | High | Shows progression. |
| `start_date` / `end_date` | Employment dates | **Yes**. Tracks job hopping. | High (Penalty) | Identifies "title chasers" (<1.5 yr stints). |
| `duration_months` | Tenure | **Yes**. Corroborates dates. | Medium | Proof of stability. |
| `description` | Role responsibilities | **Yes**. Primary target for semantic embedding. | **Very High** | Core matching text for finding "Shippers". |

## Education Block

| Field | Representation | Influence on Ranking | Suggested Weight | Recruiter Value |
|-------|----------------|----------------------|------------------|-----------------|
| `degree`/`field_of_study`| Academic background | **Yes**. CS/Math vs unrelated fields. | Low | Nice to have, rarely a dealbreaker. |
| `tier` | Institutional prestige | **No**. JD emphasizes production output. | 0 | Can introduce unnecessary bias. |
| `start_year`/`end_year`| Timeline | **No**. Can be used for honeypot detection. | 0 | Used for timeline validation only. |

## Skills Block

| Field | Representation | Influence on Ranking | Suggested Weight | Recruiter Value |
|-------|----------------|----------------------|------------------|-----------------|
| `name` | Technology/Skill | **Yes**. Exact matching for Vector DBs/Python. | Medium | Baseline requirement check. |
| `proficiency` | Self-reported level | **No/Low**. Highly subjective. | Low | Minor signal. |
| `endorsements` | Peer validation | **Yes**. Validates skill authenticity. | Medium | Trust multiplier. |
| `duration_months` | Time utilizing skill | **Yes**. Filters out 0-duration honeypots. | High | The ultimate proof of actual experience. |

## Redrob Signals (Behavioral Telemetry)

| Field | Representation | Influence on Ranking | Suggested Weight | Recruiter Value |
|-------|----------------|----------------------|------------------|-----------------|
| `profile_completeness_score` | Data density | **Low**. | Low | Basic hygiene check. |
| `last_active_date` | Platform recency | **Yes**. Dead profiles are useless. | High (Decay) | Crucial for conversion rates. |
| `open_to_work_flag` | Explicit intent | **Yes**. Immediate availability. | Medium (Boost) | Fast-tracks hiring. |
| `recruiter_response_rate` | Reply probability | **Yes**. High value multiplier. | High (Multiplier) | Recruiter efficiency. |
| `github_activity_score` | Code footprint | **Yes**. Validates "shipper" mentality. | Medium | Proof of technical engagement. |
| `interview_completion_rate` | Reliability | **Yes**. Penalty for ghosting. | Medium | Reduces wasted recruiter time. |
| `skill_assessment_scores` | Objective tests | **Yes**. Hard proof of skill. | Medium | Removes interview risk. |
| `expected_salary_range_inr_lpa`| Economics | **No**. Unless explicitly filtering by budget. | 0 | Negotiation baseline. |
| `notice_period_days` | Time-to-start | **Yes**. JD requests <30 days. | High (Filter) | Critical for immediate needs. |
| `verified_*` / `linkedin_connected` | Sybil defense | **Yes**. Protects against fake accounts. | Low (Hygiene) | Trust baseline. |

## Core Ranking Philosophy derived from Feature Map

The ranking engine should not linearly sum these weights. Instead, it should use a **Multiplicative Architecture**:

**Total Score = (Relevance Score) * (Authenticity Multiplier) * (Behavioral Multiplier)**

1. **Relevance Score**: Driven by `career_history[].description`, `current_title`, and `years_of_experience`.
2. **Authenticity Multiplier**: Driven by `skills[].duration_months`, `endorsements`, and honeypot timeline validation. (Mismatches drive this to 0).
3. **Behavioral Multiplier**: Driven by `recruiter_response_rate`, `last_active_date`, and `interview_completion_rate`. (Inactive ghosts drive this to near 0).
