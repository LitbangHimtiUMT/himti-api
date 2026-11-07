# HIMTI API

API backend HIMTI UMT. Status: **production-ready**, live di Vercel,
dipakai tiga klien: web utama, CMS, dan LMS.

- Stack: Express + TypeScript + Prisma + PostgreSQL (Neon)
- Auth: JWT-only
- Deploy: Vercel, auto-deploy dari branch `main`
- Base URL production: `https://himti-api.vercel.app`

| Klien | Origin |
| --- | --- |
| Web utama | `https://himtiumt.org`, `https://www.himtiumt.org` |
| CMS | `https://cms.himtiumt.org` |
| LMS | `https://lms.himtiumt.org` |

## Menjalankan lokal

Prasyarat: Node.js 20+ (LTS), npm, dan akses ke database PostgreSQL
(Neon untuk production; lokal boleh Postgres lokal).

```bash
npm install
cp .env.example .env   # isi nilainya, jangan pernah commit file .env
npx prisma generate
npm run dev
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan dengan nodemon |
| `npm run build` | `prisma generate && tsc` |
| `npm start` | `node dist/index.js` |
| `npm run lint` | `eslint ./src` |
| `npx tsc --noEmit` | Typecheck tanpa emit |
| `npm run seed:dosen` | Seed data dosen |

Cek sebelum commit/push: `npm run build`, `npm run lint`,
`npx tsc --noEmit`. Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk
aturan kontribusi lengkap.

## Environment variables

Nama variabel saja, tanpa nilai. Nilai aslinya hanya ada di
Vercel dashboard (production) dan file `.env` lokal. Jangan pernah
menulis nilai variabel ke repo, log, atau chat. Contoh lengkap ada di
[.env.example](.env.example).

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | PostgreSQL (Neon di production) |
| `PORT` | Port server, default `5000` kalau tidak diisi |
| `JWT_SECRET`, `JWT_EXPIRES` | Kunci dan masa berlaku token JWT (`JWT_EXPIRES` default `3d`) |
| `CORS_ALLOWED_ORIGINS` | Daftar origin diizinkan, dipisah koma. Production wajib diisi persis 4 origin di tabel klien di atas |
| `SECRET_KEY`, `HEADER_KEY`, `CRYPTO_SECRET_KEY` | Kunci internal (enkripsi/payload). Header legacy sudah tidak dipakai sebagai auth |
| `AWS_STORAGE_ENDPOINT`, `AWS_STORAGE_REGION`, `AWS_STORAGE_BUCKET`, `AWS_STORAGE_BUCKET_FOLDER`, `AWS_STORAGE_ACCESS_KEY`, `AWS_STORAGE_SECRET_KEY` | Storage S3-compatible (semua upload, termasuk attendances) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase (notifikasi) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_LOGIN`, `EMAIL_SENDER` | Pengiriman email |
| `CLOUDCONVERT_API_KEY`, `REPLICATE_API_TOKEN` | Konversi dokumen di production (CloudConvert) dan fitur AI (Replicate) |
| `ANGGOTA_CODE`, `UNDER_MAINTENANCE` | Kode anggota dan mode maintenance (`YES`/`NO`) |

Variabel berikut dibaca kode tapi tidak di-set di Vercel production:

