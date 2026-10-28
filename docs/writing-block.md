# Superadmin — Technical Requirements & System Architecture

**Product:** Construction Project Management System

**Scope:** Platform Superadmin

**Backend:** Golang

**Architecture:** Modular Monolith

**API:** REST API v1

**Database:** PostgreSQL
**Document Type:** Technical Specification

---

## 1. System Overview

Superadmin merupakan administrative control plane yang memiliki tanggung jawab mengelola organisasi pelanggan, akses platform, konfigurasi global, subscription, penggunaan resource, monitoring operasional, dan audit.

Superadmin berjalan dalam backend yang sama dengan sistem operasional proyek konstruksi, tetapi memiliki boundary autentikasi, otorisasi, endpoint, dan service yang terpisah.

### Architectural principles

- **Single Backend:** Satu aplikasi Go menjadi sumber business logic platform dan tenant.
- **Multi-Tenant:** Setiap perusahaan memiliki ruang data terisolasi menggunakan `company_id`.
- **Centralized Authorization:** Semua pemeriksaan permission dilakukan di backend.
- **Least Privilege:** Superadmin tidak otomatis mendapatkan akses ke konten bisnis pelanggan.
- **Transactional Consistency:** Mutasi administratif yang terkait harus konsisten di PostgreSQL.
- **Auditable Operations:** Semua perubahan administratif sensitif memiliki jejak audit.
- **API-Driven:** Dashboard Superadmin hanya mengonsumsi kontrak API, bukan mengakses database.
- **No Direct Domain Mutation:** Superadmin tidak mengubah langsung data RAB, volume pekerjaan, laporan harian, progres fisik, atau Kurva-S.

## 2. Technology Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js + TypeScript | Superadmin web interface |
| Backend | Go | HTTP API, authorization, services, business rules |
| HTTP Router | Chi | Routing dan middleware |
| Database | PostgreSQL | Transactional data dan audit |
| DB Driver | pgx | PostgreSQL connection pool |
| SQL Access | sqlc | Type-safe SQL queries |
| Migration | Goose | Version-controlled schema migrations |
| Session | Opaque server-side session | Authentication |
| Storage | S3-compatible / MinIO | Private generated files |
| Background Processing | Go Worker + PostgreSQL Outbox | Notifications, retries, asynchronous jobs |
| Observability | OpenTelemetry + structured logging | Tracing, metrics, diagnostics |
| API Contract | OpenAPI 3.x | Contract dan client generation |

### Runtime architecture

**Web Superadmin** → **Go HTTP API** → **Authorization Middleware** → **Application Services** → **PostgreSQL**

Komponen pendukung:

- **Go Worker** mengonsumsi outbox dan background jobs dari PostgreSQL.
- **Object Storage** menyimpan dokumen yang memiliki otorisasi akses terpisah.
- **Telegram Integration** ditangani backend untuk webhook, identitas dan notifikasi.
- **Observability** mengumpulkan metadata operasional API dan worker.

Frontend dan Telegram tidak boleh menerapkan business rule yang menjadi sumber kebenaran secara independen dari Go backend.

## 3. Backend Module Architecture

Struktur backend mengikuti modular monolith dan existing domain boundaries.

| Module | Responsibility |
|---|---|
| `identity` | Authentication, session, MFA, account lifecycle |
| `tenancy` | Company, membership, invitation, tenant lifecycle |
| `platform` | Superadmin, platform operations, settings, support access, audit |
| `billing` | Plans, subscription, entitlement, usage limits |
| `notifications` | Invitation delivery dan notification lifecycle |
| `integration` | Telegram dan external integration state |
| `documents` | Global template publication dan document metadata |
| `shared/authz` | Centralized permission evaluation |
| `shared/idempotency` | Deduplication dan retry-safe commands |
| `shared/observability` | Request correlation, tracing dan metrics |

### Go package structure

- `cmd/api/` — API executable.
- `cmd/worker/` — background worker executable.
- `internal/platform/`
  - `domain/` — entities, value objects, domain rules.
  - `app/` — commands, queries dan application services.
  - `ports/` — repository dan integration interfaces.
  - `infra/postgres/` — database implementation.
  - `transport/http/` — HTTP handlers, DTOs dan route registration.
