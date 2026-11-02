import crypto from "crypto";

export const random = (): number => {
    return crypto.randomInt(100000, 1000000);
}