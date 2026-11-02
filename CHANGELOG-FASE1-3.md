# HIMTI API — CHANGELOG Fase 1–3 (Auth Repair)

> **Status: WORKING TREE ONLY — belum commit, belum push, belum PR, belum merge,
> belum deploy.** Dokumen ini ditulis agar induk (dan Wisnu) bisa verifikasi
> mendalam dulu sebelum commit apa pun, sesuai aturan Wisnu.
>
> Branch: `fix/himti-api-auth` · Base: `origin/main` `7307b28` · Worktree:
> `~/workspace/himti-api-exec` (repo `~/workspace/himti-api` checkout `dev`
> TIDAK disentuh).
>
> **Tidak ada nilai rahasia di dokumen ini.** Hanya nama variabel env, nama
> file, dan nama middleware. Jangan pernah menambahkan nilai secret/token/
> password/OTP ke dokumen ini.

## Ringkasan verdict per fase

- **Fase 1 (Critical) — SELESAI (kode).** Refresh token diperbaiki dengan
  kontrak endpoint sama; bypass header dihapus total; `VerifyAdmin` /
  `VerifySuperAdmin` / `verifyRole` diperbaiki; identitas disatukan ke
  `userId` middleware; route telanjang ditutup sesuai matriks Fase 0;
  `POST /initial`, callback Midtrans, seed & scheduling dimatikan; CORS
  dikunci + helmet + rate limit.
- **Fase 2 (High) — SELESAI (kode).** IDOR LMS penuh (sessions, modules,
  assignments, submissions, class-participants, completed-modules/classes,
  certificates, classes update/delete/publish, invite-mentor); default role
  `ADMIN` → `USER`; upload dibatasi + validasi magic bytes; over-fetching
  dipangkas; biometric dimatikan; sertifikat `/file` by-code saja +
  rate limit; sub-acara dibangun sebagai model baru anak Event
  (**PROVISIONAL**, menunggu konfirmasi Wisnu).
- **Fase 3 (Clean) — SELESAI (kode, kecuali yang dicatat di §7).** Kode mati
  & route yatim dihapus; dependensi mati dihapus; storage TIDAK disatukan
  paksa (alasan di §5); pola auth/upload dirapikan; perubahan klien minimal
  disiapkan sebagai working tree di 3 repo klien (tanpa commit/push);
  dokumen ini + catatan README.

## 0. Yang HARUS dilakukan Wisnu SEBELUM merge & SEBELUM deploy (pre-merge checklist)

Ini bukan checklist opsional. Perubahan ini mengubah auth; deploy tanpa
langkah-langkah ini bisa merusak sistem yang sedang berjalan.

1. **Backup database production API dulu.** Sampai 2026-11-02 Wisnu
   menyatakan belum punya backup DB production API. Menulis kode di branch
   tanpa deploy itu aman tanpa backup; **deploy/merge tanpa backup TIDAK
   aman**. Minimal: satu snapshot DB sebelum deploy. Bucket backup berkala
   menjadi gerbang sebelum Fase 3 storage unification (bukan gerbang kode).
2. **Jalankan 2 migrasi Prisma baru ke production SEBELUM deploy**
   (pelajaran My-Kait: skema dulu, baru deploy, karena Vercel auto-deploy
   langsung setelah merge):
   - `20261102_user_role_default_user` — `ALTER TABLE "User" ... SET
     DEFAULT 'USER'` (tidak mengubah baris lama).
   - `20261102_sub_acara` — tabel baru `sub_acara` + FK ke `event`
     (ON DELETE CASCADE). Tanpa ini, semua insert sub-acara gagal.
   Jangan pernah edit migrasi lama `20241110144914_initial_migration`.
3. **Set env var production (nama saja, tanpa nilai di sini):**
   - `CORS_ALLOWED_ORIGINS` — WAJIB di-set persis ke origin 3 klien
     (web utama, CMS, LMS). Tanpa ini, default bawaan kode berlaku
     (lihat §4.7) — dan default itu belum tentu sama dengan origin
     production yang sebenarnya.
   - Pastikan `JWT_SECRET`, `SECRET_KEY`, `JWT_EXPIRES` tetap ter-set
     (lihat §6 — `SECRET_KEY` masih dipakai Fase 1 sebagai input kunci
     turunan refresh; rotasi kunci refresh dedicated adalah Fase 4).
   - `DATABASE_URL` dan kredensial storage S3-compatible tetap seperti
     sebelumnya (tidak ada nama env baru untuk storage).
4. **Verifikasi base URL 3 klien (Gate 1 smoke, masih menggantung).**
   Nilai base URL hidup di env Vercel masing-masing proyek klien, bukan di
   repo, jadi tidak bisa dibuktikan dari kode. Wisnu belum tahu apakah
   ketiganya menunjuk endpoint yang sama atau berbeda. Smoke test tidak
   boleh dianggap lolos sampai ini terjawab (cek manual di dashboard
   Vercel tiap proyek, jawab sama/beda saja — jangan kirim nilainya).
   Konektor Vercel saat dicek 2026-11-02 belum terhubung.
5. **Urutan deploy: API dulu, baru klien.** Klien Fase 3 (hapus header)
   HANYA boleh deploy setelah API baru live — karena API baru menolak
   header, tapi API lama masih membutuhkannya di beberapa jalur. Deploy
   klien duluan = login LMS/CMS rusak. Urutan: (a) migrasi + backup,
   (b) deploy API, (c) smoke API, (d) deploy 3 klien, (e) smoke 3 klien.
6. **Smoke/regression 3 klien (definisi lolos = QA manual Wisnu):**
   - Web: halaman prestasi, acara, anggota publik, dosen publik,
     struktural, prodi-structural, periode, registration-type, dan
     `POST /event-registration` (pendaftaran terbuka) jalan.
   - CMS: login admin, daftar mentor, event-registration, event-meeting,
     notification, user-fcm, histories, dan (setelah konfirmasi desain)
     sub-acara.
   - LMS: login, refresh token (token lama yang beredar harus tetap
     jalan — lihat §1.1), daftar kelas, detail kelas, mentor browsing,
     drawer peserta (kini mentor/admin kelas saja), submit assignment,
     approve/reject submission, completed-modules, generate sertifikat,
     dan `GET /lms/certificates/file?code=...` (by-code).
7. **Rencana rollback:** karena ini working tree + branch, rollback =
   jangan merge; kalau sudah terlanjur deploy, revert deploy Vercel ke
   deployment sebelumnya DAN revert migrasi hanya bila aman (tabel
   `sub_acara` baru tidak dipakai kode lama, jadi aman dibiarkan;
   default role `USER` tidak merusak kode lama). Jangan rollback DB
   dengan restore snapshot tanpa koordinasi — snapshot berisi data
   sebelum deploy, restore akan menghapus data yang masuk setelah deploy.
8. **Konfirmasi yang masih menggantung (lihat §8):** desain sub-acara +
   UI CMS sub-acara, branch produksi CMS/LMS di Vercel, dan keputusan
   storage unification attendances (Cloudinary → S3).

## 1. Fase 1 — Critical

### 1.1 Refresh token (diperbaiki dulu, kontrak endpoint SAMA)

- **File baru `src/utils/auth-tokens.ts`:** `signAccessToken` (kunci JWT
  secret, expiry dari `JWT_EXPIRES`), `signRefreshToken` /
  `verifyRefreshToken` (kunci turunan dari dua nama env yang sudah ada:
  `SECRET_KEY` + `JWT_SECRET`, 7 hari), `verifyAccessToken`,
  `getRefreshSecret`.
- **Temuan kunci (terverifikasi dari kode):** login menandatangani refresh
  token dengan kunci turunan, tapi `refreshTokenService` lama memverifikasi
  pakai JWT secret saja DAN membuang hasil callback `verify()` — sehingga
  token apa pun yang payload-nya membawa id user yang masih ada akan
  menghasilkan pasangan token baru. Itu yang diperbaiki.
