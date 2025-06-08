import { ClassParticipant, Mentor, User } from "@prisma/client";
import { BUCKET_FOLDER } from "../../../utils/upload-file-to-storage";
import { ImagePath } from "../../../utils/image-path";

export interface ParticipantData extends ClassParticipant {
    user: User & {
        mentor: Mentor | null
    }
}

export const getParticipantsMapper = (data: ParticipantData[]) => {
    return data.map(item => ({
        id: item.id,
        user: {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            photo: item.user.photo ? ImagePath(`${BUCKET_FOLDER.user}/${item.user.photo}`) : null,
            role: item.user.role,
            isMentor: !!item.user.mentor
        }
    }))
}