# Kebijakan Keamanan

## Versi yang didukung

Hanya branch `main` (production) yang menerima perbaikan keamanan.

| Branch | Didukung |
| --- | --- |
| `main` | Ya |
| Branch lain / commit lama | Tidak |

## Melaporkan kerentanan

Jangan buka issue publik untuk kerentanan keamanan.

Laporkan lewat **GitHub Security Advisory** (private vulnerability
reporting): buka tab **Security** di repo ini, lalu **Report a
vulnerability**. Laporanmu hanya terlihat oleh maintainer sampai
perbaikan selesai.

Sertakan di laporan:

- Deskripsi kerentanan dan dampaknya
- Langkah reproduksi
- Endpoint atau versi yang terdampak
- Saran perbaikan, kalau ada

Maintainer berusaha merespons dalam beberapa hari kerja. Perbaikan
dikirim ke `main`, di-deploy, baru setelah itu kerentanan boleh
dibicarakan publik (coordinated disclosure).

## Aturan pengujian

- Jangan menguji kerentanan di production (`himti-api.vercel.app`)
  tanpa izin. Pakai instance lokal.
- Jangan mengakses, mengubah, atau menghapus data pengguna lain.
- Jangan melakukan denial-of-service atau pengujian beban.
- Jangan membocorkan kerentanan sebelum perbaikan rilis.

## Hal yang sudah diketahui (bukan temuan baru)

- Header legacy `x-api-key` masih diizinkan di preflight CORS sebagai
  bridge sementara untuk klien production lama. Server mengabaikan
  nilainya; auth sepenuhnya JWT-only. Baris ini dihapus setelah semua
  klien redeploy tanpa header legacy.

## Di luar cakupan

- Kerentanan di klien (web utama, CMS, LMS): laporkan ke repo
  masing-masing.
- Social engineering dan keamanan fisik.
- Laporan tanpa bukti reproduksi.
