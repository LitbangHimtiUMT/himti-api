import { CreateClassBodyRequest } from "./classes.dto";
import { createClass } from "./classes.repository";

export const createClassService = async (body: CreateClassBodyRequest) => {
  const data = await createClass({
    ...body,
  });

  return data;
};