- **`src/app/authentication/auth.service.ts` — `refreshTokenService` baru:**
  verifikasi SINKRON terhadap kunci turunan yang sama (agar refresh token
  LMS yang sudah beredar tetap jalan), token kosong → 401, `TokenExpiredError`
  → 401 expired, verifikasi gagal lain → 401 invalid, id kosong → 401,
  user harus masih ada, lalu terbitkan access + refresh baru dengan kunci
  turunan yang sama. **Kunci refresh TIDAK diganti di Fase 1** — kunci
  refresh dedicated baru + paksa login ulang adalah Fase 4.
- `loginService` dan token biometric (kini unreachable, §2.5) memakai helper
  yang sama.
- **PERUBAHAN PERILAKU — WAJIB DICEK:** `loginAdminService` dulu
  menandatangani dengan expiry hardcode 3 hari; kini memakai
  `signAccessToken` (expiry dari `JWT_EXPIRES`). Kalau `JWT_EXPIRES`
  production bukan 3 hari, masa berlaku token admin berubah. Verifikasi
  nilai `JWT_EXPIRES` production sebelum deploy (cek nama + durasi saja,
  jangan kirim nilainya ke chat).
- **Rate limit auth** (`src/app/authentication/auth.route.ts`):
  login/register/admin-login/forgot-password 30/15 menit/IP; refresh
  100/15 menit/IP; limiter OTP lama 3/15 menit dipertahankan.

### 1.2 Bypass header dihapus total

- **`src/middleware/verify-token.ts` ditulis ulang:** `verifyToken` hanya
  JWT — verifikasi sinkron, expired → 401 expired, invalid → 401 invalid,
  user harus ada, `req.userId` hanya dari payload terverifikasi. Tidak ada
  penerimaan header, tidak ada log debug.
- **`decodeToken` DIHAPUS.** Tambahan baru: `optionalAuth` untuk route
  katalog publik — tanpa token = anonim; token ada tapi invalid/expired
  = 401 (token palsu tidak bisa memalsukan visibilitas).
- **`src/middleware/verify-key.ts` DIHAPUS** (auth khusus header).
  Setelah ini, header rahasia TIDAK lagi diterima API sebagai auth.
  Sisa penyebutan nama env header di kode hanya: pemetaan env di
  `src/libs/index.ts` (termasuk input derivasi refresh Fase 1 — itu bukan
  auth request), secret storage AWS/S3 (hal berbeda), dan satu komentar
  penjelas di route mentor.
- **Log debug yang mencetak header/secret/token/OTP dihapus:**
  log debug `verifyToken`, log token/decode super-admin, log OTP di
  `requestOtpService`. Sisa `console.log(errors)` di
  `src/middleware/validate-request.ts` hanya mencetak error validasi,
  bukan secret — dibiarkan, dicatat di sini agar audit berikutnya tidak
  mengira terlewat.

### 1.3 VerifyAdmin / VerifySuperAdmin / verifyRole diperbaiki

- **`src/middleware/verify-admin.ts` ditulis ulang:** role DAN keberadaan
  user dicek di jalur SUKSES verify (bug lama: role hanya dicek di cabang
  error). Lolos: `ADMIN` dan `SUPER_ADMIN`. Keputusan yang didokumentasikan:
  login admin CMS menerbitkan kedua role; memblokir `SUPER_ADMIN` dari
  route admin akan mengunci admin utama. Bukan admin → 403.
- **`src/middleware/verify-super-admin.ts` ditulis ulang:** hanya
  `SUPER_ADMIN` yang masih ada yang lolos; log token/payload lama dihapus.
