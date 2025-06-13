import { ImagePath } from "../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../utils/upload-file-to-storage";
import { ClassMentorData } from "./class-mentor.interface";

export const getClassMentorMapper = (data: ClassMentorData[]) => {
  return data.map((item) => ({
    id: item.id,
    user: {
      id: item.user.id,
      name: item.user.name,
      email: item.user.email,
      photo: item.user.photo
        ? ImagePath(`${BUCKET_FOLDER.user}/${item.user.photo}`)
        : null,
    },
  }));
};
