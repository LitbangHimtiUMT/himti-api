# HIMTI API

API backend HIMTI UMT: Express + TypeScript + Prisma + PostgreSQL, di-deploy di Vercel.
Dipakai tiga klien: web utama, CMS, dan LMS.

Base URL production:

```bash
https://himti-api.vercel.app
```

## Auth — baca dulu sebelum mengubah apa pun

Auth sekarang **JWT-only**. Header rahasia legacy tidak lagi diterima sebagai
auth di endpoint mana pun. Klien yang masih mengirim header itu harus berhenti
mengirimnya; perubahan klien disiapkan terpisah dari repo ini.

- Login mengeluarkan access token dan refresh token.
- Refresh token: `POST /auth/refresh-token`, kontrak endpoint sama seperti
  sebelumnya, diverifikasi sinkron terhadap kunci turunan yang sama agar
  token LMS yang beredar tetap jalan. Kunci refresh dedicated baru adalah
  Fase 4, bersama forced re-login — jangan diubah di sini.
- Gate: `verifyToken` (JWT + user harus ada), `VerifyAdmin` (ADMIN atau
  SUPER_ADMIN), `VerifySuperAdmin` (SUPER_ADMIN saja), `verifyRole` (role
  atau record mentor nyata). User biasa tidak lolos gate admin, apa pun
  tokennya.
- LMS memakai ownership per kelas, bukan cuma role: peserta hanya kelasnya,
  mentor hanya kelas yang ia buat atau ia ampu, admin boleh semua kelas.
  Lihat `src/utils/lms-access.ts`.
- Rate limit: auth dan pendaftaran event dibatasi per IP; OTP tetap dibatasi
  seperti sebelumnya. Detail ada di `src/index.ts` dan route auth.

Endpoint yang dimatikan (jangan diaktifkan lagi tanpa keputusan eksplisit):

- `POST /initial` — dihapus dari routing.
- Callback Midtrans `POST /lms/transactions/callback` — stub 410. Pembuatan
  transaksi Midtrans untuk kelas berbayar masih hidup di
  `src/app/midtrans/midtrans.service.ts` dan dipakai kelas berbayar; yang
  dimatikan hanya callback-nya, karena signature-nya tidak pernah
  diverifikasi.
- `POST /seed-generation-2022` dan `/scheduling-notification-meeting` —
  dihapus dari routing.
- `POST /auth/biometric` — stub 410, dan service + controller-nya sudah
  dihapus di clean batch 2. Login biometrik hanya boleh kembali dengan
  second factor nyata, sebagai keputusan tersendiri.

Endpoint baru, provisional (menunggu konfirmasi): `/sub-acara`, model anak
Event (nama, deskripsi, image, waktu, `isOpenAbsen`, `eventId`), CRUD admin
+ baca publik. Lihat `src/app/sub-acara/`.

Sertifikat: `GET /lms/certificates/file` hanya by-code (`?code=...`) +
rate limit. Daftar sertifikat LMS tidak rusak karena repository-nya sudah
memfilter per user.

## Menjalankan lokal

```bash
npm install
npx prisma generate
npm run dev
```

Build dan cek:

```bash
npm run build   # prisma generate && tsc
npm run lint    # eslint ./src
npx tsc --noEmit
```

Catatan: skrip `lint` lama memakai flag `--ext` yang tidak valid di ESLint 9;
sudah diperbaiki di clean batch 2.

## Environment (nama saja, tanpa nilai)

