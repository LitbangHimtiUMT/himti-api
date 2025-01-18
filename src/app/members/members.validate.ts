import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getGenerationById } from "../generations/generations.repository";
import { MemberBodyDTO } from "./members.dto";
import { getMemberByNIM } from "./members.repository";

export const anggotaValidate = async ({ nim, generationId }: MemberBodyDTO) => {
  // if (typeof nim !== 'number') {
  //     return new ErrorApp(MESSAGES.ERROR.INVALID.NIM.FORMAT, 400, MESSAGE_CODE.BAD_REQUEST)
  // }
  const matchNIM = await getMemberByNIM(String(nim));
  if (matchNIM) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.GLOBAL.NIM,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (!generationId) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.ANGKATAN_ID,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const matchAngkatan = await getGenerationById(generationId);

  if (!matchAngkatan) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.ANGKATAN.ID,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
};
