import { Member, Point, User } from "@prisma/client";

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
    generation: item.generation,
    point: item.point,
  }));
  const topFour = finalData.slice(0, 4);
  const other = finalData.slice(4);
  return {
    topFour,
    other,
  };
};