- `internal/identity/` — identity management.
- `internal/tenancy/` — company dan membership management.
- `internal/billing/` — entitlements dan subscriptions.
- `internal/shared/` — shared infrastructure.
- `db/migrations/` — database schema versions.
- `db/queries/` — SQL queries.
- `api/openapi.yaml` — REST API contract.
- `test/integration/` — database/API integration tests.

**Dependency rule:** HTTP handler hanya mengakses application service. Service mengakses repository melalui interface, dan operasi lintas modul dilakukan melalui application service atau read port yang eksplisit. Tidak diperbolehkan query langsung ke tabel domain modul lain dari handler Superadmin.

---

## 4. Functional Requirements

### SA-001 — Platform Authentication

Backend harus menyediakan autentikasi khusus akses platform.

**Requirements:**

- Mendukung autentikasi berdasarkan akun pengguna global.
- Mendukung role platform yang terpisah dari role perusahaan.
- MFA wajib untuk privileged platform account.
- Mendukung WebAuthn/passkeys dan mekanisme pemulihan yang aman.
- Session disimpan server-side menggunakan opaque token yang disimpan dalam bentuk hash.
- Mendukung session expiration, revocation, dan logout seluruh perangkat.
- Setiap request memvalidasi account status dan permission aktif.
- Mendukung rate limiting pada autentikasi.
- Privileged mutation dapat meminta autentikasi ulang atau step-up MFA.

**Security rules:**

- Password tidak boleh disimpan dalam plaintext.
- Password hashing menggunakan Argon2id.
- Browser menggunakan cookie `HttpOnly`, `Secure`, dan konfigurasi `SameSite` yang sesuai.
- Mutasi berbasis cookie wajib memiliki CSRF protection.
- Authenticated account tidak otomatis memiliki akses ke endpoint platform.

### SA-002 — Platform Roles & Permissions

Sistem menggunakan Role-Based Access Control (RBAC) berbasis capability, dengan pemeriksaan context/resource untuk aksi tertentu.

**Platform roles:**

| Role | Authority |
|---|---|
| `platform_superadmin` | Seluruh kemampuan platform yang secara eksplisit diizinkan |
| `platform_operator` | Operasional organisasi dan monitoring sesuai grant |
| `platform_support` | Support requests dan akses bantuan yang disetujui |
| `platform_auditor` | Audit dan compliance metadata secara read-only |

**Permission identifiers:**

- `platform.dashboard.read`
- `platform.company.read`
- `platform.company.create`
- `platform.company.update`
- `platform.company.suspend`
- `platform.company.reactivate`
- `platform.member.read`
- `platform.member.invite`
- `platform.member.revoke`
- `platform.plan.manage`
- `platform.subscription.manage`
- `platform.usage.read`
- `platform.job.read`
- `platform.job.retry`
- `platform.audit.read`
- `platform.settings.manage`
- `platform.template.manage`
- `platform.support.manage`
- `platform.role.manage`

Seluruh permission harus dievaluasi di backend. Role Superadmin tidak boleh otomatis dianggap sebagai membership perusahaan.

### SA-003 — Company / Tenant Management

Superadmin mengelola seluruh organisasi yang menggunakan platform.

**Company attributes:**

- `id`
- `code`
- `name`
- `legal_name`
- `contact_email`
- `phone`
- `address`
- `status`
- `timezone`
- `plan_id`
- `created_at`
- `updated_at`

**Capabilities:**

- Membuat organisasi baru.
- Melihat daftar organisasi dengan search, filter, sort, dan pagination.
- Melihat detail metadata organisasi.
- Mengubah profil organisasi.
- Suspend dan reactivate organisasi.
- Mengarsipkan organisasi melalui kebijakan retensi yang berlaku.
- Melihat jumlah pengguna, proyek, penggunaan storage dan status subscription.
- Melihat riwayat perubahan administratif organisasi.

**Company lifecycle:**

`provisioning → active ↔ suspended → archived`

`archived` merupakan status nonaktif untuk organisasi yang melewati prosedur pengarsipan. Pengarsipan tidak menghapus riwayat proyek secara otomatis.

**Business constraints:**

