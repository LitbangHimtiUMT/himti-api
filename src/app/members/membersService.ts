import dotenv from "dotenv";
import { MESSAGE_CODE } from "../../utils/error-code";
import { statusValue } from "../../utils/filter-status";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { MemberBodyDTO } from "./membersDTO";
import { MemberData, memberMapper } from "./membersMapper";
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
} from "./membersRepository";
import { IFilterAnggota } from "./membersTypes";
import { anggotaValidate } from "./membersValidate";

dotenv.config();

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
      status: memberStatus,
    }),
    getMemberCount(
      { search, year, status: memberStatus as unknown as string },
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
