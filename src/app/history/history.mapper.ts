import { ImagePath } from "../../utils/image-path";
import { BUCKET_FOLDER } from "../../utils/upload-file-to-storage";
import { HistoryData } from "./history.interface";

export const getHistoriesMapper = (data: HistoryData[]) => {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    module: item.module,
    flag: item.flag,
    actionId: item.actionId,
    statusCode: item.statusCode,
    createdAt: item.createdAt,
    user: item.user ? {
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        photo: item.user.photo ? ImagePath(`${BUCKET_FOLDER.user}/${item.user.photo}`) : null,
        role: item.user.role,
    } : null
  }));
};