- `company.code` harus unik.
- Nama perusahaan tidak harus unik.
- Suspensi wajib memiliki alasan.
- Suspensi tidak menghapus data perusahaan maupun proyek.
- Anggota perusahaan suspended tidak dapat mengakses workspace perusahaan tersebut.
- Pengguna yang memiliki membership perusahaan lain tetap dapat mengakses perusahaan lainnya.
- Reaktivasi mengembalikan akses berdasarkan membership dan permission yang masih berlaku.
- Semua perubahan status wajib tercatat dalam audit log.

### SA-004 — Organization Admin Management

Superadmin mengelola administrasi akun pengguna pada tingkat perusahaan tanpa otomatis mengelola konten proyek.

**Capabilities:**

- Melihat daftar administrator perusahaan.
- Membuat invitation untuk administrator.
- Mengirim ulang invitation.
- Mencabut invitation.
- Menonaktifkan membership administrator.
- Mengaktifkan kembali membership sesuai kebijakan.
- Melihat status invitation dan account.
- Meninjau administrative membership history.

**Business constraints:**

- Pengguna global dapat memiliki membership di beberapa perusahaan.
- Membership memiliki `company_id` dan role sendiri.
- Satu pengguna tidak boleh memiliki membership duplikat yang aktif untuk perusahaan yang sama.
- Penonaktifan administrator terakhir ditolak apabila tidak ada administrator aktif lain.
- Invitation memiliki expiry, status, dan token sekali pakai.
- Superadmin tidak dapat membaca atau menetapkan password pengguna.

### SA-005 — Platform Dashboard

Dashboard menampilkan aggregated platform metadata.

**Required metrics:**

- Total organizations.
- Active organizations.
- Suspended organizations.
- Total registered users.
- Active organization memberships.
- Total active projects.
- Subscription distribution.
- Storage consumption.
- Background jobs by status.
- Recent failed jobs.
- Recent administrative activities.
- Integration health status.

**Technical rules:**

- Metrik berasal dari data aktual backend.
- Penghitungan berat dapat menggunakan aggregation/read model.
- Dashboard tidak mengeksekusi query penuh ke seluruh data proyek untuk setiap request.
- Aggregation membedakan total, active, suspended, dan archived.
- Angka pengguna unik tidak boleh tertukar dengan jumlah membership.
- Analytics tidak mengekspos dokumen atau konten rahasia pelanggan.

### SA-006 — Plans, Subscription & Entitlements

Backend menyediakan kontrol subscription perusahaan.

**Capabilities:**

- Mengelola plan definitions.
- Mengatur plan suatu perusahaan.
- Mengelola subscription status.
- Mengatur entitlement atau override yang memiliki alasan.
- Melihat usage terhadap limit.
- Meninjau subscription history.
- Mengelola status trial, grace period, dan read-only sesuai kebijakan.

**Entitlements:**

- `max_projects`
- `max_members`
- `storage_bytes`
- `report_generation_limit`
- `advanced_reporting`
- `telegram_integration`
- `custom_templates`
- `advanced_analytics`

**Technical constraints:**

- Feature availability divalidasi di application service.
- Perubahan entitlement tidak menghapus existing project data.
- Kuota menggunakan penghitungan authoritative dan concurrency-safe.
- Billing provider tidak menjadi sumber permission langsung.
- Event pembayaran yang berulang harus idempotent.
- Status subscription dan entitlement disimpan terpisah dari payment metadata.

### SA-007 — Background Jobs & Operations

Superadmin mengawasi proses asynchronous dari seluruh tenant.

**Monitored operations:**

- Excel/BOQ imports.
- Document generation.
- PDF/XLSX exports.
- Notification dispatch.
- Telegram delivery.
- Report snapshot generation.
- Usage aggregation.
- Integration synchronization.

**Job metadata:**

- Job ID.
- Company ID.
- Job type.
- Status.
- Attempt count.
- Safe error code.
- Created time.
- Started time.
- Finished time.
- Correlation ID.

**Capabilities:**

- Filter jobs berdasarkan tenant, status, dan jenis.
- Melihat failure metadata.
- Melihat retry history.
- Retry job yang dinyatakan aman oleh handler.
- Melihat dead-letter jobs.
- Melihat kesehatan queue/worker.

**Technical constraints:**

- Worker menggunakan lease dan batas retry.
- Setiap job harus mendukung deduplication sesuai jenis operasinya.
- Retry tidak boleh menggandakan laporan, progress ledger, atau publikasi.
- Superadmin tidak otomatis melihat dokumen yang sedang diproses.
- Retry mencatat actor, reason, dan operational outcome.

