import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { MESSAGE_CODE } from "../../utils/error-code";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGES } from "../../utils/messages";
import { Meta } from "../../utils/meta";
import { getUserById } from "../authentication/auth.repository";
import {
  IFilterUser,
  UpdateUserBodyRequest,
  UserRequestBodyDTO,
} from "./user.dto";
import { getUsersDTOMapper, userDTOMapper } from "./user.mapper";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUsers,
  getUsersCount,
  getUserWithoutMentorCountRepository,
  getUserWithoutMentorRepository,
  updateUser,
} from "./user.repository";
import { Query } from "../../interface/Query";

export const getUsersService = async ({
  page = 1,
  perPage = 10,
  search,
  role,
}: IFilterUser) => {
  const [users, totalData] = await Promise.all([
    getUsers({ page, perPage, search, role }),
    getUsersCount({ search }),
  ]);
  const meta = Meta(page, perPage, totalData);
  // if (!users.length) {
  //     return new ErrorApp(MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT, 404, MESSAGE_CODE.NOT_FOUND)
  // }

  return { data: users, meta };
};

export const createUserService = async (body: UserRequestBodyDTO) => {
  const existUser = await getUserByEmail(body.email);
  if (existUser) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.USER,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const hashPassword = await bcrypt.hash(body.password, 10);

  const user = await createUser({
    ...body,
    role: "ADMIN",
    password: hashPassword,
  });
  return user;
};

export const getUserService = async (userId: string) => {
  const user = await getUserById(userId);

  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const data = userDTOMapper(user as User);
  return data;
};

export const updateUserService = async (
  userId: string,
  data: UpdateUserBodyRequest
) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const result = await updateUser(userId, data);
  return result;
};

export const deleteUserService = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  const result = await deleteUser(userId);
  return result;
};

export const getUserWithoutMentorService = async (query: Query) => {
  const { page = "1", perPage = "10" } = query;
  const [user, totalData] = await Promise.all([
    getUserWithoutMentorRepository(query),
    getUserWithoutMentorCountRepository(query),
  ]);

  const meta = Meta(Number(page), Number(perPage), totalData);
  return {
    data: getUsersDTOMapper(user as User[]),
    meta,
  };
};



// N * n * n *

// N * n * n b
// N * n * n c
// N * n * n d
// N * n * n f
// N * n * n g
// N * n * n h
// N * n * n j
// N * n * n k
// N * n * n l
// N * n * n m

// possible
// N a n a n b -> x 
// N a n a n c -> x
// N a n a n d -> x
// N a n a n f -> x
// N a n a n d -> x
// N a n a n g -> x
// N a n a n h -> x 
// N a n a n j -> x
// N a n a n k -> x
// N a n a n l -> x
// N a n a n m -> x

// N a n a n d


// N i n i n b -> x
// N i n i n c -> x
// N i n i n d -> x
// N i n i n f -> x
// N i n i n g -> x
// N i n i n h -> x
// N i n i n j -> x
// N i n i n k -> x
// N i n i n l -> x
// N i n i n m -> x

// N u n u n b 
// N u n u n c
// N u n u n d
// N u n u n f
// N u n u n g
// N u n u n h
// N u n u n j
// N u n u n k
// N u n u n l
// N u n u n m

// N e n e n b
// N e n e n c

// N e n e n d
// N e n e n f

// N e n e n g -> 

// N e n e n h

// N e n e n j
// N e n e n k

// N e n e n l
// N e n e n m

// N o n o n b
// N o n o n c
// N o n o n d
// N o n o n f
// N o n o n g
// N o n o n h
// N o n o n j
// N o n o n k
// N o n o n l
// N o n o n m

// N * n b n *
// N * n c n *
// N * n d n *
// N * n f n *
// N * n g n *
// N * n h n *
// N * n j n *
// N * n k n *
// N * n l n *
// N * n m n *

// N b n * n *
// N c n * n *
// N d n * n *
// N f n * n *
// N g n * n *
// N h n * n *
// N j n * n *
// N k n * n *
// N l n * n *
// N m n * n *


// N a n a n a
// N a n i n i
// N a n i n a
// N i n a n a
// N i n a n i
// N i n i n i
// N e n o n o
// N e n o n e
// N e n e n e
// N o n e n e
// N o n e n o

// N a n a n a
// N i n i n i
// N u n u n u
// N o n o n o
// N e n e n e

// N a n a n i
// N a n a n u
// N a n a n e
// N a n a n o

// N u n u n i
// N u n u n a
// N u n u n e
// N u n u n o

