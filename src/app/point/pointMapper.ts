import { Member, Point, User } from "@prisma/client";
import { ImagePath } from "../../utils/ImagePath";
import { BUCKET_FOLDER } from "../../utils/UploadFileToStorage";

export interface MemberData extends Member {
  Generation: {
    id: number;
    year: number;
  };
}

export interface UserData extends User {
  Member: MemberData;
  Point: Point[];
}

export const getUserPointsDTOMapper = (users: UserData[]) => {
  const userPoints = users.map((item) => {
    return {
      id: item.id,
      name: item.name,
      nim: item.nim,
      photo: item.photo
        ? ImagePath(`${BUCKET_FOLDER.user}/${item?.photo}`)
        : null,
      generation: {
        id: item.Member?.Generation.id,
        year: item.Member?.Generation.year,
      },
      point: item.Point.reduce((total, point) => total + point.point, 0),
    };
  });
  const data = userPoints.sort((a, b) => b.point - a.point);
  const finalData = data.map((item, index) => ({
    id: item.id,
    rank: index + 1,
    name: item.name,
    nim: item.nim,
    photo: item.photo,
    generation: item.generation,
    point: item.point,
  }));

  const topThree = finalData.slice(0, 3);
  const reordered = topThree.sort((a, b) => {
    const order = [2, 1, 3];
    return order.indexOf(a.rank) - order.indexOf(b.rank);
  });
  return {
    topThree: reordered,
    other: finalData,
  };
};
