import { EventType } from "@prisma/client"
import { Query } from "../../interface/Query"

export interface EventBodyDTO {
    id?: string
    name?: string
    description?: string,
    image?: string,
    isOpen?: boolean,
    startTime?: Date,
    endTime?: Date
}
export interface CreateEventBodyRequest {
    id?: string
    name?: string
    description?: string,
    image?: Express.Multer.File | string,
    isOpen?: boolean,
    startTime?: Date | string,
    endTime?: Date | string
}

export interface EventDTO {
    id: string
    name: string
    image: string
    startTime: Date
    endTime: Date
    description?: string | null
    isOpen: boolean
}

export interface QueryEvent extends Query {
    type?: EventType
}