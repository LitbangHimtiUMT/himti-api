# Matriks Route Final — HIMTI API (setelah Fase 1–3 + clean batch 2)

Dokumen ini adalah matriks final di branch `fix/himti-api-auth`, bukan
matriks Fase 0. Fase 0 memetakan 172 endpoint di `main` lama, 62 di
antaranya tanpa auth sama sekali. Tabel di bawah menyatakan gate yang
berlaku **sekarang**. Kalau ada route yang tidak ada di sini, perlakukan
sebagai belum diaudit — jangan asumsi publik.

Konvensi:

- **Publik** = tanpa JWT, dan hanya untuk baca yang memang diputuskan
  publik, atau satu-satunya tulis publik di bawah.
- **JWT** = token access yang signature-nya terverifikasi dan user-nya ada.
- **Admin** = JWT + role ADMIN atau SUPER_ADMIN (kecuali disebutkan
  SUPER_ADMIN saja).
- **Mentor/Admin** = gate role mentor (record mentor nyata) atau admin.
- **Ownership LMS** = selain gate role, harus lolos `canAccessClass` /
  `canManageClass` di `src/utils/lms-access.ts` (peserta hanya kelasnya,
  mentor hanya kelas yang ia buat/ampu, admin semua kelas).

## Auth dan profil

| Mount | Gate | Catatan |
| --- | --- | --- |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/login-admin`, `POST /auth/forgot-password`, OTP | Publik + rate limit | Register menetapkan role sendiri (USER, atau ANGGOTA bila NIM + kode anggota cocok). |
| `POST /auth/refresh-token` | Refresh token terverifikasi sinkron | Kontrak sama; kunci turunan lama dipertahankan agar token LMS beredar tetap jalan. Fase 4 ganti kunci + forced re-login. |
| `GET /auth/logout` | JWT tanpa expiry (signature wajib valid) | Khusus logout. |
| `GET /auth/token` | JWT | Dipakai CMS/LMS untuk cek token. LMS lama memakai `GET /check` yang tidak ada mount-nya; klien diperbaiki ke `/auth/token`. |
| `POST /auth/biometric` | 410, service dihapus | Jangan diaktifkan tanpa second factor nyata. |
| `/profile` | JWT | `userId` dari middleware, bukan decode sendiri. |

## Modul publik dan admin umum

| Mount | Baca | Tulis |
| --- | --- | --- |
| `/prestasi`, `/acara`, `/dosen/public`, `/anggota/public`, `/anggota/generations`, `/struktural` (baca), `/prodi-structural`, `/periode`, `/registration-type`, `/business`, `/contact-info`, `/version` | Publik | Admin |
| `/struktural` tulis, `/angkatan` (generations), `/dosen`, `/anggota`, `/histories`, `/event-meeting`, `/meeting`, `/points/member`, `/notification`, `/user-fcm`, `/potential-users`, `/potential-user-keys` | JWT / Admin sesuai route | Admin (notifikasi dan user-fcm kini admin, bukan telanjang) |
| `/event-registration` | Admin | **POST publik** (pendaftaran terbuka) + rate limit dan validasi; sisanya admin |
| `/sub-acara` | Publik | Admin. Provisional, model anak Event. |
| `/user` | JWT / Admin | Admin. Catatan lama: `GET /user/admin` tertimbun `GET /user/:userId` dan belum diperbaiki urutannya — jangan andalkan route itu. |
| `/absensi` (attendances) | JWT | JWT / Admin sesuai route. Generate sertifikat attendance memakai template buffer dari caller. |

## LMS (`/lms`)

| Area | Gate |
| --- | --- |
| Katalog kelas (`GET /lms/classes`, detail) | Publik untuk kelas publish, atau `optionalAuth` (token palsu ditolak 403, bukan jadi anonim). |
| Kelas tulis: create, update, delete, publish, invite-mentor | Mentor/Admin + ownership. Update tadinya tanpa cek kepemilikan — kini wajib manage. Delete creator-only menjadi manage. Publish creator-atau-admin, bukan manage umum. |
| Sessions, modules | Ownership: baca wajib access kelas, tulis wajib manage kelas. |
| Assignments dan submissions | Ownership. Non-manager hanya melihat submission miliknya. Get submission by-id: owner/manager. Approve/reject: manager. |
| Class-participants | Self-enrol wajib kelas PUBLISH + harga 0 + anti-duplikat. List peserta wajib manage kelas (dulu hanya JWT). |
| Completed-modules, completed-classes | Wajib access kelas. |
| Certificates | Generate wajib access kelas + guard kelas 0 modul. List sudah filter per user. `GET /lms/certificates/file` by-code saja + rate limit. |
| Course evaluate | JWT. |
| Mentors (`GET /lms/mentors`) | Dulu header-only; kini JWT. CMS yang dulu mengirim header harus migrasi ke JWT. |
| Transactions callback | 410. Pembuatan transaksi kelas berbayar masih hidup. |

## Dinonaktifkan / dihapus

| Endpoint / area | Status |
| --- | --- |
| `POST /initial` | Dihapus dari routing. |
| `POST /seed-generation-2022` | Dihapus dari routing; logika seed tidak dipertahankan runnable. |
| `/scheduling-notification-meeting` | Dihapus dari routing. |
| `POST /lms/transactions/callback` | Stub 410. |
| `POST /auth/biometric` | Stub 410, service + controller dihapus (clean batch 2). |
| Ticket-support | Route sudah yatim sejak `main` lama; file route dihapus Fase 3, model + tabel dihapus clean batch 2 (`20261102_drop_ticket_suport`). |
| `GET /generate` (ZIP kosong) | Dihapus Fase 3. |
| `GET /user-fcm` telanjang, `GET /points/member` telanjang, notification POST telanjang, business POST telanjang, registration-type telanjang | Semua kini bergate (lihat tabel modul umum). |

## Yang belum selesai di dokumen ini

- Urutan `GET /user/admin` vs `GET /user/:userId` belum diperbaiki.
- Unifikasi storage attendances (Cloudinary) belum dilakukan.
- Fase 4 (kunci refresh dedicated, rotasi, forced re-login) belum dilakukan.
- Smoke test runtime tiga klien belum dilakukan (tidak ada DB live di
  container); matriks ini adalah hasil baca kode + `tsc`, bukan hasil
  smoke production.
