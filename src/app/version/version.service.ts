import { HistoryModule } from "@prisma/client";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { historyUpdateFlag } from "../history/history.repository";
import { VersionBodyRequest } from "./version.dto";
import {
  getVersion,
  getVersionById,
  updateVersion,
} from "./version.repository";

export const updateVersionService = async (
  createdBy: string,
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

  if (body.androidVersion ?? body.iosVersion) {
    const messages: string[] = [];

    if (body.androidVersion) {
      messages.push(
        `Android Version from ${version.androidVersion} to ${body.androidVersion}`
      );
    }

    if (body.iosVersion) {
      messages.push(
        `IOS Version from ${version.iosVersion} to ${body.iosVersion}`
      );
    }
    await historyUpdateFlag({
      module: HistoryModule.VERSION,
      title: `Update Version - ${messages.join(", ")}`,
      actionId: `${version.id}`,
      createdBy,
    });
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
