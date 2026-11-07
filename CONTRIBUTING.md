# Berkontribusi ke HIMTI API

Terima kasih sudah mau berkontribusi. Baca [README.md](README.md) dulu
sebelum mulai, supaya paham stack, auth, dan struktur modulnya.

## Setup

```bash
git clone https://github.com/LitbangHimtiUMT/himti-api.git
cd himti-api
npm install
cp .env.example .env   # isi nilainya, jangan pernah commit file .env
npx prisma generate
npm run dev
```

Pakai npm secara konsisten. Jangan campur dengan yarn di folder ini
(kedua lockfile ada sejak lama, tapi satu package manager per folder).

## Branch dan pull request

- Branch dari `main`. `main` adalah production (Vercel auto-deploy
  dari sini). Branch `dev` adalah default GitHub yang lama dan
  direncanakan dihapus; pull request ditujukan ke `main`, bukan `dev`.
- Nama branch: `fix/<topik>`, `feat/<topik>`, `docs/<topik>`.
  Contoh: `fix/cors-cache-control`, `feat/sub-acara-rundown`.
- Jangan push langsung ke `main`. Semua perubahan lewat pull request.
- Satu pull request untuk satu perubahan logis. Kalau perubahannya
  beda topik, pisah jadi pull request terpisah.
- Di deskripsi pull request tulis: apa yang diubah, kenapa, dampaknya,
  dan bukti pengujian (perintah yang dijalankan + hasilnya).

## Commit

- Satu commit per perubahan logis.
- Pesan commit gaya engineer manusia: terse, conventional commits
  per-scope, tanpa frasa AI. Contoh: `fix(api): ...`,
  `feat(lms): ...`, `docs(readme): ...`.
- Jangan pakai em-dash di pesan commit.

## Verifikasi sebelum push

Jalankan ini dan pastikan semuanya lolos:

```bash
npm run build   # prisma generate && tsc
npm run lint    # eslint ./src
npx tsc --noEmit
```

Build lolos saja tidak cukup. Sebelum push, audit perubahanmu:
audit logika, cek duplikasi kode, cek tabrakan antar fitur, cari
logika yang miss, dan cek keamanan (pemisahan auth admin vs user,
validasi input, secret tidak bocor ke repo/log). Kalau ada bug,
audit keseluruhan dulu, jangan tunnel-vision di satu layer; tiap
hipotesis diverifikasi sebelum menulis kode fix.

## Yang tidak boleh dilakukan

- Jangan commit secret apa pun: password, token, API key, private key,
  atau nilai variabel environment. Nilai rahasia hanya di Vercel
  dashboard (production) dan file `.env` lokal.
- Jangan menulis secret ke log, issue, pull request, atau chat.
- Jangan mengaktifkan lagi endpoint yang sudah dimatikan (lihat
  README bagian Auth) tanpa keputusan eksplisit maintainer.
- Jangan mengubah perilaku CORS, allowlist origin, atau auth tanpa
  menyebutkannya jelas di deskripsi pull request.
- Jangan menjalankan migrasi di database production tanpa backup dulu.

## Melaporkan bug

Buka issue dengan: langkah reproduksi, hasil yang diharapkan,
hasil yang sebenarnya, dan log yang relevan (dengan secret
disensor). Kalau bug-nya soal keamanan, jangan buka issue publik,
ikuti [SECURITY.md](SECURITY.md).

## Kredensial

Pakai akses GitHub-mu sendiri (GitHub CLI atau token pribadimu).
Jangan pernah membagikan token atau password ke orang lain, dan
jangan menempelkannya di issue, pull request, atau chat.