### SA-008 — Audit & Security Events

Audit log merekam seluruh mutasi administratif yang sensitif.

**Audited events:**

- Authentication dan privileged access events.
- Company creation/update.
- Company suspension/reactivation.
- Admin invitation/revocation.
- Platform role changes.
- Subscription changes.
- Global settings changes.
- Job retry.
- Support access request, approval, access, dan revocation.

**Audit metadata:**

- `event_id`
- `actor_id`
- `actor_type`
- `action`
- `target_type`
- `target_id`
- `company_id`
- `before_state`
- `after_state`
- `reason`
- `request_id`
- `ip_address`
- `occurred_at`
- `outcome`

**Technical constraints:**

- Audit log append-only pada aplikasi.
- Mutasi sukses dan audit event harus berada dalam transaksi konsisten.
- Failed authorization attempts dicatat sebagai security event terpisah.
- Audit tidak menyimpan password, raw session token, access token, atau isi dokumen.
- Query audit menggunakan filter, pagination dan indeks.
- Tidak tersedia endpoint untuk mengedit audit history.
- Retensi dan akses audit mengikuti kebijakan platform.

### SA-009 — Global Configuration

Superadmin mengelola konfigurasi global yang memang berada di tingkat platform.

**Configuration areas:**

- Feature flags.
- Global reporting defaults.
- Integration configuration metadata.
- Notification policies.
- Upload size limits.
- Document generation settings.
- Operational limits.
- Platform maintenance configuration.

**Technical constraints:**

- Secrets disimpan dalam secret manager atau protected environment, bukan nilai konfigurasi yang dibaca dashboard.
- Configuration update wajib tervalidasi.
- Perubahan memiliki audit history.
- Konfigurasi per-tenant tidak boleh diam-diam berubah akibat perubahan setting global apabila tenant memiliki override yang sah.
- Setiap perubahan yang memengaruhi proses berjalan memiliki aturan compatibility.

### SA-010 — Global Report Templates

Template laporan global merupakan aset platform, bukan data progres milik pelanggan.

**Capabilities:**

- Melihat daftar template.
- Membuat revisi template.
- Mengaktifkan atau menonaktifkan revisi.
- Menentukan jenis dokumen yang didukung.
- Melihat penggunaan template berdasarkan metadata.

**Technical constraints:**

- Template dipublikasikan dalam versi immutable.
- Dokumen resmi yang sudah dibuat mempertahankan referensi versi template aslinya.
- Publish template tidak memodifikasi dokumen historis.
- Template menggunakan validasi placeholder dan rendering policy.
- Asset template disimpan secara private.

### SA-011 — Support Access Management

Akses bantuan ke data perusahaan merupakan mekanisme terpisah dari permission Superadmin.

**Access grant requirements:**

- Memiliki target perusahaan yang eksplisit.
- Memiliki scope resource dan aksi.
- Memiliki alasan.
- Memiliki status approval.
- Memiliki waktu mulai dan expiry.
- Dapat dicabut.
- Semua akses dicatat dalam audit.

**Security model:**

- Persetujuan diberikan oleh pihak organisasi yang berwenang.
- Akses support bersifat time-bound dan scope-limited.
- Read-only menjadi default.
- Akses tidak diberikan dengan impersonasi session pelanggan.
- Superadmin tidak dapat mengabaikan approval melalui endpoint biasa.
- Download dokumen memerlukan izin spesifik.

### SA-012 — Platform Integrations Monitoring

Superadmin dapat memonitor keadaan integrasi tanpa mengakses token rahasia atau menggantikan business logic integrasi.

**Capabilities:**

- Telegram webhook health.
- Notification delivery status.
- Integration error metrics.
- Provider synchronization status.
- Configuration metadata.
- Integration event history.

Token Telegram, webhook secrets, dan external credentials tidak boleh dikirim ke frontend.

---

## 5. Data Architecture

PostgreSQL menggunakan shared-database multi-tenancy. Data perusahaan dibatasi dengan `company_id`.

### Core tables

