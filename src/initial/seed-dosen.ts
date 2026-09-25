import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables (.env) sebelum PrismaClient di-instansiasi.
dotenv.config();

const prisma = new PrismaClient();

interface DosenSeed {
  name: string;
  nidn: string;
  sintaId: string;
  lesson: string;
}

// Data sumber: sinar.umt.ac.id/programs/55201
// Field `name` disamakan dengan nama seeder awal supaya bisa di-match & update.
const dosenData: DosenSeed[] = [
  { name: "Agung Wibowo, M.Kom", nidn: "0408108502", sintaId: "6713484", lesson: "Pengajaran" },
  { name: "Ajang Sopandi, M.Kom", nidn: "0405038201", sintaId: "6738472", lesson: "Pengajaran" },
  { name: "Ali Firdaus, M.Kom", nidn: "0405037403", sintaId: "6149198", lesson: "Pengajaran" },
  { name: "Arief Herdiansah, S.Kom, MTI", nidn: "0402117101", sintaId: "6704759", lesson: "Pengajaran" },
  { name: "Arif Kurniawan, M.Kom", nidn: "0425048702", sintaId: "6713684", lesson: "Pengajaran" },
  { name: "Dedy Alamsyah, M.Kom", nidn: "0410047807", sintaId: "5974844", lesson: "Pengajaran" },
  { name: "Desi Nurnaningsih, M.Kom", nidn: "0425128509", sintaId: "6147002", lesson: "Pengajaran" },
  // Tidak ada di dump baru: Dr. Ir. Sumardi Sadi, Dr. Lenni, Dr. Mahpud, Dr. Warsito, Sukry Harly
  // → NIDN sementara tetap seed_xxx sampai data resmi tersedia. Bisa di-update manual nanti.
  { name: "Dr. Lukman Azhari, M.Kom", nidn: "0401078501", sintaId: "6713678", lesson: "Pengajaran" },
  { name: "Dr. Nur Choiro Siregar, M.Pd", nidn: "0415118904", sintaId: "6852790", lesson: "Pengajaran" },
  { name: "Dyas Yudi Priyanggodo, M.Kom", nidn: "0415059201", sintaId: "6659448", lesson: "Manajemen" },
  { name: "Faridi, M.Kom", nidn: "0401018010", sintaId: "6713485", lesson: "Manajemen" },
  { name: "Fauyhi Eko Nugroho, M.Kom", nidn: "0431128302", sintaId: "6679287", lesson: "Pengajaran" },
  { name: "Firdiansyah Firdaus Basri, M.Kom", nidn: "0324048101", sintaId: "6872984", lesson: "Pengajaran" },
  { name: "Hengki Rusdianto, M.Kom", nidn: "0403098303", sintaId: "6779458", lesson: "Pengajaran" },
  { name: "Ivan Nur Amanda, M.Kom", nidn: "0430048605", sintaId: "6713551", lesson: "Pengajaran" },
  { name: "Jully Triansyah, M.Kom", nidn: "0310078104", sintaId: "6713419", lesson: "Pengajaran" },
  { name: "Liesnaningsih, M.Kom", nidn: "0406098701", sintaId: "6659780", lesson: "Pengajaran" },
  { name: "Muhamad Luthfi Aksani, M.Kom", nidn: "0413038303", sintaId: "6796956", lesson: "Pengajaran" },
  { name: "Muhammad Jonni, M.Kom", nidn: "0401067412", sintaId: "6871298", lesson: "Pengajaran" },
  { name: "Nofitri Heriyani, M.Kom", nidn: "0401118702", sintaId: "6872932", lesson: "Pengajaran" },
  { name: "Nur Shobi Mabrur, M.Kom", nidn: "0421038604", sintaId: "6713681", lesson: "Pengajaran" },
  { name: "Nurcholis Ali Sya'Bana, M.Kom", nidn: "0429029204", sintaId: "6872888", lesson: "Pengajaran" },
  { name: "Nurdiana Handyani, M.Kom", nidn: "0405028701", sintaId: "6149036", lesson: "Pengajaran" },
  { name: "Nurhayati, M.Kom", nidn: "0409018304", sintaId: "6835206", lesson: "Pengajaran" },
  { name: "Rachmat Destriana, M.Kom", nidn: "0422128002", sintaId: "6679286", lesson: "Pengajaran" },
  { name: "Ri Sabti Septarini, M.Kom", nidn: "0314098501", sintaId: "6658709", lesson: "Pengajaran" },
  { name: "Rima Rizqi Wijayanti, S.Si, MMSI", nidn: "0422058606", sintaId: "6658583", lesson: "Pengajaran" },
  { name: "Rohmat Taufiq, ST, M.Kom", nidn: "0419038004", sintaId: "6078210", lesson: "Manajemen" },
  { name: "Ryan Zulham Ramadhani, M.Kom", nidn: "0413049001", sintaId: "6873104", lesson: "Pengajaran" },
  { name: "Sofian Sidiq, M.Kom", nidn: "0419098901", sintaId: "6872913", lesson: "Pengajaran" },
  { name: "Sri Mulyati, M.Kom", nidn: "0425066505", sintaId: "6713400", lesson: "Pengajaran" },
  { name: "Syepry Maulana Husain, S.Kom, MTI", nidn: "0419108607", sintaId: "6674526", lesson: "Pengajaran" },
  { name: "Umbar Riyanto, M.Kom", nidn: "0410047107", sintaId: "5992982", lesson: "Pengajaran" },
  { name: "Yani Sugiyani, MM, M.Kom", nidn: "0419057801", sintaId: "6107872", lesson: "Manajemen" },
  { name: "Yanuardi, M.Kom", nidn: "0405017601", sintaId: "6713558", lesson: "Pengajaran" },
  { name: "Yeni Daniarti, M.Pd", nidn: "0406078402", sintaId: "6706931", lesson: "Pengajaran" },
  // Dosen baru dari dump (belum ada di seeder lama):
  { name: "Rifqi Riadhi, M.Kom", nidn: "0406068902", sintaId: "6149192", lesson: "Pengajaran" },
  { name: "Hanifah Jihan, M.Kom", nidn: "0418049003", sintaId: "6872985", lesson: "Pengajaran" },
  { name: "Alfian, M.T", nidn: "0410098106", sintaId: "6872995", lesson: "Pengajaran" },
];

