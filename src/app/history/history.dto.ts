import { HistoryFlag, HistoryModule } from "@prisma/client"

export interface HistoryCreationDTO {
    title: string
    module: HistoryModule
    flag: HistoryFlag
    actionId?: string
    createdBy?: string
    statusCode?: string
    endpoint?: string
}