| Table | Key Fields |
|---|---|
| `users` | id, email, status, created_at |
| `sessions` | id, user_id, token_hash, expires_at, revoked_at |
| `platform_role_assignments` | user_id, role, status |
| `companies` | id, code, name, status, plan_id, access_version |
| `company_memberships` | company_id, user_id, role_id, status |
| `company_invitations` | id, company_id, email, token_hash, expires_at, status |
| `plans` | id, code, name, status |
| `plan_entitlements` | plan_id, feature_key, limit_value |
| `subscriptions` | id, company_id, plan_id, status, period_end |
| `company_entitlement_overrides` | company_id, feature_key, value, reason |
| `usage_counters` | company_id, metric_key, period, value |
| `background_jobs` | id, company_id, type, status, attempts |
| `job_attempts` | id, job_id, attempt_number, status, error_code |
| `outbox_events` | id, event_type, payload, published_at |
| `admin_audit_events` | id, actor_id, action, target_id, outcome, occurred_at |
| `support_access_grants` | id, company_id, actor_id, scopes, expires_at, status |
| `global_template_versions` | id, template_id, version, status, object_key |
| `platform_settings` | key, value, version, updated_at |

### Database invariants

1. Seluruh primary key menggunakan UUID.
2. Seluruh tenant-owned table memiliki `company_id`.
3. Project-owned table memiliki `company_id` dan `project_id`.
4. Relasi project memakai composite foreign key agar tidak bisa merujuk project perusahaan lain.
5. Foreign key diberlakukan di database, bukan hanya divalidasi di Go.
6. Unique constraint mencegah duplikasi company code, active membership, dan idempotency records.
7. Partial indexes digunakan untuk active invitations, active jobs dan status queries bila diperlukan.
8. Perubahan status yang sensitif mendukung optimistic versioning atau transactional locking.
9. Audit events tidak boleh diubah melalui aplikasi.
10. Database runtime user tidak boleh menggunakan superuser atau role dengan hak bypass isolasi secara umum.

PostgreSQL Row-Level Security dapat digunakan sebagai perlindungan tambahan, tetapi bukan pengganti pemeriksaan permission pada application service. Jika RLS diaktifkan, transaction-scoped tenant context, connection pooling, ownership, dan bypass privileges wajib ditangani secara eksplisit.

---

## 6. REST API Specification

Base path: `/api/v1/platform`

Seluruh endpoint platform membutuhkan authenticated session dan capability yang sesuai.

### Authentication & context

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/me` | Current operator profile dan capabilities |
| GET | `/sessions` | Active sessions |
| DELETE | `/sessions/{id}` | Revoke session |

Authentication login, logout, MFA, dan account recovery berada di modul `identity`, bukan digandakan pada router platform.

### Dashboard & Organizations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard` | Aggregated platform metrics |
| GET | `/companies` | Paginated company list |
| POST | `/companies` | Create company |
| GET | `/companies/{id}` | Company metadata |
| PATCH | `/companies/{id}` | Update profile |
| POST | `/companies/{id}/suspend` | Suspend company |
| POST | `/companies/{id}/reactivate` | Reactivate company |
| GET | `/companies/{id}/usage` | Company usage |
| GET | `/companies/{id}/members` | Company admins metadata |
| POST | `/companies/{id}/invitations` | Invite administrator |
| POST | `/companies/{id}/invitations/{invitationId}/resend` | Resend invitation |
| DELETE | `/companies/{id}/invitations/{invitationId}` | Revoke invitation |
| PATCH | `/companies/{id}/members/{userId}` | Update admin membership |

### Billing, Jobs & Audit

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/plans` | List plans |
| POST | `/plans` | Create plan |
| PATCH | `/plans/{id}` | Update plan |
| GET | `/companies/{id}/subscription` | Company subscription |
| PATCH | `/companies/{id}/subscription` | Update subscription assignment |
| GET | `/jobs` | Background job list |
| GET | `/jobs/{id}` | Job detail |
| POST | `/jobs/{id}/retry` | Retry eligible job |
| GET | `/audit-events` | Administrative audit history |
| GET | `/integrations/health` | Integration health summary |

### Settings, Templates & Support

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/settings` | Global settings |
| PATCH | `/settings/{key}` | Update validated setting |
| GET | `/templates` | Global template list |
| POST | `/templates/{id}/versions` | Create template revision |
| POST | `/templates/{id}/versions/{version}/publish` | Publish revision |
| GET | `/support-grants` | Support access grants |
| POST | `/support-grants` | Create access request |
| POST | `/support-grants/{id}/revoke` | Revoke grant |
| GET | `/operators` | Platform operator accounts |
| PATCH | `/operators/{id}/roles` | Manage platform roles |

