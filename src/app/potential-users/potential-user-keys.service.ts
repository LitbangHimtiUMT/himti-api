import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";
import {
  createKey,
  deleteKeyById,
  findAllKeys,
  findKeyByString,
  CreatePotentialUserKeyDTO,
} from "./potential-user-keys.repository";

export const createPotentialUserKeyService = async (data: CreatePotentialUserKeyDTO) => {
  const existing = await findKeyByString(data.key);
  if (existing) {
    return new ErrorApp("Key is already exist", 400, MESSAGE_CODE.BAD_REQUEST);
  }
  return await createKey(data);
};

export const getPotentialUserKeysService = async () => {
  return await findAllKeys();
};

export const deletePotentialUserKeyService = async (id: string) => {
  return await deleteKeyById(id);
};
