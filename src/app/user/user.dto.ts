import { Role } from "@prisma/client"
import { Query } from "../../interface/Query"

export interface AbsensiDTO {
    userId?: string
    acaraId: string
    image: string,
    coordinate: string
}

export interface TokenTypes {
    id: string
}

export interface IFilterUser extends Query {
    search?: string
    role?: Role
    roles?: string
}

export interface UserRequestBodyDTO {
    name: string
    email: string
    password: string
    role?: Role
}

export interface UpdateUserBodyRequest {
    name?: string
    email?: string
}

export interface UserDTO {
    id: string
    name: string
    email: string
}