Approval untuk support access dilakukan melalui endpoint berotorisasi milik organisasi, bukan melalui approval diri sendiri dari platform operator.

### API contract conventions

- Request/response menggunakan JSON.
- Semua timestamp menggunakan ISO 8601 dengan timezone.
- Pagination menggunakan cursor untuk dataset besar.
- Input memiliki type validation dan batas ukuran.
- Identifier dan state transition divalidasi server-side.
- API error menggunakan stable machine-readable code.
- Mutating command mendukung `Idempotency-Key` apabila relevan.
- `409 Conflict` digunakan untuk state/version conflict.
- `403 Forbidden` digunakan untuk permission yang tidak dimiliki.
- Tidak mengembalikan internal stack trace atau detail database.

**Sample error codes:**

- `PLATFORM_PERMISSION_DENIED`
- `COMPANY_NOT_FOUND`
- `COMPANY_SUSPENDED`
- `COMPANY_STATUS_CONFLICT`
- `LAST_COMPANY_ADMIN`
- `INVITATION_EXPIRED`
- `ENTITLEMENT_EXCEEDED`
- `JOB_NOT_RETRYABLE`
- `SUPPORT_ACCESS_EXPIRED`
- `VERSION_CONFLICT`
- `IDEMPOTENCY_CONFLICT`

---

## 7. Application Service Rules

### Company provisioning transaction

Ketika membuat organisasi, backend wajib:

1. Memvalidasi permission dan data organisasi.
2. Memastikan kode organisasi unik.
3. Menulis company dan invitation administrator pertama dalam transaksi.
4. Menulis audit event dan outbox event dalam transaksi yang sama.
5. Commit transaksi.
6. Worker memproses pengiriman invitation dari outbox.

Kegagalan email tidak boleh menyebabkan duplikasi perusahaan. Invitation memiliki status pengiriman tersendiri.

### Company suspension transaction

Suspensi wajib melakukan:

1. Memeriksa capability dan status target.
2. Memvalidasi alasan.
3. Mengunci atau memeriksa versi company.
4. Mengubah status ke `suspended`.
5. Menaikkan `access_version`.
6. Menulis audit event.
7. Commit secara atomik.

Authorization request perusahaan wajib mengevaluasi status dan versi akses terkini. Session yang telah diterbitkan tidak dapat digunakan untuk melewati suspensi.

Worker yang memproses pekerjaan tenant harus melakukan pemeriksaan status dan operation policy pada execution boundary. Pekerjaan yang tidak diperbolehkan berjalan selama suspensi harus ditahan secara aman.

### Administrator membership mutation

- Perubahan membership harus dikaitkan dengan company.
- Penonaktifan administrator terakhir wajib ditolak.
- Pemeriksaan administrator terakhir dilakukan dalam transaksi dengan locking yang sesuai agar dua request bersamaan tidak dapat menonaktifkan dua administrator terakhir.
- Pending invitation tidak dihitung sebagai administrator aktif.
- Membership history dipertahankan.

### Safe job retry

- Retry hanya dilakukan pada job type yang mendukungnya.
- Worker menggunakan stable idempotency/source key.
- Running job tidak dapat diduplikasi oleh concurrent retry.
- Riwayat attempts tetap dipertahankan.
- Retry menghasilkan audit event dan correlation ID.

---

## 8. Authorization Architecture

Setiap request menjalani proses berikut:

**Request → Authentication → Session validation → Platform capability evaluation → Resource/context policy → Application Service → Database**

Untuk tenant API:

**Request → Authentication → Company selection → Membership validation → Company status → Project permission → Entitlement → Domain service**

### Mandatory rules

- Platform permission dan company permission merupakan dua namespace berbeda.
- Superadmin tidak memperoleh company membership secara otomatis.
- Tidak ada wildcard authorization yang membuka semua konten pelanggan.
- User-provided `company_id` tidak dianggap bukti permission.
- Setiap resource access memvalidasi relasi dengan company terkait.
- Authorization diperiksa kembali untuk proses worker dan object downloads.
- Support grant harus divalidasi terhadap actor, target, scope, status, dan expiry.
- Deny by default berlaku pada seluruh router dan use case.

