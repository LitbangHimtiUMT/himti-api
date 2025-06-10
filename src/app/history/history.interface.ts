import { History, HistoryFlag, HistoryModule, User } from "@prisma/client";
import { Query } from "../../interface/Query";

export interface HistoryQuery extends Query {
    module?: HistoryModule
    flag?: HistoryFlag
    actionId?: string
}

export interface HistoryData extends History {
    user: User | null
}