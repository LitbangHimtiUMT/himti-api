import dotenv from "dotenv";
import { MESSAGE_CODE } from "../../utils/error-code";
import { statusValue } from "../../utils/filter-status";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { MemberBodyDTO } from "./members.dto";
import { MemberData, memberMapper } from "./members.mapper";
import {
  createMember,
  deleteMember,
  getAllMember,
  getMemberById,
  getMemberByNIM,
  getMemberCount,
  getMemberUnderFiveYear,
  updateMember,
  updateMemberNonActive,
} from "./members.repository";
import { AnggotaModelTypes, IFilterAnggota } from "./members.types";
import { anggotaValidate } from "./members.validate";
import { exportMembersToExcel } from "./members.export";
import { prisma } from "../../config";

dotenv.config();

export const getGenerationsListService = async () => {
  // "Angkatan aktif" = angkatan yang punya minimal 1 anggota isActive: true.
  // Ini lebih akurat daripada Generation.isActive (yang di DB semuanya true).
  const generations = await prisma.generation.findMany({
    where: {
      isActive: true,
            member: {
        some: { isActive: true },
      },
    },
    select: { id: true, year: true },
    orderBy: { year: "asc" },
  });
  return { data: generations };
};

export const createAnggotaService = async ({
  name,
  nim,
  generationId,
  isActive,
}: MemberBodyDTO) => {
  const validate = await anggotaValidate({
    name: name as string,
    nim,
    generationId,
  });
  if (validate instanceof ErrorApp) {
    return new ErrorApp(validate.message, validate.statusCode, validate.code);
  }

  const anggota = await createMember({
    generationId,
    isActive,
    name,
    nim,
  });
  return anggota;
};

export const getMembersService = async ({
  search,
  page = 1,
  perPage = 10,
  year,
  generationId,
  status,
}: IFilterAnggota) => {
  const memberStatus = statusValue(status as string);
  const gen = year && year.toLowerCase() == "all" ? undefined : year;
  const [member, totalData] = await Promise.all([
    getAllMember({
      search,
      page,
      perPage,
      year: gen,
      generationId,
      status: memberStatus,
    }),
    getMemberCount(
      { search, year, generationId, status: memberStatus as unknown as string },
      memberStatus
    ),
  ]);

  const memberActiveUnderFiveYear = await getMemberUnderFiveYear();
  if (memberActiveUnderFiveYear) {
    await updateMemberNonActive();
  }

  const data = memberMapper(member as MemberData[]);
  const meta = Meta(page, perPage, totalData);

  return {
    data,
    meta,
  };
};

export const deleteAnggotaService = async (id: string) => {
  const findAnggota = await getMemberById(id as string);

  if (!findAnggota) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ANGGOTA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const anggota = await deleteMember(id as string);
  return anggota;
};
export const updateAnggotaService = async ({
  id,
  name,
  isActive,
  generationId,
  nim,
}: MemberBodyDTO) => {
  const matchAnggota = await getMemberById(id as string);

  if (!matchAnggota) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ANGGOTA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if (nim) {
    const memberNIM = await getMemberByNIM(nim.toString());
    if (memberNIM && memberNIM.id !== matchAnggota.id) {
      return new ErrorApp(
        MESSAGES.ERROR.ALREADY.GLOBAL.NIM,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
  }
  const updateFields: Partial<MemberBodyDTO> = { id };

  if (name !== undefined) updateFields.name = name;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (generationId !== undefined) updateFields.generationId = generationId;
  if (nim !== undefined) updateFields.nim = nim.toString();

  const anggota = await updateMember(updateFields);

  return anggota;
};

export const getMemberByIdService = async (id: string) => {
  const anggota = await getMemberById(id as string);
  if (!anggota) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ANGGOTA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return anggota;
};

export const exportMembersService = async ({
  generationId,
}: {
  generationId?: string;
}) => {
  try {
    // Get members with optional generation filter
    const members = await getAllMember({
      generationId,
      perPage: 10000, // Get all members
      page: 1,
    });

    if (!members || members.length === 0) {
      return new ErrorApp(
        "No members found to export",
        404,
        MESSAGE_CODE.NOT_FOUND
      );
    }

    // Map to AnggotaModelTypes format
    const mappedMembers: AnggotaModelTypes[] = members.map((member: any) => ({
      id: member.id,
      nim: member.nim,
      name: member.name,
      email: member.User?.email || member.email,
      angkatanId: member.generationId,
      angkatan: {
        id: member.Generation?.id || "",
        year: member.Generation?.year || "",
        isActive: member.Generation?.isActive || false,
      },
      instagram: member.instagram,
      facebook: member.facebook,
      twitter: member.twitter,
      linkedin: member.linkedin,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));

    // Get generation year for filename
    const generationYear = members[0]?.Generation?.year;

    // Generate Excel file
    const result = await exportMembersToExcel(mappedMembers, generationYear);

    return result;
  } catch (error) {
    console.error("Error exporting members:", error);
    return new ErrorApp(
      "Failed to export members",
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }
};
