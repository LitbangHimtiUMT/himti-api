import { User } from "@prisma/client";
import { UserDTO } from "./user.dto";

export const userDTOMapper = (user: User): UserDTO => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    }
}

export const getUsersDTOMapper = (user: User[]): UserDTO[] => {
    return user.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
    }))
}