- **`verifyRole` diperbaiki:** lolos jika `user.role` ada di daftar yang
  diminta, ATAU (daftar memuat `MENTOR` dan user punya record mentor —
  lalu `mentorId` di-set). Kebocoran lama ("role apa pun lolos asal daftar
  memuat MENTOR") hilang.
- **`src/middleware/verify-token-without-exp.ts` ditulis ulang (khusus
  logout):** signature HARUS terverifikasi; expiry diwaiver (jsonwebtoken
  hanya melaporkan `TokenExpiredError` untuk token yang signature-nya
  valid, jadi payload expired yang dibaca untuk logout itu asli). Token
  palsu ditolak. Tidak ada penerimaan header.

### 1.4 Identitas disatukan

- `src/app/profile/profile.service.ts`: `getProfileService(userId)` dan
  `updatePasswordService(userId, …)` memakai userId terverifikasi;
  `decode()` token mentah dihapus.
- `src/app/profile/profile.controller.ts`: `getProfileController` dan
  `updatePasswordController` memakai `req.userId`.
- `src/app/authentication/auth.service.ts`: `logoutService(userId)` memakai
  userId dari `VerifyTokenWithoutExp`; `logoutController` meneruskan
  `req.userId`.
- Tidak ada lagi pemanggilan `decode()` di jalur auth/profile/middleware
  kecuali komentar yang menjelaskan penghapusannya (terverifikasi via grep,
  §9).

### 1.5 Route telanjang ditutup (matriks Fase 0 §2, §6)

Klasifikasi yang dipakai: publik baca = prestasi, acara, dosen publik,
anggota publik, generations, struktural, prodi-structural, periode,
registration-type, business merchandise/service, contact-info, version,
katalog kelas LMS; tulis = admin, kecuali `POST /event-registration`
(tetap publik untuk pendaftaran terbuka + rate limit + validasi) dan auth
dasar (login/register/OTP/forgot). `GET /points/member` Fase 1 = JWT
(bukan publik).

Per file route (semua perubahan ini working tree, belum commit):

- `attendances` — `POST /:meetingId` → `VerifyAdmin`. (Catatan: edit Fase 1
  sempat menduplikasi import `VerifyAdmin` di file ini; sudah diperbaiki
  dan terverifikasi tsc bersih, §9.)
- `business` — POST → `VerifyAdmin` (termasuk varian `validateRequest`
  yang sempat terlewat lalu diperbaiki).
- `event` (acara) — tulis → `VerifyAdmin`.
- `event-meeting` — tulis (POST/PUT/DELETE) → `VerifyAdmin`; baca tetap
  `verifyToken` via `use`.
- `history` — `GET /` → `VerifyAdmin`.
- `lecturers` — tulis → `VerifyAdmin`; `GET /public` dan `GET /` tetap
  publik sesuai dokumentasi.
- `members` — PUT/DELETE/export/`/:id` → `VerifyAdmin`; `GET /generations`,
  `/public`, `/` tetap publik.
- `notification` — POST → `VerifyAdmin` (termasuk varian `validateRequest`
  yang sempat terlewat lalu diperbaiki); GET dan tandai-baca tetap
  `verifyToken` (notifikasi milik sendiri).
- `point` — `GET /member` → `verifyToken`.
- `potential-users` — GET/POST/PUT/parse-cv → `VerifyAdmin`.
- `registration-type` — tulis → `VerifyAdmin`; GET tetap publik (web
  registrasi).
- `user-fcm` — GET/DELETE → `VerifyAdmin`.
- `generations` — tulis → `VerifyAdmin`.
- `struktural` — tulis → `VerifyAdmin`, dan `GET /` + `/:structuralId`
  dijadikan publik. Ini satu-satunya bacaan web yang dulu bergantung pada
  header; tanpa perubahan ini halaman struktural web akan rusak setelah
  header dihapus.
- `event-registration` — ditulis ulang: `POST /` tetap publik (pendaftaran
  terbuka) dengan limiter baru 30/10 menit + upload; semua route lain
  (list, by-type, by-id, PUT, DELETE, export-absensi, import member) →
  `VerifyAdmin`.
- `lms/course` — evaluate yang tadinya sepenuhnya tanpa auth → `verifyToken`
  (cek enrolment ada di Fase 2).
- `meetings` — `POST /` → `VerifySuperAdmin` (konsisten dengan PUT/DELETE
  yang sudah super-admin).
- `lms/assignment` — create/update/delete → `verifyRole([MENTOR,
  SUPER_ADMIN, ADMIN])` + `verifyToken`; submit tetap `verifyToken`
  (alurnya peserta; cek enrolment di Fase 2).
- `lms/sessions` — DELETE → `verifyRole([MENTOR, SUPER_ADMIN, ADMIN])`.
- `lms/classes` — `GET /` dan `GET /:classId` memakai `optionalAuth`;
  `GET /user` memakai `verifyToken`; sisanya `verifyToken` via `use`.
  Handler kustom lama yang percaya decode tak terverifikasi + header
  secret dihapus. Kelas publik (tanpa userId) hanya mengembalikan kelas
  published; user terautentikasi mendapat visibilitas mentor/peserta/
  creator (logika service lama dipertahankan).
- `lms/mentor` — `GET /` dari `verifyKey` → `verifyToken` (user
  terautentikasi apa pun, agar MentorGrid LMS dan daftar mentor CMS tidak
  rusak; gate admin-only akan merusak browsing mentor LMS). Tulis tetap
  `verifyRole` admin/super.
- Route `GET /user/admin` diketahui MATI (didefinisikan setelah
  `GET /:userId` sehingga ter-shadow) dan tidak ada klien yang memanggilnya;
  pembuatan admin CMS memakai `POST /auth/register`, bukan route ini.
  TIDAK dibuatkan endpoint `POST /user/admin` baru; route mati ini kandidat
  cleanup Fase 3 (tetap dibiarkan di Fase 1–2 agar diff minimal, dan
  diperbaiki implisitnya lewat `createUserService`, §2.2).

### 1.6 Yang dimatikan di Fase 1 (jalur HTTP dihapus)

- **`POST /initial`:** mount dihapus dari `src/routes/index.ts` dan
  `src/app/initial/initial.route.ts` dihapus. File controller/service
  sempat tertinggal sebagai dead code, lalu dihapus di Fase 3 (§3).
  Logika tetap ada di histori git commit base `7307b28`.
- **Callback Midtrans** (`src/app/lms/transactions/transactions.route.ts`):
  diganti stub 410 ("Payment callback is disabled"). Service/controller
  lama tidak terjangkau sampai cleanup Fase 3. Aktifkan lagi hanya dengan
  verifikasi signature sebagai keputusan sadar. Catatan: sisi PEMBUATAN
  transaksi Midtrans di alur join kelas berbayar (`classes.service.ts`)
  SENGAJA dipertahankan — yang dimatikan hanya callback-nya (Q10:
  "belum dipakai" merujuk callback; join berbayar masih memakai pembuatan
  transaksi). Penghapusan total Midtrans butuh keputusan produk terpisah.
- **Seed + scheduling:** `POST /seed-generation-2022` beserta helper-nya
  (`randInt`, helper koordinat/waktu/pick, koordinat dasar, alamat tetap)
  dihapus dari `src/routes/index.ts`; mount `/initial` dan
  `/scheduling-notification-meeting` + import-nya dihapus; import tak
  terpakai (`prisma`, `dayjs`, `ErrorApp`, `environment`) dibersihkan.
  Logika seed TIDAK dipertahankan sebagai script runnable — itu script
  one-off historis generasi 2022/2023 yang menulis attendance + point
  produksi dengan koordinat buatan, dan mempertahankannya runnable adalah
  risikonya sendiri. Logikanya tetap di histori git base `7307b28`.
  File `src/app/scheduling/scheduling-meeting.ts` (termasuk cron
  test-notification-nya) sempat tertinggal unmounted, lalu dihapus di
  Fase 3 (§3).

### 1.7 CORS, helmet, rate limit

- **`src/index.ts` ditulis ulang:** `helmet()` ditambahkan (paket `helmet`
  ditambahkan ke `package.json` + lock, §3 — sebelumnya di-import tapi
  belum ada di dependensi).
- CORS dari `origin: true` (origin apa pun + credentials) menjadi allowlist.
  Default: `https://himtiumt.org`, `https://www.himtiumt.org`,
  `https://cms.himtiumt.org`, `https://lms.himtiumt.org`. Env
  `CORS_ALLOWED_ORIGINS` (comma-separated) MENGGANTIKAN default sepenuhnya
  bila di-set — env ini WAJIB di-set di production persis ke origin 3
  klien (lihat checklist §0). Tidak ada localhost di default; dev lokal
  harus set env var.
- `X-Api-Key` dihapus dari allowed headers; `X-Encrypted-Data` /
  `X-Encryption-IV` dipertahankan sementara (header biometrik — dibersihkan
  saat biometric dimatikan Fase 2, tapi header-nya sendiri tidak lagi
  memberi auth apa pun setelah route biometric jadi 410).
- Blok schedule test FCM lama yang terkomentar dihapus; job log scheduler
  per-menit dipertahankan di Fase 1, lalu dihapus di Fase 3 (§3).

## 2. Fase 2 — High

Helper baru **`src/utils/lms-access.ts`** (dipakai semua item di bawah):
`isAdminRole` (ADMIN/SUPER_ADMIN), `isClassMentor` (creator atau baris
`classMentor`), `isClassParticipant`, `canAccessClass`
(admin/mentor/peserta), `canManageClass` (admin/mentor saja — peserta
TIDAK lolos), `requireClassAccess` / `requireClassManage`
(mengembalikan `ErrorApp` 403 atau null, tanpa throw), dan resolver
`classIdFromSession`, `classIdFromModule`, `classIdFromAssignment`,
`classIdFromSubmission` (model Prisma `class`, `classMentor`,
`classParticipant`, `session`, `module`, `assignment`, `submission`).
Kunci pesan yang dipakai sudah terverifikasi ada:
`MESSAGES.ERROR.NOT_FOUND.CLASS`, `MESSAGES.ERROR.FORBIDDEN.ROLE`.
Import client Prisma: `prisma` dari `src/config/index.ts`.

### 2.1 IDOR LMS (peserta hanya kelasnya sendiri, mentor hanya kelasnya sendiri)

- **Sessions** (`sessions.service.ts` + `sessions.controller.ts`): create
  butuh manage di kelas session; update/delete butuh manage di kelas
  session-nya; get-by-class butuh access di kelas itu;
  `getSessionService(sessionId, userId?)` butuh access bila userId ada.
  Controller `getSessionController` kini memakai `RequestWithAccessToken`
  dan meneruskan userId.
- **Modules** (`modules.service.ts`): create butuh manage di kelas session
  (via `classIdFromSession` — catatan: `getSessionById` repository hanya
  mengembalikan `{id, name}`, jadi classId TIDAK boleh dibaca dari objek
  session itu; resolver dipakai eksplisit); get-by-session butuh access;
  get-detail butuh access; delete dari cek creator/mentor-saja menjadi
  manage (menambah bypass admin, perilaku creator/mentor sama). Import
  mentor yang tak terpakai dibersihkan.
- **Assignments** (`assignment.service.ts`): create/update/delete dari cek
  creator/mentor-saja menjadi manage (menambah admin). Get-by-id: butuh
  access kelas, DAN visibilitas submission dipangkas — non-manager hanya
  melihat submission-nya sendiri (temuan: sebelumnya user terautentikasi
  mana pun bisa membaca assignment mana pun BESERTA histori/file submission
  semua peserta dari assignment itu). Submit: pemanggil harus peserta/
  staff kelas (controller sudah memakai `req.userId` sebagai `submittedBy`,
  jadi tidak ada submit atas nama orang lain via body).
- **Submissions** (`submission.service.ts` + `submission.controller.ts`):
  get-by-id butuh userId — owner boleh baca miliknya, manager boleh baca
  semua submission kelasnya, peserta lain 403 (cek access saja tidak
  cukup: peserta mana pun di kelas itu tadinya bisa membaca submission
  siapa pun); get-by-assignment hanya manager; approve/reject dari cek
  creator/mentor-saja menjadi manage (menambah admin). Controller kini
  meneruskan userId ke kedua get. Perhatian: draf pertama logika
  get-by-id sempat terbalik (nilai kembali `requireClassManage` adalah
  null bila lolos, bukan boolean) — ketahuan saat review sendiri sebelum
  tsc, diperbaiki menjadi `canManageClass` boolean + tes tsc.
- **Class-participants** (`class-participants.service.ts` +
  `class-participants.controller.ts`):
  - POST self-enrol: tadinya melewati seluruh gerbang join flow
    (kelas unpublished dan kelas berbayar bisa diikuti langsung).
    Kini: kelas harus `PUBLISH`, harga harus 0 (kelas berbayar WAJIB
    lewat join flow; pesan baru `MESSAGES.ERROR.INVALID.PAID_CLASS_JOIN_FLOW`),
    dan duplikat ditolak (`ALREADY_JOIN_CLASS`). Endpoint ini tidak
    dipakai klien mana pun yang ditemukan — jadi pembatasan ini aman.
  - GET `/:classId` dan GET `/participant/:classId`: butuh manage kelas.
    Yang kedua penting: drawer peserta LMS memanggil route ini dengan
    `verifyToken` saja, jadi sebelumnya user terautentikasi mana pun bisa
    mendaftar nama/email/foto peserta kelas mana pun. Controller kini
    memakai `RequestWithAccessToken` dan meneruskan userId.
- **Completed-modules / completed-classes:** userId sudah dari token
  (tidak ada tulis atas nama orang lain), tapi tidak ada cek enrolment —
  siapa pun bisa menandai modul/kelas apa pun selesai untuk dirinya dan
  menggelembungkan persentase penyelesaian yang dipakai sertifikat. Kini
  butuh access kelas (via `classIdFromModule` untuk modul).
- **Certificates** (`certificates.service.ts` + controller + route):
  - generate: butuh access kelas; PLUS guard kelas kosong — matematika lama
    `0/0 = NaN`, dan `NaN < 100` bernilai false, jadi kelas dengan NOL
    modul sebelumnya LOLOS dan menerbitkan sertifikat untuk apa pun.
    Kini `total.module === 0` → 400 "Class not completed".
  - daftar (`GET /lms/certificates`): repository SUDAH memfilter berdasarkan
    userId bila diberikan, dan controller sudah meneruskan userId — tidak
    rusak, tidak diubah perilakunya.
  - `/file`: dari by-id ATAU by-code, publik, include user penuh — menjadi
    **by-code saja** + rate limit 60/10 menit/IP + select eksplisit
    (`code`, `createdAt`, `user.name`, `class.name`,
    `class.user.name`). Alasan: by-id bisa dienumerasi untuk mengunduh
    sertifikat mahasiswa lain; code adalah token verifikasi tak-tertebak
    yang tercetak di sertifikat itu sendiri, jadi endpoint tetap publik
    untuk verifikasi. Halaman web S-02 bukan scope repo ini.
- **Classes** (`classes.service.ts` + `classes.controller.ts`):
  - update: SEBELUMNYA TANPA CEK KEPEMILIKAN SAMA SEKALI — user
    terautentikasi mana pun bisa menulis ulang kelas mana pun. Kini butuh
    manage (creator/mentor/admin); controller meneruskan userId dan log
    debug `console.log({file})` dihapus.
  - delete: dari creator-only menjadi manage.
  - publish: dari creator-only menjadi creator ATAU admin (bypass khusus
    admin, BUKAN manage umum — mentor non-creator tetap tidak bisa
    mem-publish kelas orang lain; draf pertama sempat memakai manage
    umum lalu dikoreksi karena melanggar prerogatif creator ini).
  - invite-mentor (`class-mentor.service.ts`): sebelumnya user
    terautentikasi mana pun bisa menempelkan mentor ke kelas mana pun.
    Kini butuh manage kelas.
  - `GET /mentor/:classId` (daftar nama mentor kelas) dibiarkan — data
    direktori, sensitivitas rendah.
  - Route PUT kelas sudah punya `verifyRole` mentor/admin/super, tapi
    cabang MENTOR di `verifyRole` lama tidak spesifik-kelas — karena itu
    cek manage di service-lah yang menutup celah ini, bukan route-nya.

### 2.2 Role default & createUser

- `prisma/schema.prisma`: `User.role @default(ADMIN)` → `@default(USER)`,
  plus migrasi baru `20261102_user_role_default_user` (hanya mengubah
  default baris baru; baris lama tidak diubah).
- `src/app/user/user.service.ts` — `createUserService(body, callerRole?)`:
  sebelumnya SELALU memaksa `ADMIN` apa pun yang diminta. Kini: pemanggil
  `SUPER_ADMIN` boleh menetapkan role apa pun yang diminta; pemanggil
  `ADMIN` hanya boleh membuat akun `USER` (tidak bisa mencetak admin
  baru); default `USER`. `createUserController` meneruskan role pemanggil
  (dibaca dari userId token). Catatan: satu-satunya jalur HTTP service ini
  adalah route `GET /user/admin` yang mati (ter-shadow, §1.5) — jadi ini
  defence in depth untuk saat urutan route diperbaiki di Fase 3; alur
  register publik sudah eksplisit memakai role `USER` dan tidak terpengaruh
  default Prisma.
- Perilaku lain yang TIDAK diubah: `updateUserRoleService` tetap
  super-admin-only (sudah benar di route).

### 2.3 Proteksi upload

- `src/utils/upload-file-to-storage.ts`:
  - `MULTER_LIMITS` baru: 10 MB per file, maks 5 file — diterapkan pada
    instance multer PUSAT (`upload`) dan pada config `attendances`,
    `event`, `struktural`. Limit multer ditegakkan SAAT request mengalir
    masuk, yaitu SEBELUM buffering penuh di memory (sebelumnya tidak ada
    limit yang jelas di mana pun).
  - `validateMagicBytes(buffer, fileName)` baru + tabel signature:
    PNG, JPG/JPEG, WEBP (RIFF…WEBP), PDF, ZIP, ZIP-container
    (docx/pptx/odt/odp/key/pages), RAR, OLE (doc/ppt). Ekstensi/mime dari
    klien tidak dipercaya: script yang di-rename jadi `.png` sebelumnya
    lolos filter ekstensi.
  - `UploadFileToStorage` kini MEMERIKSA magic bytes terhadap ekstensi
    Key SEBELUM menyimpan ke S3, dan MELEMPAR `ErrorApp` 400 bila tidak
    cocok (bukan mengembalikan objek error yang bisa diabaikan pemanggil —
    sebagian besar pemanggil tidak memeriksa return value, jadi throw
    adalah satu-satunya cara yang menghentikan penulisan DB sesudahnya).
    Hanya berlaku bila `Body` berupa Buffer; semua 20 pemanggil yang
    ditemukan mengunggah file user (buffer atau hasil sharp → webp,
    yang cocok dengan signature webp).
  - Batasan jujur: config Cloudinary `event`/`struktural` ternyata TIDAK
    di-import di mana pun (dead code, dihapus Fase 3) — jadi jalur live
    sudah tercakup multer pusat + S3. Jalur attendances memakai storage
    Cloudinary (streaming, bukan via `UploadFileToStorage`), sehingga
    validasi magic bytes TIDAK mencakup file attendances — hanya limit
    multer-nya yang ditambahkan. Unifikasi attendances ke S3 dicatat
    sebagai keputusan lanjutan (§8), bukan dilakukan diam-diam.
- Filter ekstensi lama di `MulterFileFilter` dipertahankan sebagai lapis
  pertama (plus log debug nama/mime di filter itu bukan secret — dibiarkan).

### 2.4 Over-fetching

Prinsip: select eksplisit; hash password tidak pernah dimuat kecuali
login; tidak ada include user penuh di endpoint publik.

- `certificates/file`: select eksplisit (§2.1).
- `members.repository.ts` — `getAllMember`: `User: true` → select
  `{email, photo}` saja (hanya itu yang dipakai mapper + export Excel).
  Mapper sebelumnya SUDAH memangkas hash dari respons — yang diperbaiki
  adalah pemuatan baris penuh di query.
- `history.repository.ts`: `user: true` → select
  `{id, name, email, photo, role}` (yang dipakai mapper); interface
  `HistoryData` dipersempit menjadi `Pick<…>` yang sama.
- `assignment.repository.ts` (detail): `class.user` → select
  `{id, name, photo}` (yang dipakai service).
- `submission.repository.ts`: `class.user` → select `{id, name}` (yang
  dipakai mapper).
- `class-mentor.repository.ts`: `user: true` → select
  `{id, name, email, photo}`; interface `ClassMentorData` dipersempit.
- `classes.repository.ts` (3 lokasi): `user: true` → select
  `{id, name, email, photo}` (yang dipakai mapper).
- `mentor.repository.ts` (2 lokasi): `user: true` → select
  `{id, name, email, photo}`; interface `MentorData` dipersempit.
- `sessions.repository.ts` (`getDetailSession`): `class.user` → select
  `{id, name}` (yang dipakai mapper).
- Setelah perubahan ini, tidak ada lagi `user: true` di kode `src/app`
  (terverifikasi via grep). Sisa pemuatan baris user penuh hanyalah
  profil milik sendiri dan login (legitimate — login memang butuh hash
  untuk `bcrypt.compare`).
- Penggunaan token FCM internal (pengiriman notifikasi admin-only) tidak
  diubah: token dipakai untuk mengirim, bukan dikembalikan di respons.

### 2.5 Biometrik dimatikan

- `src/app/authentication/auth.route.ts`: `POST /auth/biometric` diganti
  stub 410 ("Biometric login is disabled"). Alasan: endpoint ini
  menerbitkan token hanya dari email yang didekripsi, tanpa password atau
  faktor kedua, dan belum ada keputusan faktor kedua. Service + controller
  (`biometricAuthService` / `loginWithEncrypt`) tetap ada di kode tapi
  tidak terjangkau HTTP; aktifkan lagi hanya dengan faktor kedua nyata
  sebagai keputusan sadar. Import `loginWithEncrypt` yang tak terpakai di
  route dibersihkan.
- Header `X-Encrypted-Data` / `X-Encryption-IV` masih diizinkan CORS
  (tidak memberi auth apa pun setelah ini) — dibersihkan penuh saat
  biometric dihapus permanen atau diaktifkan kembali dengan benar.

### 2.6 Sub-acara — API baru (PROVISIONAL, menunggu konfirmasi Wisnu)

- **Kenapa model baru:** CMS memanggil `/sub-acara`, API tidak punya
  tabelnya. Pemetaan paksa ke `Meeting` salah: `Meeting` terikat
  `EventMeeting` (bukan `Event`) dan tidak punya image/isOpenAbsen.
- **Skema** (`prisma/schema.prisma`): model `SubAcara` anak dari `Event` —
  field persis sesuai tugas: `name`, `description`, `image`, `startTime`,
  `endTime`, `isOpenAbsen`, `eventId` (+ `id`, `createdAt`, `updatedAt`),
  relasi `Event` dengan `onDelete: Cascade`, `@@map("sub_acara")`,
  index `eventId`. `Event` mendapat relasi balik `SubAcara[]`.
- **Migrasi baru** `prisma/migrations/20261102_sub_acara/migration.sql`
  (tabel + index + FK). WAJIB jalan ke production SEBELUM deploy (§0).
- **Modul baru `src/app/sub-acara/`:** `sub-acara.dto.ts`,
  `sub-acara.repository.ts`, `sub-acara.service.ts`,
  `sub-acara.controller.ts`, `sub-acara.route.ts`,
  `sub-acara.request.ts` (Joi). Mount: `route.use("/sub-acara",
  subAcaraRoute)` di `src/routes/index.ts` (di sebelah `/acara`).
- **Kontrak route:** `GET /` (filter `eventId` + `search`, pagination,
  publik seperti bacaan acara) dan `GET /:id` (publik); `POST /`, `PUT
  /:id`, `DELETE /:id` → `VerifyAdmin` dengan upload `image` via multer
  pusat (jadi kena limit + magic bytes). Service: parent event harus ada
  dan tidak soft-deleted (`getEventById` memfilter `deletedAt: null`);
  update ke eventId lain memvalidasi parent baru; delete menghapus file
  image dari storage. Kunci pesan memakai `SUB_ACARA` yang ternyata sudah
  ada di `src/utils/messages.ts` (bukti sub-acara pernah direncanakan).
- **Folder storage baru:** `BUCKET_FOLDER.subAcara = "sub-acara"`.
- **Yang TIDAK dilakukan:** UI CMS TIDAK diubah (repo terpisah, di luar
  scope ini). Apakah UI CMS sub-acara (saat ini terkomentar di
  FormAdd/FormEdit/Detail/List SubAcara) diaktifkan kembali atau API-only
  dulu — menunggu keputusan Wisnu (§8). Desain "anak Event" ini sendiri
  masih PROVISIONAL sampai Wisnu mengonfirmasi.

## 3. Fase 3 — Clean repo API

### 3.1 Kode mati & route yatim yang DIHAPUS (semua terverifikasi tidak di-import)

- `src/app/ticket-support/` (7 file): route tidak pernah di-mount
  (satu-satunya referensi adalah kunci `BUCKET_FOLDER.ticketSupport`).
  Model Prisma `TicketSuport` + relasi `User` DIBIARKAN (menghapus model
  butuh migrasi — dicatat di §8, bukan dilakukan diam-diam).
- `src/app/scheduling/scheduling-meeting.ts`: unmounted, tidak di-import
  (termasuk cron test-notification-nya).
- `src/app/initial/initial.controller.ts` + `initial.service.ts`:
  route-nya sudah dihapus Fase 1; file-file ini sisa dead code. Direktori
  `src/app/initial/` kini kosong dan ikut dihapus. (Service ini memuat
  artefak kredensial default lama — penghapusannya juga menghilangkan
  artefak itu dari tree; nilainya TIDAK ditulis di dokumen ini.)
- `src/app/event/event.config.ts` + `src/app/struktural/struktural.config.ts`:
  config Cloudinary yang tidak di-import di mana pun (jalur live memakai
  multer pusat). Batasan §2.3 soal attendances tetap berlaku.
- `src/utils/redis.ts`: tidak di-import file mana pun (client Redis +
  `REDIS_KEY` + `RedisFunction` tidak terpakai). Bersamaan dengan ini,
  dependensi `redis` dihapus (§3.2).
- `GET /generate` di `src/routes/index.ts` (generator ZIP sertifikat
  seminar dengan array `names` kosong — selalu menghasilkan ZIP kosong)
  beserta import `canvas`/`pdfkit`/`archiver`/`Stream`/`path` di file itu.
  Dependensi `canvas`/`pdfkit`/`archiver` TETAP dipertahankan karena
  `src/app/event/event.utils.ts` (`generateMultipleCertificate`, dipakai
  `attendances.service.ts`) masih memakainya — itu jalur live.
- `GET /scheduler` di `src/routes/index.ts` DIBIARKAN (endpoint log
  sepele, bukan yatim yang ditugaskan).
- Job scheduler per-menit di `src/index.ts` yang hanya mencetak log
  ("log scheduler himti api") DIHAPUS beserta import `node-schedule`.
  Dependensi `node-schedule` + `@types/node-schedule` ikut dihapus (§3.2).
- `GET /user/admin` yang mati (§1.5) DIBIARKAN di Fase 3 ini — perbaikan
  urutan route adalah perubahan perilaku routing yang butuh uji regresi
  CMS terpisah; dicatat sebagai follow-up, bukan diubah diam-diam.

### 3.2 Dependensi (package.json / lockfiles)

- **Ditambahkan:** `helmet@^8.3.0` (sebelumnya di-import di `src/index.ts`
  tapi tidak ada di dependensi — build akan gagal tanpanya). Masuk
  `package.json` + `package-lock.json` via `npm install helmet`, dan
  entri `helmet@^8.3.0` ditambahkan ke `yarn.lock` (helmet tanpa
  dependensi, integrity disalin dari hasil install npm yang terverifikasi).
  Catatan jujur: entri yarn.lock itu ditulis tangan karena `yarn` tidak
  tersedia di container ini — konfirmasi dengan `yarn install` sungguhan
  sebelum merge (§8).
- **Dihapus** (terverifikasi nol pemakaian di `src/`, file root, dan
  `scripts/`, lalu tsc diulang dan tetap 0 error):
  `ioredis`, `item-store-redis`, `mongoose` (hanya import terkomentar),
  `discord.js`, `googleapis`, `firebase-functions`, `vercel`,
  `global`, `@vercel/blob`, `qrcode`, `node-schedule`,
  `@types/node-schedule`, `redis`, `node-cron`, `@types/node-cron`.
  Total ±230 paket (termasuk transitif) terhapus dari lockfiles.
- **Dipertahankan dengan sengaja (jangan dihapus di cleanup berikutnya
  tanpa cek ulang):** `cloudinary` + `multer-storage-cloudinary`
  (attendances live), `canvas`/`pdfkit`/`archiver` (event.utils live),
  `firebase`/`firebase-admin` (notifikasi live), `exceljs` (export member
  live), `docx-templates` + `libreoffice-convert` (event-registration
  live), `midtrans` (pembuatan transaksi join kelas berbayar live —
  hanya callback-nya yang dimatikan), `sharp` (thumbnail kelas/event),
  `dayjs`/`moment` (dipakai di service lain; `dayjs` hanya dibersihkan
  dari import `routes/index.ts`).
- **Churn lockfile yang perlu diketahui reviewer:** `npm install` di
  container ini juga menyinkronkan `yarn.lock` (entri platform sharp
  berubah dari win32 ke linux — itu cerminan install Linux, bukan
  perubahan fungsional). Kalau reviewer memakai Windows, jalankan
  `yarn install` ulang untuk mengembalikan entri platform yang sesuai;
  jangan mengira itu perubahan dependensi.

### 3.3 Storage — TIDAK disatukan paksa (keputusan yang didokumentasikan)

Tugas meminta "satukan storage ke S3-compatible". Realitanya: SEMUA
upload kecuali attendances SUDAH lewat `UploadFileToStorage` (S3).
Satu-satunya yang tersisa di Cloudinary adalah upload image attendances
(`attendances.config.ts` → `CloudinaryStorage`). Memindahkan attendances
ke S3 akan mengubah URL image absensi yang sudah tersimpan/tercetak di
klien — itu migrasi data, bukan sekadar ganti config. Maka: attendances
DIBIARKAN di Cloudinary untuk Fase 3 ini, dan unifikasi penuh dicatat
sebagai keputusan lanjutan (§8) yang butuh rencana migrasi URL. Yang
dilakukan sebagai gantinya: limit multer ditambahkan ke config
attendances (§2.3), dan config Cloudinary mati (event/struktural) dihapus.

### 3.4 Pola auth & upload yang dirapikan

- Semua route tulis LMS/non-LMS kini memakai middleware yang sama
  (`verifyToken` / `VerifyAdmin` / `VerifySuperAdmin` / `verifyRole`
  yang sudah diperbaiki) — tidak ada lagi handler kustom yang
  men-decode token sendiri di jalur auth.
- Semua upload S3 melewati satu choke point (`UploadFileToStorage`)
  dengan validasi magic bytes + throw (§2.3); semua instance multer
  punya limit.
- Import tak terpakai yang ditinggalkan perubahan Fase 1–2 dibersihkan
  (duplikat `VerifyAdmin` di attendances, `Request` di 3 controller,
  `verifyToken` di potential-users route, `classIdFromSession` di
  sessions service, `FileType`/`getFileExtension` di assignment service).
  Sisa 30 error lint adalah pre-existing (lihat §9).

### 3.5 Klien minimal auth (repo terpisah — WORKING TREE SAJA, tanpa commit/push)

Perubahan ini HANYA boleh deploy setelah API baru live (§0 butir 5).

- **LMS** (`~/workspace/learning-management-system`, branch `main`,
  HEAD `3ac5655`):
  - `src/core/libs/api/config.ts`: pengiriman header pusat dihapus.
  - `src/core/configs/app.ts`: `GET /check` → `GET /auth/token`
    (endpoint yang memang ada di API, sama seperti CMS); field
    `HIMTI_HEADER_KEY` dihapus dari `CONFIG_APP`.
  - Header eksplisit per-request dihapus dari: `useAuth.ts` (login/
    register), `useClasses.ts` (list/create/update/get-by-id),
    `userMentors.ts` (mentor list), `useMentors.ts` (mentor list).
    Import `CONFIG_APP` yang menganggur di 2 file terakhir dibersihkan.
  - TIDAK diubah: `TOKEN_KEY`/`REFRESH_TOKEN_KEY` (kunci localStorage
    turunan `HIMTI_SECRET_KEY` — itu penamaan key lokal, bukan auth
    request; mengubahnya akan me-logout semua user), dan tidak ada
    perubahan fitur lain.
  - Verifikasi: grep `HIMTI_HEADER_KEY` di `src/` LMS = nol hasil.
- **Web utama** (`~/workspace/himti-web-revamp`):
  - `src/api/apiClient.js`: pengiriman header dihapus total (axios
    instance kini hanya `baseURL`); komentar penjelas ditambahkan agar
    tidak ditambahkan lagi.
  - Verifikasi: grep `VITE_API_HEADER_KEY`/`VITE_API_SECRET_KEY` di
    `src/` web = nol hasil.
- **CMS** (`~/workspace/himti-cms`, branch `dev`, HEAD `f837eb1`):
  - `.env.example`: diperbaiki ke nama `HIMTI_*` dengan nilai placeholder
    saja. **Temuan keamanan (tanpa menulis nilainya di sini): file contoh
    lama memuat nilai yang tampak seperti secret asli di bawah nama
    `VITE_API_*`.** Nilai itu TIDAK dibawa ke file baru, dan harus
    diperlakukan sebagai terekspos (Fase 4 rotasi tetap relevan untuk
    nilai apa pun yang pernah ter-commit; header itu sendiri sudah tidak
    memberi akses API lagi setelah Fase 1).
  - `src/core/configs/app.ts`: definisi mati `/potential-user` (singular)
    dihapus. Tidak ada service yang memakainya (yang hidup adalah
    `/potential-user-keys`) — terverifikasi via grep.
  - Tidak ada perubahan UI CMS (termasuk sub-acara — menunggu §8).
- Semua perubahan klien di atas berstatus working tree di repo
  masing-masing (terverifikasi `git status` per repo); NOL commit, NOL
  push di repo mana pun.

## 4. Kontrak env (HANYA NAMA — tidak ada nilai)

| Nama | Dipakai untuk | Status |
|---|---|---|
| `JWT_SECRET` | Tanda tangan access token | Tetap, wajib ada |
| `JWT_EXPIRES` | Expiry access token (kini juga dipakai login admin — §1.1) | Tetap, cek durasi production |
| `SECRET_KEY` | Input kunci turunan refresh token (Fase 1) | Tetap; diganti kunci dedicated di Fase 4 |
| `DATABASE_URL` | Koneksi Postgres (Prisma) | Tetap |
| `CORS_ALLOWED_ORIGINS` | **BARU** — allowlist CORS, comma-separated, menggantikan default | WAJIB di-set di production (§0) |
| `STORAGE.*` (env storage S3-compatible di `src/libs`) | Upload S3 | Tetap (nama-nama persisnya di `src/libs/index.ts`) |
| `CLOUDINARY_*` | Upload image attendances (satu-satunya jalur Cloudinary live) | Tetap sampai unifikasi (§8) |
| `HEADER_KEY` (legacy) | — | TIDAK LAGI dipakai sebagai auth; jangan di-set ulang |
| `CRYPTO_SECRET_KEY` (biometrik) | — | Tidak terjangkau HTTP sejak biometric 410; hapus permanen saat biometric dihapus/aktif-dengan-2FA |
| `ANGGOTA_CODE` (gate seed lama) | — | Route seed sudah dihapus; tidak dipakai |
| `REDIS_*` | — | `src/utils/redis.ts` dihapus; tidak dipakai |
| `MIDTRANS_*` | Pembuatan transaksi join kelas berbayar | Tetap (callback dimatikan, pembuatan jalan) |

Catatan: nama-nama env lama yang masih dibaca `src/libs/index.ts`
untuk kompatibilitas tidak ditulis ulang di sini satu per satu — sumber
kebenarannya adalah file itu + dashboard env deployment. Jangan pernah
menambahkan NILAI env apa pun ke dokumen ini.

## 5. Apa yang TIDAK diubah, dan kenapa

- **Kunci refresh tidak diganti (Fase 4).** Mengganti kunci di Fase 1 akan
  memutus semua refresh token LMS yang beredar. Perbaikan Fase 1 sengaja
  memakai kunci turunan yang sama agar token lama tetap jalan.
- **Midtrans creation tidak dihapus.** Hanya callback yang dimatikan
  (Q10). Join kelas berbayar masih memakainya.
- **Attendances tidak dipindah ke S3** (§3.3) — butuh migrasi URL.
- **Model Prisma `TicketSuport` tidak dihapus** — butuh migrasi; hanya
  route-nya yang dihapus.
- **Route `GET /user/admin` yang mati tidak diperbaiki urutannya** —
  butuh uji regresi CMS terpisah.
- **Log `console.log(errors)` di `validate-request.ts` tidak dihapus** —
  hanya error validasi, bukan secret.
- **Log debug nama/mime di `MulterFileFilter` tidak dihapus** — bukan
  secret; noise rendah.
- **Kunci localStorage LMS (`TOKEN_KEY`/`REFRESH_TOKEN_KEY`) tidak diubah**
  — mengubahnya me-logout semua user tanpa manfaat keamanan.
- **UI CMS sub-acara tidak diubah** — menunggu keputusan Wisnu (§8).
- **Dependensi yang masih dipakai tidak dihapus** walau tampak "berat"
  (canvas/pdfkit/archiver, cloudinary, firebase) — semuanya jalur live
  (§3.2).
- **Tidak ada perubahan skema selain 2 migrasi baru** — tidak ada edit
  migrasi lama, tidak ada perubahan kolom yang sudah ada selain default
  role.
- **Tidak ada commit/push/PR/merge/deploy/operasi DB live** — sesuai batas
  keras tugas.

## 6. Desain & keputusan penting lainnya (jejak audit)

- `VerifyAdmin` meloloskan `ADMIN` + `SUPER_ADMIN` (bukan hanya `ADMIN`)
  karena login admin CMS menerbitkan kedua role.
- `verifyRole` cabang MENTOR mensyaratkan record mentor NYATA (bukan
  sekadar role di daftar) — dan hanya untuk gate yang memang meminta
  MENTOR.
- `optionalAuth` (bukan `verifyToken` longgar) untuk katalog publik: token
  palsu tetap 403, bukan diperlakukan sebagai tamu.
- `VerifyTokenWithoutExp` untuk logout: signature wajib valid; expiry
  diwaiver karena itu semantik logout (token expired pun harus bisa
  logout).
- `GET /struktural` dijadikan publik (bukan sekadar "tetap jalan dengan
  header") karena itu satu-satunya bacaan web yang bergantung header.
- `GET /points/member` Fase 1 = JWT; service-nya mengembalikan leaderboard
  (id, nama, NIM, foto, angkatan, total point, rank) — jadi keputusan
  Fase 2 yang dicatat adalah "leaderboard eksplisit ber-JWT", bukan
  penulisan ulang diam-diam menjadi per-user.
- Paparan publik `/anggota/public` (NIM, email, foto, angkatan, sosmed —
  karena berbagi controller/mapper dengan `GET /anggota`) DITERIMA sebagai
  keputusan sadar Wisnu (Q8), bukan bug yang terlewat.
- Pesan error `PAID_CLASS_JOIN_FLOW` baru ditambahkan ke
  `src/utils/messages.ts` (pesan publish-only yang lama menyesatkan untuk
  kelas berbayar yang sudah publish).
- Interface mapper dipersempit (`Pick<User, …>`) sebagai konsekuensi
  select eksplisit — bukan pelonggaran tipe: mapper hanya memakai field
  itu, dan tsc 0 error membuktikannya.
- Koreksi draf selama kerja (dicatat agar tidak diulang): (a) logika
  owner-vs-manager submission sempat terbalik, diperbaiki ke
  `canManageClass`; (b) publish sempat memakai manage umum, dikoreksi
  menjadi creator-atau-admin; (c) `getSessionById` hanya mengembalikan
  `{id, name}` sehingga classId harus lewat `classIdFromSession`;
  (d) edit Fase 1 sempat menduplikasi import `VerifyAdmin` di attendances,
  diperbaiki; (e) `getSubmissionById` sempat memakai dynamic import,
  diganti import statis.

## 7. Catatan instalasi & build di container ini (bukan masalah kode)

- `npm install` murni GAGAL dua kali: (1) konflik peer pre-existing
  (eslint ^9 vs @typescript-eslint 7 yang meminta eslint ^8) — diatasi
  dengan `--legacy-peer-deps` (konflik ini sudah ada di base, bukan dari
  perubahan ini; skrip `lint` di package.json juga masih memakai flag
  `--ext` yang tidak valid di eslint 9 — lint dijalankan tanpa flag itu);
  (2) `ECONNRESET` saat postinstall `@prisma/engines` mengunduh engine
  lewat proxy egress (fetch Node di-reset untuk file .gz besar, sementara
  curl ke host yang sama berhasil).
- Solusi yang dipakai: `npm install --legacy-peer-deps --ignore-scripts`,
  lalu unduh manual via curl 2 engine Prisma
  (`libquery_engine` + `schema-engine`, varian debian-openssl-3.0.x,
  commit `34ace0eb…` dari Prisma 5.16.0) ke `node_modules/@prisma/engines/`
  DAN `node_modules/prisma/` (CLI mencari di kedua tempat — ketahuan dari
  log `DEBUG=prisma:*`), verifikasi keduanya sebagai ELF, lalu
  `prisma generate` berhasil. Ini workaround container saja; build
  Vercel (`prisma generate && tsc`) mengunduh engine normal dan tidak
  terpengaruh.
- `node_modules/` di-ignore git (`.gitignore`) — tidak masuk diff.
- `yarn` tidak tersedia di container; entri `helmet` di `yarn.lock`
  ditulis tangan (lihat §3.2) — konfirmasi dengan `yarn install`
  sungguhan sebelum merge.

## 8. Yang masih menggantung (TIDAK boleh dianggap selesai)

1. **Backup DB production** sebelum deploy (§0 butir 1).
2. **Base URL 3 klien** — verifikasi sama/beda via Vercel (Gate 1 smoke).
3. **Desain sub-acara (PROVISIONAL)** — konfirmasi model anak Event +
   field-fieldnya oleh Wisnu.
4. **UI CMS sub-acara** — aktifkan kembali atau API-only dulu.
5. **Branch produksi CMS/LMS di Vercel** — belum terkonfirmasi (konfirmasi
   Q12 hanya mencakup API).
6. **Unifikasi storage attendances (Cloudinary → S3)** — butuh rencana
   migrasi URL image lama.
7. **Hapus model Prisma `TicketSuport`** (butuh migrasi) bila memang
   sudah tidak dipakai permanen.
8. **Perbaiki urutan route `GET /user/admin`** (ter-shadow oleh
   `GET /:userId`) + uji regresi CMS.
9. **Hapus permanen service biometric + header `X-Encrypted-Data` /
   `X-Encryption-IV` dari CORS** — atau aktifkan kembali dengan faktor
   kedua nyata.
10. **Konfirmasi `yarn install`** untuk entri `helmet` di `yarn.lock`.
11. **Cek durasi `JWT_EXPIRES` production** (dampak ke token admin, §1.1).
12. **Fase 4 (terpisah, setelah repo benar-benar clean):** kunci refresh
    dedicated + paksa login ulang; rotasi semua nilai yang pernah
    ter-commit (termasuk nilai contoh di `.env.example` CMS lama, §3.5).
13. **Sisa 30 error lint pre-existing** (§9) — bukan blocker keamanan,
    tapi sebaiknya dibersihkan di batch terpisah (mayoritas `any`
    eksplisit + `next`/import tak terpakai di file yang tidak disentuh
    Fase 1–3).

## 9. Verifikasi (hasil nyata, bukan klaim)

Lingkungan: worktree `~/workspace/himti-api-exec` saja (bukan repo dev),
Node v24.22.1, install via `--legacy-peer-deps --ignore-scripts`
(§7), `prisma generate` setelah engine diunduh manual.

- **`npx tsc --noEmit` — 0 error.** Perjalanan: 8 error pertama semuanya
  dari perubahan Fase 2/3 sendiri (duplikat import attendances, 2×
  `classId` tak ada di `getSessionById`, 4× interface mapper vs select
  baru) — semuanya diperbaiki di file masing-masing, lalu 0 error, dan
  tetap 0 error setelah penghapusan dependensi (§3.2) dan setelah
  pembersihan lint (§9).
- **ESLint (`./node_modules/.bin/eslint ./src`) — 30 error, 0 warning.**
  Dari 37 awal, 7 adalah milik perubahan ini dan sudah diperbaiki
  (duplikat/import tak terpakai di 6 file). Sisa 30 adalah pre-existing
  di file yang tidak disentuh perubahan ini, dengan 2 pengecualian yang
  dibiarkan sadar: `catch (error: any)` di `GetFileFromStorage` dan
  `(member: any)` di export member (kode lama, bukan jalur auth).
  Daftar lengkap 30: `contact-info.controller` (next tak terpakai),
  `event-registration.service` (promisify tak terpakai),
  `lecturers.repository` (any), `course.service` (any),
  `members.service` (any), `periode.controller` (next ×2),
  `periode.dto` (any ×3), `potential-user-keys.controller` (next, any),
  `potential-users-ai.service` (any), `potential-users.dto` (any ×6),
  `potential-users.repository` (import tak terpakai, any),
  `potential-users.service` (any, nim/email tak terpakai, any),
  `prodi-structural.controller` (next), `registration-type.repository`
  (any), `seed-dosen.ts` (any ×2), `upload-file-to-storage.ts` (any di
  catch lama). Skrip `lint` di package.json (`--ext .ts`) tidak valid di
  eslint 9 — itu sebabnya lint dijalankan tanpa flag tersebut.
- **File baru sendiri bersih dari lint:** `auth-tokens.ts`,
  `lms-access.ts`, dan seluruh `src/app/sub-acara/` = 0 temuan.
- **Grep audit (setelah semua edit):**
  - `verifyKey`/`VerifyKey` di `src/` — hanya 1 komentar penjelas di
    `mentor.route.ts`. File `verify-key.ts` sudah tidak ada.
  - Nama env header di `src/` — hanya `CLOUDINARY_API_SECRET`
    (storage, hal berbeda) + 1 baris terkomentar di config business.
  - `atob(` di `src/middleware/` dan `src/app/authentication/` — nol
    (sisa `atob(code)` ada di `classes.service.ts` untuk kode undangan
    kelas — itu decode kode undangan, bukan secret; bukan jalur auth).
  - `decode(` di middleware/profile/auth — hanya 2 komentar penjelas.
  - `console.log` yang mencetak secret/token/OTP/password — nol.
  - `user: true` di `src/app/` — nol (semua sudah select eksplisit).
  - `HIMTI_HEADER_KEY` di `src/` LMS — nol; `VITE_API_HEADER_KEY` /
    `VITE_API_SECRET_KEY` di `src/` web & CMS — nol.
  - `initial` / `seed-generation` / `scheduling` di `src/routes/index.ts`
    — nol (mount sudah hilang).
  - Biometric route = stub 410; Midtrans callback = stub 410; keduanya
    terverifikasi via grep.
- **Nol commit / push / PR / merge / deploy / sentuh DB live** di semua
  repo (API + 3 klien) — terverifikasi `git status` per repo: hanya
  working tree (API: 90 entri status — 84 tracked + 6 baru termasuk
  file ini; LMS: 6 file; web: 1 file; CMS: 2 file).
- **Yang BELUM terverifikasi di sini (jujur dicatat, bukan diklaim):**
  runtime end-to-end (server tidak dijalankan — engine Prisma hanya
  dipakai untuk generate tipe, bcrypt native tidak di-build karena
  `--ignore-scripts`, dan tidak ada DB live untuk smoke test). Smoke
  test nyata adalah bagian dari checklist §0 butir 6 dan definisi lolosnya
  adalah QA manual Wisnu, bukan klaim laporan ini.

## 10. Daftar file yang diubah (API)

Baru: `src/utils/auth-tokens.ts`, `src/utils/lms-access.ts`,
`src/app/sub-acara/` (6 file), `prisma/migrations/20261102_user_role_default_user/`,
`prisma/migrations/20261102_sub_acara/`, `CHANGELOG-FASE1-3.md` (file ini).

Diubah (Fase 1): `src/middleware/verify-token.ts`,
`verify-admin.ts`, `verify-super-admin.ts`, `verify-token-without-exp.ts`,
`src/app/authentication/auth.service.ts`, `auth.controller.ts`,
`auth.route.ts`, `src/app/profile/profile.service.ts`,
`profile.controller.ts`, `src/app/lms/classes/classes.route.ts`,
`src/app/lms/mentor/mentor.route.ts`, `src/app/attendances/attendances.route.ts`,
`src/app/business/business.route.ts`, `src/app/event/event.route.ts`,
`src/app/event-meeting/event-meeting.route.ts`,
`src/app/history/history.route.ts`, `src/app/lecturers/lecturers.route.ts`,
`src/app/members/members.route.ts`, `src/app/notification/notification.route.ts`,
`src/app/point/points.route.ts`,
`src/app/potential-users/potential-users.route.ts`,
`src/app/registration-type/registration-type.routes.ts`,
`src/app/user-fcm/user-fcm.route.ts`,
`src/app/generations/generations.route.ts`,
`src/app/struktural/struktural.route.ts`,
`src/app/event-registration/event-registration.route.ts`,
`src/app/lms/course/course.route.ts`,
`src/app/lms/transactions/transactions.route.ts`,
`src/app/meetings/meetings.route.ts`,
`src/app/lms/assignment/assignment.route.ts`,
`src/app/lms/sessions/sessions.route.ts`, `src/routes/index.ts`,
`src/index.ts`, `package.json`, `package-lock.json`, `yarn.lock`.

Diubah (Fase 2): `src/app/lms/sessions/sessions.service.ts`,
`sessions.controller.ts`, `src/app/lms/modules/modules.service.ts`,
`src/app/lms/assignment/assignment.service.ts`,
`src/app/lms/assignment/submission/submission.service.ts`,
`submission.controller.ts`, `src/app/lms/class-participants/class-participants.service.ts`,
`class-participants.controller.ts`,
`src/app/lms/completed-modules/completed-modules.service.ts`,
`src/app/lms/completed-classes/completed-classes.service.ts`,
`src/app/lms/certificates/certificates.service.ts`,
`certificates.controller.ts`, `certificates.route.ts`,
`src/app/lms/classes/classes.service.ts`, `classes.controller.ts`,
`classes.repository.ts`, `src/app/lms/class-mentor/class-mentor.service.ts`,
`class-mentor.repository.ts`, `class-mentor.interface.ts`,
`src/app/user/user.service.ts`, `user.controller.ts`,
`prisma/schema.prisma`, `src/utils/upload-file-to-storage.ts`,
`src/utils/messages.ts`, `src/app/attendances/attendances.config.ts`,
`src/app/event/event.config.ts` (lalu dihapus Fase 3),
`src/app/struktural/struktural.config.ts` (lalu dihapus Fase 3),
`src/app/history/history.repository.ts`, `history.interface.ts`,
`src/app/lms/assignment/assignment.repository.ts`,
`src/app/lms/assignment/submission/submission.repository.ts`,
`src/app/lms/mentor/mentor.repository.ts`, `mentor.mapper.ts`,
`src/app/lms/sessions/sessions.repository.ts`,
`src/app/members/members.repository.ts`.

Dihapus (Fase 3): `src/middleware/verify-key.ts` (Fase 1),
`src/app/initial/initial.route.ts` (Fase 1),
`src/app/initial/initial.controller.ts`,
`src/app/initial/initial.service.ts`, `src/app/scheduling/scheduling-meeting.ts`,
`src/app/event/event.config.ts`, `src/app/struktural/struktural.config.ts`,
`src/utils/redis.ts`, `src/app/ticket-support/` (7 file),
`GET /generate` di `src/routes/index.ts`, job scheduler per-menit di
`src/index.ts`.

Klien (working tree saja): LMS 6 file, web 1 file, CMS 2 file (§3.5).