| Variabel | Akibat di production |
| --- | --- |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_SNAP_URL` | Pembuatan transaksi kelas berbayar gagal |
| `LIBREOFFICE_PATH` | Tidak berpengaruh; opsional, hanya override path binary lokal (production memakai CloudConvert) |

Kalau salah satu fitur di atas dipakai di production, tambahkan dulu
variabelnya di Vercel.

## Struktur proyek

- `src/index.ts`: entrypoint: helmet, `Cache-Control: private, no-store`,
  CORS, cookie parser, JSON parser, routing, error handler.
- `src/routes/index.ts`: mount semua modul.
- `src/app/`: satu folder per modul: `authentication`, `profile`,
  `members` (anggota), `lecturers` (dosen), `generations` (angkatan),
  `struktural`, `prodi-structural`, `periode`, `event`, `sub-acara`,
  `event-meeting`, `meetings`, `attendances` (absensi),
  `event-registration`, `registration-type`, `business`, `achievements`
  (prestasi), `history`, `notification`, `user-fcm`, `user`, `point`,
  `contact-info`, `version`, `potential-users`, `potential-user-keys`,
  `midtrans`, dan `lms/`.
- `src/app/lms/`: kelas, sesi, modul, assignment, submission, peserta
  kelas, mentor, kategori, transaksi, sertifikat, completed.
- `src/middleware/`: `verify-token`, `verify-admin`,
  `verify-super-admin`, `verify-token-without-exp`, `validate-request`.
- `src/utils/`: helper auth, upload, mail, Firebase, pagination, dan lain-lain.
- `prisma/schema.prisma`: model database.
- `ABSENSI.template.docx`: template runtime untuk export absensi
  pendaftaran event (diisi data peserta oleh
  `src/app/event-registration/event-registration.service.ts`).
  `ABSENSI.docx` + `scripts/prepare-absensi-template.js` adalah sumber
  pembuatan template itu, bukan dokumen.
- `src/initial/seed-dosen.ts` (`npm run seed:dosen`): seed dosen.
- `vercel.json`: deploy Vercel. `tsconfig.json`, `eslint.config.mjs`,
  `nodemon.json`: config build/lint/dev.

## Auth

JWT-only. Header rahasia legacy tidak lagi diterima sebagai auth di
endpoint mana pun. Klien harus berhenti mengirimnya.

- `verifyToken`: token access terverifikasi signature-nya dan user-nya ada.
- `VerifyAdmin`: ADMIN atau SUPER_ADMIN. `VerifySuperAdmin`: SUPER_ADMIN saja.
- `verifyRole`: role yang diminta, atau record mentor nyata untuk MENTOR.
- Refresh: `POST /auth/refresh-token`.
- LMS memakai ownership per kelas: peserta hanya kelasnya, mentor hanya
  kelas yang ia buat atau ampu, admin semua kelas
  (`src/utils/lms-access.ts`).
- Rate limit ada di auth, pendaftaran event, dan sertifikat.

Endpoint yang dimatikan, jangan diaktifkan lagi tanpa keputusan eksplisit:

- `POST /initial`: dihapus dari routing.
- `POST /seed-generation-2022` dan `/scheduling-notification-meeting`:
  dihapus dari routing.
- `POST /lms/transactions/callback`: stub 410. Pembuatan transaksi
  Midtrans untuk kelas berbayar masih hidup di kode
  (`src/app/midtrans/midtrans.service.ts`), tapi `MIDTRANS_SERVER_KEY`
  dan `MIDTRANS_SNAP_URL` tidak di-set di production, jadi pembuatan
  transaksi gagal di production. Yang mati hanya callback-nya,
  karena signature-nya tidak pernah diverifikasi.
- `POST /auth/biometric`: stub 410, service dan controller-nya sudah
  dihapus. Kembali hanya dengan second factor nyata.

Endpoint baru: `/sub-acara`, model anak Event (nama, deskripsi,
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
  Kalau ada route yang tidak jelas gate-nya, baca file route-nya langsung,
  jangan asumsi publik.

## CORS

- Allowlist ketat: 4 origin di tabel klien di atas, diatur lewat
  `CORS_ALLOWED_ORIGINS` (wajib diisi di production).
- Setiap respons membawa `Cache-Control: private, no-store`, termasuk
  preflight, supaya edge cache tidak pernah menyimpan respons API
  dengan header CORS basi.
- Origin di luar allowlist dijawab 403, bukan 500.
- Bridge sementara: header `x-api-key` masih diizinkan di preflight
  karena klien production lama masih mengirimnya. Server mengabaikan
  nilainya (auth JWT-only). Hapus baris ini setelah semua klien
  redeploy tanpa header legacy.

## Database

- PostgreSQL (Neon di production). Model di `prisma/schema.prisma`,
  migrasi di `prisma/migrations/`.
- Production: `npx prisma migrate deploy`.
- Jangan jalankan migrasi tanpa backup database dulu.

## Deploy

Merge ke `main` → Vercel auto-deploy. Urutan aman: API dulu, tunggu
stabil, baru klien. Rollback: redeploy commit `main` sebelumnya dan
restore DB bila migrasi/data berubah.

## Yang sengaja dipertahankan

- Semua upload, termasuk attendances, pakai storage S3-compatible. Wiring Cloudinary lama sudah dihapus karena tidak ada yang memakai.
- Pembuatan transaksi Midtrans masih hidup (lihat di atas), tapi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_SNAP_URL` tidak di-set di production, jadi pembuatan transaksi gagal di production. Yang mati hanya callback-nya.
  hanya callback-nya.
- Notifikasi Firebase masih hidup (`src/utils/firebase-config.ts`).
- Template sertifikat event masih hidup lewat attendances; template
  dikirim sebagai buffer oleh caller.
- Kedua lockfile (`package-lock.json` dan `yarn.lock`) sudah ada sejak
  lama; pakai satu package manager secara konsisten per folder,
  jangan dicampur.

## Dokumen lain

- [CONTRIBUTING.md](CONTRIBUTING.md): cara berkontribusi.
- [SECURITY.md](SECURITY.md): cara melaporkan kerentanan.
- [LICENSE.md](LICENSE.md): lisensi MIT.
