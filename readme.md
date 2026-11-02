# HIMTI API

API backend HIMTI UMT. Express + TypeScript + Prisma + PostgreSQL,
di-deploy di Vercel. Dipakai tiga klien: web utama, CMS, dan LMS.

Base URL production:

```bash
https://himti-api.vercel.app
```

Dokumen di repo ini hanya file ini. Tidak ada dokumen lain.

## Menjalankan

```bash
npm install
npx prisma generate
npm run dev
```

Cek sebelum commit/push:

```bash
npm run build   # prisma generate && tsc
npm run lint    # eslint ./src
npx tsc --noEmit
```

Struktur yang penting:

- `src/index.ts` — entrypoint, CORS, helmet, rate limit.
- `src/routes/index.ts` — mount semua modul.
- `src/app/` — satu folder per modul: `authentication`, `profile`,
  `members` (anggota), `lecturers` (dosen), `generations` (angkatan),
  `struktural`, `prodi-structural`, `periode`, `event`, `sub-acara`,
  `event-meeting`, `meetings`, `attendances` (absensi),
  `event-registration`, `registration-type`, `business`, `achievements`
  (prestasi), `history`, `notification`, `user-fcm`, `user`, `point`,
  `contact-info`, `version`, `potential-users`, `potential-user-keys`,
  `midtrans`, dan `lms/`.
- `src/app/lms/` — kelas, sesi, modul, assignment, submission, peserta
  kelas, mentor, kategori, transaksi, sertifikat, completed.
- `src/middleware/` — `verify-token`, `verify-admin`,
  `verify-super-admin`, `verify-token-without-exp`, `validate-request`.
- `src/utils/` — helper auth, upload, mail, Firebase, pagination, dan lain-lain.
- `prisma/schema.prisma` — model. `prisma/migrations/` — lihat peringatan
  di bawah, jangan percaya folder ini mentah-mentah.
- `ABSENSI.template.docx` — template runtime untuk export absensi
  pendaftaran event (diisi data peserta oleh
  `src/app/event-registration/event-registration.service.ts`).
  `ABSENSI.docx` + `scripts/prepare-absensi-template.js` adalah sumber
  pembuatan template itu, bukan dokumen.
- `src/initial/seed-dosen.ts` (`npm run seed:dosen`) — seed dosen.
- `vercel.json` — deploy Vercel. `tsconfig.json`, `eslint.config.mjs`,
  `nodemon.json` — config build/lint/dev.
- `.env.example` — contoh nama variabel saja, tanpa nilai. Jangan pernah
  menulis nilai variabel ke repo, log, atau chat.

## Auth

JWT-only. Header rahasia legacy tidak lagi diterima sebagai auth di
endpoint mana pun. Klien harus berhenti mengirimnya.

- `verifyToken`: token access terverifikasi signature-nya dan user-nya ada.
- `VerifyAdmin`: ADMIN atau SUPER_ADMIN. `VerifySuperAdmin`: SUPER_ADMIN saja.
- `verifyRole`: role yang diminta, atau record mentor nyata untuk MENTOR.
- Refresh: `POST /auth/refresh-token`, kontrak sama, verifikasi sinkron
  terhadap kunci turunan yang sama agar token LMS yang beredar tetap jalan.
  Kunci refresh dedicated baru adalah Fase 4, bersama forced re-login.
- LMS memakai ownership per kelas: peserta hanya kelasnya, mentor hanya
  kelas yang ia buat atau ampu, admin semua kelas
  (`src/utils/lms-access.ts`).
- Rate limit ada di auth dan pendaftaran event; OTP tetap dibatasi.

Endpoint yang dimatikan, jangan diaktifkan lagi tanpa keputusan eksplisit:

- `POST /initial` — dihapus dari routing.
- `POST /seed-generation-2022` dan `/scheduling-notification-meeting` —
  dihapus dari routing.
- `POST /lms/transactions/callback` — stub 410. Pembuatan transaksi
  Midtrans untuk kelas berbayar masih hidup
  (`src/app/midtrans/midtrans.service.ts`); yang mati hanya callback-nya,
  karena signature-nya tidak pernah diverifikasi.