---

## 9. Observability & Reliability

### Logging

Structured logs minimal berisi:

- Timestamp.
- Request ID.
- Trace ID.
- Actor ID (jika tersedia).
- Company ID (jika relevan).
- Module dan operation.
- Duration.
- HTTP status / result.
- Safe error code.

Sensitive credentials, private report contents, dan raw token dilarang masuk logs.

### Metrics

- API request rate.
- API error rate dan latency.
- Database connection pool usage.
- Company provisioning failures.
- Invitation delivery failures.
- Queue depth dan outbox lag.
- Job failure/retry rate.
- Subscription synchronization failures.
- Tenant authorization denials.
- Suspicious privileged access attempts.

### Reliability

- Graceful shutdown untuk API dan worker.
- Context cancellation pada database operations.
- Configurable HTTP/database timeouts.
- Bounded retry dengan backoff.
- Dead-letter visibility.
- Database backup dan restore testing.
- Health/readiness endpoints dipisah dari dashboard platform dan tidak mengungkap detail sensitif.

---

## 10. Technical Acceptance Criteria

Spesifikasi Superadmin dianggap terpenuhi ketika perilaku teknis berikut dapat dibuktikan melalui pengujian.

| ID | Verification |
|---|---|
| ARCH-01 | Non-platform user tidak bisa mengakses seluruh endpoint `/platform` |
| ARCH-02 | Privileged session tanpa MFA valid ditolak |
| ARCH-03 | User satu perusahaan tidak bisa membaca resource perusahaan lain |
| ARCH-04 | Superadmin tidak bisa membaca konten RAB/dokumen tenant tanpa support grant |
| ARCH-05 | Company creation bersamaan tidak menghasilkan duplicate code |
| ARCH-06 | Suspended company langsung kehilangan akses workspace |
| ARCH-07 | Suspensi satu company tidak memblokir membership perusahaan lain |
| ARCH-08 | Dua concurrent admin revocations tidak dapat menghapus admin terakhir |
| ARCH-09 | Invitation retries tidak menghasilkan membership duplikat |
| ARCH-10 | Job retry tidak menghasilkan duplicate business effect |
| ARCH-11 | Perubahan subscription langsung memengaruhi entitlement backend sesuai policy |
| ARCH-12 | Support grant expired tidak dapat digunakan |
| ARCH-13 | Administrative mutation sukses menghasilkan audit record konsisten |
| ARCH-14 | Failed operation tidak menghasilkan success audit palsu |
| ARCH-15 | Template revision tidak mengubah dokumen historis |
| ARCH-16 | Semua paginated endpoints memakai deterministic ordering |
| ARCH-17 | Error response tidak mengekspos SQL, secrets, atau internal stack trace |
| ARCH-18 | OpenAPI contract sesuai implementasi HTTP Go |

### Testing requirements

- Go domain unit tests.
- Application service tests.
- PostgreSQL integration tests.
- Negative authorization tests.
- Multi-tenant isolation tests.
- Concurrent transaction/race tests.
- Idempotency tests.
- Worker failure/retry tests.
- Authentication dan MFA tests.
- API contract tests.
- Audit consistency tests.
- Object-access security tests.

---

## 11. Architectural Boundaries

**Superadmin owns:** company lifecycle, global operators, subscription controls, platform policies, operational job visibility, administrative audit, global templates, dan authorization-controlled support access.

**Organization Admin owns:** internal membership, project access, company configuration, dan administrasi data perusahaan berdasarkan permission.

**Project domain owns:** RAB/BoQ, baseline schedule, field reporting, measurement approval, progress ledger, Kurva-S, project documents, actual costs, dan material inventory.

Superadmin dapat melihat metadata operasional lintas perusahaan, tetapi tidak boleh mengubah domain data proyek menggunakan privileged database shortcuts.

Semua akses khusus harus melalui application service yang memiliki kebijakan otorisasi, audit, dan kontrak eksplisit.

**Final architecture decision:** Superadmin merupakan bounded administrative module pada satu Go modular monolith, bukan backend kedua atau microservice tersendiri. PostgreSQL merupakan transactional source of truth; UI, Telegram, dan worker beroperasi melalui aturan domain dan security boundary backend yang sama.