import { Generation } from "@prisma/client";

export const generationMapper = (generations: Generation[]) => {
  const data = generations.map((generation) => {
    const now = new Date().getFullYear();

    // Badge list harus nurut toggle manual di DB, BUKAN cuma hitung tahun:
    // dulu isActive dihitung dari tahun saja, jadi angkatan yang sudah
    // dimatikan manual (mis. 2022) tetap tampil ACTIVE sampai 5 tahun berlalu.
    // Aturan auto-off 5 tahun tetap dipertahankan sebagai AND.
    return {
      id: generation.id,
      year: generation.year,
      isActive: generation.isActive && Number(generation.year) > now - 5,
    };
  });
  return data;
};
