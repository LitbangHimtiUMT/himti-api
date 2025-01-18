import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { getUserById } from "../authentication/auth.repository";
import { getMeetingById } from "../meetings/meetings.repository";
import { getMemberByNIM } from "../members/members.repository";
import { AttendanceDTO } from "./attendances.dto";

export const createAttendanceValidate = async ({
  meetingId,
  image,
  userId,
  coordinate,
}: AttendanceDTO) => {
  if (!meetingId) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.SUB_ACARA_ID,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const getSubAcara = await getMeetingById(meetingId as string);
  if (!getSubAcara) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.SUB_ACARA,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const isExpired = new Date(getSubAcara.endTime as Date) < new Date();

  if (!image) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.IMAGE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const getUser = await getUserById(userId as string);
  if (!getUser) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const getAnggota = await getMemberByNIM(getUser.nim as string);
  if (getUser && !getAnggota) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ANGGOTA,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  if (!coordinate) {
    return new ErrorApp(
      MESSAGES.ERROR.REQUIRED.COORDINATE,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  if (isExpired) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ABSENSI_SUBACARA_EXPIRED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
};
