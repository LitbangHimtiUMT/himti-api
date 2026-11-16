import { ImagePath } from "../../../utils/image-path";
import { BUCKET_FOLDER } from "../../../utils/upload-file-to-storage";
import { ReviewData, ReviewDTO } from "./reviews.dto";

export const getReviewMapper = (item: ReviewData): ReviewDTO => ({
  id: item.id,
  rating: item.rating,
  text: item.text,
  createdAt: item.createdAt,
  user: {
    id: item.user.id,
    name: item.user.name,
    photo: item.user.photo
      ? ImagePath(`${BUCKET_FOLDER.user}/${item.user.photo}`)
      : null,
  },
});

export const getReviewsMapper = (data: ReviewData[]): ReviewDTO[] => {
  return data.map((item) => getReviewMapper(item));
};