File contoh: `.env.example`. Variabel yang dipakai kode ini antara lain:
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES`, `SECRET_KEY`,
`CRYPTO_SECRET_KEY`, `ANGGOTA_CODE`, storage S3-compatible, Firebase
(notifikasi), dan `CORS_ALLOWED_ORIGINS` (baru, wajib di-set di production
persis ke origin tiga klien; default di kode hanya fallback).

Jangan pernah menulis nilai variabel di atas ke repo, log, atau chat.

## Migrasi — urutan sebelum deploy

Jalankan migrasi ke production **sebelum** deploy kode yang memakainya.
Jangan edit migrasi lama; selalu tambah file migrasi baru.

Migrasi baru di branch ini, urut:

1. `20261102_user_role_default_user` — ubah default kolom `role` jadi
   `USER`. Baris yang sudah ada tidak diubah. Perhatian: file ini sempat
   menulis tabel `"User"` dan gagal di production (`relation "User" does
   not exist`); nama tabel yang benar adalah `"user"` (lowercase, sesuai
   pemetaan Prisma) dan sudah diperbaiki.
2. `20261102_sub_acara` — buat tabel `sub_acara` anak `event`.
3. `20261102_drop_ticket_suport` — hapus tabel `ticket_suport`. Ini
   destruktif untuk baris apa pun yang mungkin ada dari build lama:
   jalankan hanya setelah backup production, karena route ticket-support
   tidak pernah ter-mount di `main` sehingga tidak ada penulis API yang
   hidup untuk tabel ini.

## Route

Matriks lengkap per modul dan gate-nya ada di
[`ROUTE-MATRIX.md`](ROUTE-MATRIX.md). Ringkasnya:

- Baca publik: prestasi, acara, dosen publik, anggota publik, generasi,
  struktural baca, prodi-structural, periode, registration-type,
  business, contact-info, version, katalog kelas LMS.
- Tulis: admin, kecuali `POST /event-registration` (pendaftaran terbuka,
  + rate limit dan validasi) dan endpoint auth dasar.
- LMS: baca/tulis kelas, sesi, modul, assignment, submission, dan
  sertifikat tunduk ownership per kelas di atas, bukan cuma role.
- Semua route lain yang dulu telanjang kini memakai JWT atau gate admin.

## Deploy

Urutan yang aman: API dulu, tunggu stabil, baru klien (klien tanpa header
hanya jalan di API baru). Jangan merge PR ini sebelum backup production,
migrasi di atas, `CORS_ALLOWED_ORIGINS`, durasi `JWT_EXPIRES`, base URL
tiga klien, dan smoke + QA manual selesai. Rencana rollback: redeploy
commit `main` lama dan restore DB bila migrasi/data berubah.

## Yang sengaja dipertahankan (bukan ketinggalan)

- Storage attendances masih Cloudinary, sementara upload lain sudah
  S3-compatible. Memindahkannya akan mengubah URL image lama, jadi perlu
  rencana migrasi URL dulu — bukan dilakukan diam-diam.
- Pembuatan transaksi Midtrans (kelas berbayar) masih hidup; yang mati
  hanya callback-nya.
- Notifikasi Firebase masih hidup (`src/utils/firebase-config.ts`).
- Template sertifikat event (`src/app/event/event.utils.ts`) masih hidup
  lewat attendances; template di `public/` adalah aset contoh, bukan
  path yang dibaca kode (template dikirim sebagai buffer oleh caller).

## Tools di repo (bukan API runtime)

- `scripts/prepare-absensi-template.js` (`npm run absensi:prepare-template`)
  — mengubah `ABSENSI.docx` menjadi `ABSENSI.template.docx`.
- `src/initial/seed-dosen.ts` (`npm run seed:dosen`) — seed dosen.
- `restore-storage.ts` — restore storage dari ZIP backup.
- `HIMTI-API-Complete.postman_collection.json` + `POSTMAN-COLLECTION-README.md`
  — koleksi Postman untuk testing manual.
- Dokumen lama `BACKUP-QUICK-REFERENCE.md` dan `STORAGE-BACKUP-README.md`
  merujuk script backup lama yang sudah tidak aktif; jangan pakai perintah
  di dalamnya tanpa verifikasi dulu.

File yang sudah dihapus di clean batch 2 karena tidak ada kode aktif sama
sekali (seluruh isi terkomentari) atau tidak direferensikan paket/skrip
mana pun: `backup-storage.ts`, `generate-postman.js`, `query-db.ts`,
`test-connection.ts`. Service biometrik dan model `TicketSuport` juga
dihapus (route-nya sudah mati sejak Fase 1–3).

## Dokumen lain

- [`CHANGELOG-FASE1-3.md`](CHANGELOG-FASE1-3.md) — detail per-file Fase 1–3,
  keputusan desain, dan apa yang tidak diubah dan kenapa.
- [`ROUTE-MATRIX.md`](ROUTE-MATRIX.md) — matriks route final setelah
  perbaikan.
