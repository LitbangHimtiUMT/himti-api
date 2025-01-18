import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getMemberById } from "../members/members.repository";
import { StructuralBodyDTO } from "./struktural.dto";
import {
  getStructuralByAnggotaId,
  getStructuralByJabatan,
} from "./struktural.repository";
import { jabatanChecker } from "./struktural.service";

export const strukturalValidate = async ({
  memberId,
  jabatan,
}: StructuralBodyDTO) => {
  if (!memberId) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.ANGGOTA_ID,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const anggotaIsStruktural = await getStructuralByAnggotaId(memberId);
  if (anggotaIsStruktural) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.ANGGOTA_STRUKTURAL,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (!jabatan) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.JABATAN,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const jabatanIsValid = jabatanChecker(jabatan as string);

  if (jabatan && !jabatanIsValid) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.JABATAN,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const jabatanIsAlready = await getStructuralByJabatan(jabatan);
  if (jabatanIsAlready && jabatanIsAlready.jabatan !== "KETUA_DEPARTMENT") {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.JABATAN,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const matchAnggota = await getMemberById(memberId);

  if (!matchAnggota) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ANGGOTA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
};
