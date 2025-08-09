# Attendance Feature TODOs (Deferred)

## Context
- My Page "나의 스터디" now shows real data with attendanceRate.
- A minimal attendance domain was introduced to compute attendanceRate, but full CRUD is deferred to a later phase per decision.

## TODOs
- Authorization
  - Restrict attendance CRUD to study OWNER/MANAGER; verify membership/role in study-service before allowing writes.
- API surface
  - Sessions: create, update (reschedule), delete with validation (time ranges, overlaps if needed).
  - Attendance records: create/update/delete; idempotency and duplicate protection (memberId, sessionId unique).
  - Query endpoints to retrieve sessions and attendance history for a user.
- Data model
  - Add constraints and indices: `(memberId, sessionId)` unique, foreign-key-like integrity between `attendance` and `study_session` (app-level if DB FKs are not used).
- Aggregation & performance
  - Introduce cached/denormalized summary per member per study to avoid frequent re-aggregation.
  - Batch recomputation strategy on session/record changes; background job if necessary.
- Observability
  - Add metrics for write/read throughput, error rates, and aggregation latency.
  - Structured audit logs for attendance changes.
- Testing
  - Expand integration tests to cover negative cases: invalid roles, cross-study access, duplicate records, invalid times.
  - Property-based tests for aggregation edge cases (0/0, partial data, rounding).

## Rollout Notes
- JPA ddl-auto is used in non-prod and can be used in prod per decision; verify schema creation on startup.
- Ensure gateway header propagation remains consistent in all environments.
