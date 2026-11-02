import { prisma } from "../../config";
import { CreateContactInfoDTO, UpdateContactInfoDTO } from "./contact-info.dto";

export const findContactByKey = async (key: string) => {
  return await prisma.contactInfo.findUnique({
    where: { key },
  });
};

export const findAllContacts = async () => {
  return await prisma.contactInfo.findMany({
    orderBy: { group: "asc" },
  });
};

export const findContactById = async (id: string) => {
  return await prisma.contactInfo.findUnique({
    where: { id },
  });
};

export const createContact = async (data: CreateContactInfoDTO) => {
  return await prisma.contactInfo.create({
    data,
  });
};

export const updateContact = async (id: string, data: UpdateContactInfoDTO) => {
  return await prisma.contactInfo.update({
    where: { id },
    data,
  });
};

export const deleteContact = async (id: string) => {
  return await prisma.contactInfo.delete({
    where: { id },
  });
};

export const upsertContact = async (data: CreateContactInfoDTO) => {
  return await prisma.contactInfo.upsert({
    where: { key: data.key },
    update: { value: data.value, group: data.group },
    create: data,
  });
};
