import { prisma } from "../../config";
import { TicketSupportCreationRepository } from "./ticket-support.dao";

export const createTicketSupportRepository = async (
  reportBy: string,
  data: TicketSupportCreationRepository
) => {
  return prisma.ticketSuport.create({
    data: {
      title: data.title,
      description: data.description,
      file: data.file,
      reportBy,
    },
  });
};

export const getTicketSupportToday = async (reportBy: string) => {
  return prisma.ticketSuport.findFirst({
    where: {
      reportBy,
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });
};
