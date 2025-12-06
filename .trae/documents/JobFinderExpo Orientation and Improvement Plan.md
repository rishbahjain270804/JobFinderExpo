## Goal

* On a single API call, ingest thousands of jobs from multiple sources, store and reuse results across users, and keep both cached result sets and job records for 30 days before automatic deletion.

## High-Level Architecture

* Backend service (Node.js + TypeScript) exposing `/jobs` and `/jobs/recommended` APIs.

* Source adapters: Greenhouse, Lever, SmartRecruiters, Workday, plus aggregator APIs (Adzuna/JSearch). Avoid direct scraping of LinkedIn/Glassdoor/Indeed; use compliant endpoints/APIs.

* Storage: Postgres for normalized jobs; Redis for query/profile caches with 30-day TTL.

* Background pipeline: concurrent ingest workers with rate limiting and retries; daily purge task to enforce 30-day retention.

* Mobile app calls backend instead of external sources directly.

## Data Model (Postgres)

* `jobs` table (normalized): `id`, `source`, `source_job_id` (unique), `title`, `company`, `location_city`, `location_region`, `location_country`, `remote`, `salary_min`, `salary_max`, `salary_currency`, `description`, `apply_url`, `posted_at`, `discovered_at`, `hash`, `created_at`, `updated_at`.

* Indexes: `source+source_job_id` (unique), `hash`, `posted_at`, text search index on `title/company/location`.

* `users` table mirrors profile fields from the app.

* Redis caches: keys per `queryHash` or `profileHash` => set of job IDs and metadata; TTL = 30 days.

## Source Adapters

* Implement per-platform connectors that return `NormalizedJob[]`:

  * Greenhouse, Lever, SmartRecruiters: public JSON APIs per company.

  * Workday: common JSON endpoints per tenant.

  * Adzuna/JSearch: broad aggregator coverage via API keys.

* Normalize fields into the canonical schema; include `posted_at` for retention.

## Ingestion Pipeline

* `POST /jobs/search` triggers adapters with criteria (query, location, remote, seniority, tech stack).

* Orchestrator runs adapters concurrently (bounded), aggregates, dedupes by `source+source_job_id` and `hash`, upserts into `jobs`.

* Write result sets to Redis with TTL=30 days keyed by query/profile; return combined results (cached + fresh).

## Deduplication & Updates

* Primary uniqueness: `source+source_job_id`; fallback hash computed from `title+company+location+apply_url`.

* Upsert to update changed details and `updated_at`.

* Canonicalize strings to reduce duplicate variance.

## Retention & Purge (30 Days)

* DB purge: `DELETE FROM jobs WHERE posted_at < now() - interval '30 days'` (daily cron).

* Cache purge: Redis keys expire automatically after 30 days (TTL); optional sweeping task for safety.

## Recommendation API

* `GET /jobs/recommended?userId=...` or `POST /jobs/recommended` with profile.

* Combines Redis-cached sets (<=30 days), fresh ingest if cache stale/missing, and DB jobs (<=30 days); applies matching/scoring and returns top N.

* Port the app’s matching logic from `src/services/jobMatcher.ts` to backend for parity.

## Mobile Integration

* Replace `src/services/realTimeJobScraper.ts` network calls with backend `/jobs/recommended`.

* Reduce client-side caching; backend owns retention and reuse for 30 days.

## Error Handling & Limits

* Adapter-level rate limits and retries; circuit breakers and fallbacks to cached data.

* Observability: logs, metrics, tracing for latency, errors, counts.

## Security & Compliance

* Keep keys server-side; do not bundle in the app.

* Use public JSON endpoints and aggregator APIs; respect TOS/robots.

## Testing

* Unit tests: normalization, dedupe/upsert, purge scheduler (30-day rule).

* Integration tests: `/jobs/search` and `/jobs/recommended` combining cache (30-day TTL) and DB.

## Rollout Plan

1. Scaffold backend, Postgres/Redis, and purge scheduler for 30-day retention.
2. Implement adapters (start with Greenhouse, Lever, SmartRecruiters; add Workday and Adzuna/JSearch).
3. Build ingest orchestrator, dedupe/upsert logic, and Redis cache with 30-day TTL.
4. Expose APIs and integrate the mobile app.
5. Add tests, observability, and load validation (thousands per API call).

## Acceptance Criteria

* Single API call ingests thousands across adapters; returns combined results.

* Redis caches and DB records are retained for 30 days and auto-purged.

* Recommendation endpoint serves fresh + cached jobs scored by profile.

