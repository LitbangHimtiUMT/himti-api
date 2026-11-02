import { History, HistoryFlag, HistoryModule, User } from "@prisma/client";
import { Query } from "../../interface/Query";

export interface HistoryQuery extends Query {
    module?: HistoryModule
    flag?: HistoryFlag
    actionId?: string
}

export interface HistoryData extends History {
    // Narrowed on purpose: the repository selects only these user
    // fields (never the password hash) for history listings.
    user: Pick<User, "id" | "name" | "email" | "photo" | "role"> | null;
}