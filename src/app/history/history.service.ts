import { Meta } from "../../utils/meta";
import { HistoryQuery } from "./history.interface";
import { getHistoriesMapper } from "./history.mapper";
import {
  getHistoriesCountRepository,
  getHistoriesRepository,
} from "./history.repository";

export const getHistoriesService = async (query: HistoryQuery) => {
  const { page = "1", perPage = "10" } = query;
  const [histories, totalData] = await Promise.all([
    getHistoriesRepository(query),
    getHistoriesCountRepository(query),
  ]);

  return {
    data: getHistoriesMapper(histories),
    meta: Meta(Number(page), Number(perPage), totalData),
  };
};