- `POST /auth/biometric` — stub 410, service dan controller-nya sudah
  dihapus. Kembali hanya dengan second factor nyata.

Endpoint baru, provisional: `/sub-acara`, model anak Event (nama, deskripsi,
image, waktu, `isOpenAbsen`, `eventId`), CRUD admin + baca publik.

Sertifikat: `GET /lms/certificates/file` hanya by-code (`?code=...`) +
rate limit.

## Route, ringkas

- Baca publik: prestasi, acara, dosen publik, anggota publik, generasi,
  struktural baca, prodi-structural, periode, registration-type, business,
  contact-info, version, katalog kelas LMS.
- Tulis: admin, kecuali `POST /event-registration` (pendaftaran terbuka,
  + rate limit dan validasi) dan endpoint auth dasar.
- LMS: kelas, sesi, modul, assignment, submission, peserta, sertifikat
  tunduk ownership per kelas, bukan cuma role. List peserta wajib manage
  kelas. Self-enrol wajib kelas PUBLISH + harga 0 + anti-duplikat.
- Semua route lain yang dulu telanjang kini bergate JWT atau admin.
  Kalau ada route yang tidak jelas gate-nya, baca file route-nya langsung
  — jangan asumsi publik.

## Migrasi — baca ini sebelum jalanin apa pun

**Peringatan keras: histori migrasi repo ini tidak lengkap.** Hanya ada
satu migrasi awal (`20241110144914_initial_migration`), dan migrasi itu
tidak membuat tabel `ticket_suport`, `classes`, `mentors`, dan banyak
model lain. Model-model itu ditambahkan belakangan tanpa migrasi
(kemungkinan lewat `db push`). Akibatnya, struktur database production
tidak bisa dibuktikan hanya dari folder `prisma/migrations/`.

Karena itu, sebelum menjalankan migrasi baru di database mana pun:

1. Pastikan database yang dimigrasi adalah database yang dipakai API
   production (bukan database kosong, bukan database lain, bukan schema
   lain). Kalau tabel `user` saja tidak ada di database itu, berhenti —
   itu bukan database production yang benar, atau schema-nya beda.
2. Cek daftar tabel di database itu (dari file backup `pg_dump` yang
   sudah ada, atau `\dt` di database itu), dan cocokkan dengan model
   yang diubah migrasi.
3. Baru jalankan migrasi, dan baca NOTICE-nya. Migrasi baru di branch
   ini sengaja guarded: kalau tabel tidak ada, migrasi tidak gagal total
   tapi hanya mencatat NOTICE dan tidak mengubah apa-apa. Sukses yang
   guarded **bukan** bukti perubahan sudah diterapkan.

Migrasi baru, urut, dan harus jalan sebelum deploy kode yang memakainya:

1. `20261102_user_role_default_user` — default kolom `role` jadi `USER`.
   Baris lama tidak diubah.
2. `20261102_sub_acara` — buat tabel `sub_acara` anak `event`.
3. `20261102_drop_ticket_suport` — hapus tabel `ticket_suport` kalau ada.
   Destruktif untuk baris dari build lama: hanya setelah backup.

## Deploy

Urutan aman: API dulu, tunggu stabil, baru klien (klien tanpa header
hanya jalan di API baru). Jangan merge sebelum backup production,
migrasi di atas, CORS production, durasi token admin, base URL tiga
klien, dan smoke + QA manual selesai. Rollback: redeploy commit `main`
lama dan restore DB bila migrasi/data berubah.

## Yang sengaja dipertahankan

- Storage attendances masih Cloudinary, upload lain sudah S3-compatible.
  Memindahkannya mengubah URL image lama, perlu rencana migrasi URL dulu.
- Pembuatan transaksi Midtrans masih hidup (lihat di atas); yang mati
  hanya callback-nya.
- Notifikasi Firebase masih hidup (`src/utils/firebase-config.ts`).
- Template sertifikat event masih hidup lewat attendances; template
  dikirim sebagai buffer oleh caller.
- Kedua lockfile (`package-lock.json` dan `yarn.lock`) sudah ada sejak
  `main` lama; pakai satu package manager secara konsisten per folder,
  jangan dicampur.
