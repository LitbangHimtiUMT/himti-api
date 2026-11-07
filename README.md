# himti-api

Backend API HIMTI UMT. Express + TypeScript + Prisma + Postgres (Neon).
Live di `https://himti-api.vercel.app`, auto-deploy dari `main`.

Dipakai 3 klien: web utama (`himtiumt.org`, `www.himtiumt.org`), CMS
(`cms.himtiumt.org`), LMS (`lms.himtiumt.org`).

## Jalanin lokal

Butuh Node 20+ sama akses Postgres (Neon buat production, lokal bebas
pakai Postgres lokal).

```bash
npm install
cp .env.example .env  # isi nilainya, jangan di-commit
npx prisma generate
npm run dev
```

Script yang ada: `npm run dev` (nodemon), `npm run build`
(`prisma generate && tsc`), `npm start` (`node dist/index.js`),
`npm run lint`, `npx tsc --noEmit`, `npm run seed:dosen`.

Sebelum commit/push: `npm run build`, `npm run lint`,
`npx tsc --noEmit`. Aturan lengkap ada di
[CONTRIBUTING.md](CONTRIBUTING.md).

## Env vars

Nilai asli cuma ada di Vercel dashboard sama `.env` lokal. Jangan
taruh nilai asli di repo, log, atau chat. Contoh lengkap di
[.env.example](.env.example).

- `DATABASE_URL`: Postgres (Neon di production)
- `PORT`: default `5000` kalau kosong
- `JWT_SECRET`, `JWT_EXPIRES`: token JWT (`JWT_EXPIRES` default `3d`)
- `CORS_ALLOWED_ORIGINS`: origin yang diizinkan, dipisah koma.
  Production wajib diisi 4 origin di atas.
- `SECRET_KEY`, `HEADER_KEY`, `CRYPTO_SECRET_KEY`: kunci internal.
  Header legacy udah nggak dipakai buat auth.
- `AWS_STORAGE_ENDPOINT`, `AWS_STORAGE_REGION`, `AWS_STORAGE_BUCKET`,
  `AWS_STORAGE_BUCKET_FOLDER`, `AWS_STORAGE_ACCESS_KEY`,
  `AWS_STORAGE_SECRET_KEY`: storage S3-compatible buat semua upload,
  termasuk attendances.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
  `FIREBASE_PRIVATE_KEY`: notifikasi.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
  `SMTP_LOGIN`, `EMAIL_SENDER`: kirim email.
- `CLOUDCONVERT_API_KEY`, `REPLICATE_API_TOKEN`: konversi dokumen
  (production) dan fitur AI.
- `ANGGOTA_CODE`, `UNDER_MAINTENANCE`: kode anggota dan mode
  maintenance (`YES`/`NO`).

Yang dibaca kode tapi nggak di-set di production:

- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SNAP_URL`:
  pembuatan transaksi kelas berbayar bakal gagal.
- `LIBREOFFICE_PATH`: nggak ngaruh, opsional. Production pakai
  CloudConvert.

Kalau fitur di atas mau dipakai di production, tambahin dulu
variabelnya di Vercel.

## Struktur

- `src/index.ts`: entrypoint. Helmet, `Cache-Control: private,
  no-store`, CORS, cookie parser, JSON parser, routing, error handler.
- `src/routes/index.ts`: mount semua modul.
- `src/app/`: satu folder per modul (auth, profile, anggota, dosen,
  angkatan, struktural, acara, sub-acara, absensi, pendaftaran,
  business, prestasi, dst, plus `lms/` dan `midtrans/`).
- `src/app/lms/`: kelas, sesi, modul, assignment, submission,
  peserta, mentor, kategori, transaksi, sertifikat.
- `src/middleware/`: `verify-token`, `verify-admin`,
  `verify-super-admin`, `verify-token-without-exp`,
  `validate-request`.
- `src/utils/`: helper auth, upload, mail, Firebase, pagination.
- `prisma/schema.prisma`: model database.
- `ABSENSI.template.docx`: template runtime buat export absensi
  (diisi data peserta sama `event-registration.service.ts`).
  Sumber pembuatnya `ABSENSI.docx` +
  `scripts/prepare-absensi-template.js`.
- `src/initial/seed-dosen.ts`: seed dosen (`npm run seed:dosen`).
- `vercel.json`, `tsconfig.json`, `eslint.config.mjs`,
  `nodemon.json`: config deploy/build/lint/dev.

## Auth

JWT-only. Header rahasia legacy udah nggak diterima di endpoint
mana pun, klien harus berhenti ngirimnya.

- `verifyToken`: token valid dan user-nya ada.
- `VerifyAdmin`: ADMIN atau SUPER_ADMIN. `VerifySuperAdmin`:
  SUPER_ADMIN aja.
- `verifyRole`: role yang diminta, atau record mentor nyata buat
  MENTOR.
- Refresh token: `POST /auth/refresh-token`.
- LMS pakai ownership per kelas, bukan cuma role: peserta cuma
  kelasnya sendiri, mentor cuma kelas yang dia buat/ampu, admin
  semua kelas (`src/utils/lms-access.ts`).
- Rate limit ada di auth, pendaftaran event, dan sertifikat.

Endpoint yang udah dimatiin, jangan dihidupin lagi tanpa keputusan:

- `POST /initial`, `POST /seed-generation-2022`,
  `POST /scheduling-notification-meeting`: dihapus dari routing.
- `POST /lms/transactions/callback`: stub 410. Bikin transaksi
  Midtrans buat kelas berbayar masih ada di kode, tapi
  `MIDTRANS_SERVER_KEY` dan `MIDTRANS_SNAP_URL` nggak di-set di
  production, jadi bikin transaksi gagal di production. Yang mati
  cuma callback-nya, soalnya signature-nya nggak pernah
  diverifikasi.
- `POST /auth/biometric`: stub 410. Service sama controller-nya
  udah dihapus. Balik cuma kalau ada second factor beneran.

Lain-lain: `/sub-acara` (anak Event: nama, deskripsi, image, waktu,
`isOpenAbsen`, `eventId`), CRUD admin + baca publik. Sertifikat:
`GET /lms/certificates/file` cuma by-code (`?code=...`) + rate limit.

## Route

- Baca publik: prestasi, acara, dosen publik, anggota publik,
  generasi, struktural, prodi-structural, periode,
  registration-type, business, contact-info, version, katalog kelas
  LMS.
- Tulis: admin. Kecuali `POST /event-registration` (pendaftaran
  terbuka, + rate limit dan validasi) dan endpoint auth dasar.
- LMS: kelas, sesi, modul, assignment, submission, peserta,
  sertifikat ikut ownership per kelas. List peserta wajib manage
  kelas. Self-enrol wajib kelas PUBLISH + harga 0 + anti-duplikat.
- Route lain yang dulu telanjang sekarang ke-gate JWT atau admin.
  Kalau gate-nya nggak jelas, baca file route-nya langsung.

## CORS

- Allowlist ketat, 4 origin di atas, diatur lewat
  `CORS_ALLOWED_ORIGINS` (wajib diisi di production).
- Semua respons bawa `Cache-Control: private, no-store`, termasuk
  preflight. Biar edge cache nggak nyimpen respons API dengan header
  CORS basi.
- Origin di luar allowlist dijawab 403, bukan 500.
- Bridge sementara: header `x-api-key` masih diizinin di preflight
  karena klien production lama masih ngirimnya. Server ngabaikan
  nilainya (auth tetap JWT-only). Hapus baris ini setelah semua
  klien redeploy tanpa header legacy.

## Database

Postgres (Neon di production). Model di `prisma/schema.prisma`,
migrasi di `prisma/migrations/`. Production:
`npx prisma migrate deploy`. Jangan migrasi tanpa backup dulu.

## Deploy

Merge ke `main`, Vercel auto-deploy. Urutan aman: API dulu, tunggu
stabil, baru klien. Rollback: redeploy commit `main` sebelumnya,
restore DB kalau migrasi/data berubah.

## Catatan

- Semua upload, termasuk attendances, pakai storage S3-compatible.
  Wiring Cloudinary lama udah dihapus.
- Bikin transaksi Midtrans masih hidup, tapi var-nya nggak di-set
  di production (lihat di atas). Yang mati cuma callback-nya.
- Notifikasi Firebase masih hidup (`src/utils/firebase-config.ts`).
- Template sertifikat event masih hidup lewat attendances; template
  dikirim sebagai buffer sama caller.
- Ada dua lockfile (`package-lock.json` sama `yarn.lock`) dari dulu.
  Pakai satu package manager aja per folder, jangan dicampur.

## Dokumen lain

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE.md](LICENSE.md) (MIT)
