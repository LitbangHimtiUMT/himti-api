import {
  createContact,
  deleteContact,
  findAllContacts,
  findContactById,
  findContactByKey,
  updateContact,
  upsertContact,
} from "./contact-info.repository";
import { CreateContactInfoDTO, UpdateContactInfoDTO } from "./contact-info.dto";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";

export const getAllContactsService = async () => {
  return await findAllContacts();
};

export const createContactService = async (data: CreateContactInfoDTO) => {
  const existing = await findContactByKey(data.key);
  if (existing) {
    return new ErrorApp("Contact key already exists", 400, MESSAGE_CODE.BAD_REQUEST);
  }
  return await createContact(data);
};

export const updateContactService = async (id: string, data: UpdateContactInfoDTO) => {
  const existing = await findContactById(id);
  if (!existing) {
    return new ErrorApp("Contact not found", 404, MESSAGE_CODE.NOT_FOUND);
  }
  return await updateContact(id, data);
};

export const deleteContactService = async (id: string) => {
  const existing = await findContactById(id);
  if (!existing) {
    return new ErrorApp("Contact not found", 404, MESSAGE_CODE.NOT_FOUND);
  }
  await deleteContact(id);
  return null;
};

export const batchUpsertContactsService = async (data: CreateContactInfoDTO[]) => {
  const results = [];
  for (const item of data) {
    const res = await upsertContact(item);
    results.push(res);
  }
  return results;
};
