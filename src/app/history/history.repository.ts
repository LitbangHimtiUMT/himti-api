import { HistoryFlag } from "@prisma/client";
import { prisma } from "../../config";
import { HistoryCreationDTO } from "./history.dto";
import { HistoryQuery } from "./history.interface";
import { queryPagination } from "../../utils/pagination";

export const createHistory = async (data: HistoryCreationDTO) => {
  return prisma.history.create({
    data: {
      flag: data.flag,
      module: data.module,
      title: data.title,
      actionId: data.actionId,
    },
  });
};

export const historyCreateFlag = async (
  data: Omit<HistoryCreationDTO, "flag">
) => {
  return prisma.history.create({
    data: {
      flag: HistoryFlag.CREATE,
      module: data.module,
      title: data.title,
      actionId: data.actionId,
      createdBy: data.createdBy,
    },
  });
};

export const historyLoginFlag = async (
  data: Omit<HistoryCreationDTO, "flag">
) => {
  return prisma.history.create({
    data: {
      flag: HistoryFlag.LOGIN,
      module: data.module,
      title: data.title,
      actionId: data.actionId,
      createdBy: data.createdBy,
    },
  });
};

export const historyLogoutFlag = async (
  data: Omit<HistoryCreationDTO, "flag">
) => {
  return prisma.history.create({
    data: {
      flag: HistoryFlag.LOGOUT,
      module: data.module,
      title: data.title,
      actionId: data.actionId,
      createdBy: data.createdBy,
    },
  });
};

export const historyDeleteFlag = async (
  data: Omit<HistoryCreationDTO, "flag">
) => {
  return prisma.history.create({
    data: {
      flag: HistoryFlag.DELETE,
      module: data.module,
      title: data.title,
      actionId: data.actionId,
      createdBy: data.createdBy,
    },
  });
};

export const historyUpdateFlag = async (
  data: Omit<HistoryCreationDTO, "flag">
) => {
  return prisma.history.create({
    data: {
      flag: HistoryFlag.UPDATE,
      module: data.module,
      title: data.title,
      actionId: data.actionId,
      createdBy: data.createdBy,
    },
  });
};

export const getHistoriesRepository = async (query: HistoryQuery) => {
  const { actionId, module, flag } = query;
  return prisma.history.findMany({
    where: {
      ...(actionId && {
        actionId,
      }),
      ...(module && {
        module,
      }),
      ...(flag && {
        flag,
      }),
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    ...queryPagination(query),
  });
};

export const getHistoriesCountRepository = async (query: HistoryQuery) => {
  const { actionId, module, flag } = query;
  return prisma.history.count({
    where: {
      ...(actionId && {
        actionId,
      }),
      ...(module && {
        module,
      }),
      ...(flag && {
        flag,
      }),
    },
  });
};
