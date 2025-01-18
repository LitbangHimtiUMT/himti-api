import { Achievement } from "@prisma/client";
import { AchievementDTO } from "./achievements.dto";

export const getAchievementDTOMapper = (data: Achievement[]): AchievementDTO[] => {
    return data.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image
    }))
}