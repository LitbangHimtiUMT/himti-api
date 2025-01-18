import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { VersionBodyRequest } from "./version.dto";
import { getVersion, getVersionById, updateVersion } from "./version.repository";

export const updateVersionService = async (
  versionId: number,
  body: VersionBodyRequest
) => {
  const version = await getVersionById(versionId);

  if (!version) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.VERSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  return await updateVersion(version.id, body);
};

export const getVersionService = async () => {
  const version = await getVersion();

  if (!version) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.VERSION,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  return version;
};