async function main() {
  console.log("🌱 Seeding & updating dosen data (with NIDN & SINTA ID)...");
  let created = 0;
  let updated = 0;

  for (const dosen of dosenData) {
    // Cari existing by name (case-insensitive) atau nidn yang sudah ter-set.
    const existing = await prisma.lecturer.findFirst({
      where: {
        OR: [
          { name: { equals: dosen.name, mode: "insensitive" } },
          { nidn: dosen.nidn },
        ],
      },
    });

    if (existing) {
      // Update NIDN + sintaId (dan lesson kalau kosong).
      // Cast ke `any` karena Prisma Client belum di-regenerate untuk sintaId.
      // Setelah restart dev server dan run `npx prisma generate`, cast bisa dihapus.
      await prisma.lecturer.update({
        where: { id: existing.id },
        data: {
          nidn: dosen.nidn,
          sintaId: dosen.sintaId,
          lesson: existing.lesson || dosen.lesson,
          isActive: true,
        } as any,
      });
      updated++;
      console.log(`  🔄 Updated: ${dosen.name} → NIDN ${dosen.nidn}, SINTA ${dosen.sintaId}`);
    } else {
      await prisma.lecturer.create({
        data: {
          name: dosen.name,
          nidn: dosen.nidn,
          sintaId: dosen.sintaId,
          lesson: dosen.lesson,
          isActive: true,
        } as any,
      });
      created++;
      console.log(`  ✅ Created: ${dosen.name}`);
    }
  }

  console.log(`\n✅ Selesai: ${created} dosen dibuat, ${updated} di-update.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeder error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });