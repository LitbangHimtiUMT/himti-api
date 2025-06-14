import { HistoryModule, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt, { decode, TokenExpiredError, verify } from "jsonwebtoken";
import { TokenDecodeInterface } from "../../interface";
import { environment } from "../../libs";
import { MESSAGE_CODE } from "../../utils/error-code";
import { random } from "../../utils/generate-random-otp";
import { ErrorApp } from "../../utils/http-error";
import { sendOtp } from "../../utils/mailer-config";
import { MESSAGES } from "../../utils/messages";
import { getMemberByNIM } from "../members/members.repository";
import {
  createUserFCM,
  deleteManyUserFCM,
  deleteUserFCM,
} from "../user-fcm/user-fcm.repository";
import {
  ForgotPasswordDTO,
  LoginAuthBodyDTO,
  RegisterAuthBodyDTO,
  ValidateOtpDTO,
} from "./auth.dto";
import {
  changePassword,
  createOtp,
  createUser,
  getOtp,
  getUserByEmail,
  getUserById,
  getUserByNIM,
  userLogin,
  verifiedOtp,
} from "./auth.repository";
import { Query } from "../../interface/Query";
import { decryptAES } from "../../utils/decrypt";
import {
  historyCreateFlag,
  historyLoginFlag,
  historyLogoutFlag,
} from "../history/history.repository";

dotenv.config();

export const registerService = async (
  { email, name, password, nim, code }: RegisterAuthBodyDTO,
  query: Query
) => {
  const { authType = "app" } = query;
  const user = await getUserByEmail(email);
  if (user) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.USER,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  if ((password?.length as number) < 8) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.USER.PASSWORD_LENGTH,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const hashPassword = await bcrypt.hash(password, 10);
  if (authType === "app") {
    let role: Role = "USER";
    let memberId = null;

    const isAnggota = await getMemberByNIM(nim ?? "");
    const alreadyUser = await getUserByNIM(nim ?? "");

    if (!nim) {
      return new ErrorApp(
        MESSAGES.ERROR.REQUIRED.NIM,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    if (isAnggota && !code) {
      return new ErrorApp(
        MESSAGES.ERROR.REQUIRED.CODE_ANGGOTA,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    if (isAnggota && code && code !== environment.ANGGOTA_CODE) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.CODE_ANGGOTA,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }
    let isContains = false;
    const splitName = name?.split(" ");

    splitName.forEach((item) => {
      if (isAnggota?.name.toLowerCase().includes(item.toLowerCase())) {
        isContains = true;
      }
    });
    if (
      isAnggota &&
      code &&
      code === environment.ANGGOTA_CODE &&
      !isAnggota.name.includes(name) &&
      !isContains
    ) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.NAME_MEMBER,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    if (!isAnggota && code) {
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.CODE_USER,
        400,
        MESSAGE_CODE.BAD_REQUEST
      );
    }

    if (nim) {
      if (nim === alreadyUser?.nim) {
        return new ErrorApp(
          MESSAGES.ERROR.ALREADY.GLOBAL.NIM,
          400,
          MESSAGE_CODE.BAD_REQUEST
        );
      }
    }

    if (email) {
      // if (email === isAnggota?.email) {
      //   return new ErrorApp(
      //     MESSAGES.ERROR.ALREADY.GLOBAL.EMAIL,
      //     400,
      //     MESSAGE_CODE.BAD_REQUEST
      //   );
      // }
      if (email === alreadyUser?.email) {
        return new ErrorApp(
          MESSAGES.ERROR.ALREADY.GLOBAL.EMAIL,
          400,
          MESSAGE_CODE.BAD_REQUEST
        );
      }
    }

    if (isAnggota && code === environment.ANGGOTA_CODE) {
      role = "ANGGOTA";
      memberId = isAnggota.id;
    }
    const response = await createUser({
      email,
      name,
      password: hashPassword,
      role,
      nim,
      ...(memberId && {
        memberId,
      }),
    });
    await historyCreateFlag({
      module: HistoryModule.USER,
      title: `New User Register (HIMTI APP) - ${response.name}`,
      actionId: response.id,
      createdBy: response.id,
    });
    return response;
  }
  const response = await createUser({
    email,
    name,
    password: hashPassword,
    role: "USER",
    nim: undefined,
    memberId: undefined,
  });
  await historyCreateFlag({
    module: HistoryModule.USER,
    title: `New User Register (LMS) - ${response.name}`,
    actionId: response.id,
    createdBy: response.id,
  });
  return response;
};

export const loginService = async (data: LoginAuthBodyDTO, query: Query) => {
  const { email, password, fcmToken } = data;
  const { authType = "app" } = query;
  const user = await getUserByEmail(email);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }
  if ((password?.length as number) < 8) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.USER.PASSWORD_LENGTH,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.USER.PASSWORD,
      401,
      MESSAGE_CODE.UNAUTHORIZED
    );
  }

  if (user.role === "ADMIN" && !user.memberId) {
    return new ErrorApp(
      MESSAGES.ERROR.UNAUTHORIZED.ADMIN,
      401,
      MESSAGE_CODE.UNAUTHORIZED
    );
  }

  // const fcm = await getUserFCMByUserId(user.id)
  // if (user.UserFCM.length > 0) {
  //   return new ErrorApp(
  //     MESSAGES.ERROR.ALREADY.LOGIN,
  //     401,
  //     MESSAGE_CODE.UNAUTHORIZED
  //   );
  // }
  const token = jwt.sign(
    {
      id: user.id,
    },
    environment.JWT_SECRET as string,
    { expiresIn: environment.JWT_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    `${environment.SECRET_KEY}${environment.JWT_SECRET}`,
    { expiresIn: "7d" }
  );

  if (authType === "app") {
    if (fcmToken) {
      await createUserFCM(user.id, fcmToken as string);
    }
    await userLogin(user.id, true);

    const userInfo = {
      name: user.name,
      nim: user.nim,
      role: user.role,
    };
    await historyLoginFlag({
      module: HistoryModule.AUTH,
      title: `New User Login (HIMTI APP) - ${user.name}`,
      actionId: user.id,
      createdBy: user.id,
    });
    return { access_token: token, user: userInfo };
  }
  await historyLoginFlag({
    module: HistoryModule.AUTH,
    title: `New User Login (LMS) - ${user.name}`,
    actionId: user.id,
    createdBy: user.id,
  });
  return {
    accessToken: token,
    refreshToken,
  };
};

export const loginAdminService = async ({
  email,
  password,
}: LoginAuthBodyDTO) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.USER.PASSWORD,
      401,
      MESSAGE_CODE.UNAUTHORIZED
    );
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.ROLE_ADMIN,
      401,
      MESSAGE_CODE.UNAUTHORIZED
    );
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    environment.JWT_SECRET as string,
    { expiresIn: "3d" }
  );

  await historyLoginFlag({
    module: HistoryModule.AUTH,
    title: `New User Login (CMS) - ${user.name}`,
    actionId: user.id,
    createdBy: user.id,
  });

  return { access_token: token };
};

export const requestOtpService = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  // exp 3 min
  const expired = new Date(Date.now() + 3 * 60 * 1000);

  const randomOtp = random();
  const hashOtp = await bcrypt.hash(randomOtp.toString(), 10);
  const otp = await createOtp(hashOtp, email, expired);

  await sendOtp(user.email, user.name, randomOtp);
  const data = {
    key: otp.id,
    otp: hashOtp,
    isVerified: otp.isVerified,
    expired,
  };

  return data;
};

export const validateOtpService = async ({ key, otp }: ValidateOtpDTO) => {
  const findOtp = await getOtp(key);

  if (!findOtp) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.OTP_KEY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  if (findOtp.isVerified) {
    return new ErrorApp(
      MESSAGES.ERROR.ALREADY.OTP_VERIFIED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const matchOtp = await bcrypt.compare(otp.toString(), findOtp.otp);

  if (!matchOtp) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.OTP_NUMBER,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const isExpired = new Date(findOtp.expired as Date) < new Date(Date.now());
  if (isExpired) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.OTP_EXPIRED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const verified = await verifiedOtp(key);

  const data = {
    key: verified.id,
    isVerified: verified.isVerified,
  };

  return data;
};

export const forgotPasswordService = async ({
  key,
  password,
}: ForgotPasswordDTO) => {
  const otp = await getOtp(key);

  if (!otp) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.OTP_KEY,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }
  const user = await getUserByEmail(otp.email);

  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (user.UserFCM.length) {
    await deleteUserFCM(user.UserFCM[0].id);
  }

  if (otp && !otp.isVerified) {
    return new ErrorApp(
      MESSAGES.ERROR.INVALID.OTP_VERIFIED,
      400,
      MESSAGE_CODE.BAD_REQUEST
    );
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const response = await changePassword(user.id, hashPassword);
  return response;
};

export const logoutService = async (token: string) => {
  const decodeToken = decode(token) as TokenDecodeInterface;
  const id = decodeToken.id;
  const user = await getUserById(id);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (user.UserFCM.length > 0) {
    await deleteManyUserFCM(user.id);
  }
  const response = await userLogin(user.id, false);
  await historyLogoutFlag({
    module: HistoryModule.AUTH,
    title: `User Logout - ${user.name}`,
    actionId: user.id,
    createdBy: user.id,
  });
  return response;
};

export const biometricAuthService = async (
  encryptedEmail: string,
  ivKey: string,
  fcmToken?: string
) => {
  const email = decryptAES(
    encryptedEmail,
    ivKey,
    environment.CRYPTO_SECRET_KEY
  );
  const user = await getUserByEmail(email);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.NOT_FOUND.USER.ACCOUNT,
      404,
      MESSAGE_CODE.NOT_FOUND
    );
  }

  if (user.role === "ADMIN" && !user.memberId) {
    return new ErrorApp(
      MESSAGES.ERROR.UNAUTHORIZED.ADMIN,
      401,
      MESSAGE_CODE.UNAUTHORIZED
    );
  }

  if (fcmToken) {
    await createUserFCM(user.id, fcmToken as string);
  }
  await userLogin(user.id, true);

  const token = jwt.sign(
    {
      id: user.id,
    },
    environment.JWT_SECRET as string,
    { expiresIn: environment.JWT_EXPIRES }
  );
  const userInfo = {
    name: user.name,
    nim: user.nim,
    role: user.role,
  };
  await historyLoginFlag({
    module: HistoryModule.AUTH,
    title: `New User Login (HIMTI APP) - ${user.name}`,
    actionId: user.id,
    createdBy: user.id,
  });
  return { access_token: token, user: userInfo };
};

export const refreshTokenService = async (token: string) => {
  const decodeToken = decode(token) as TokenDecodeInterface;
  verify(token, environment.JWT_SECRET as string, async (err: unknown) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        return new ErrorApp(
          MESSAGES.ERROR.UNAUTHORIZED.EXPIRED,
          401,
          MESSAGE_CODE.UNAUTHORIZED
        );
      }
      if (!decodeToken?.id) {
        return new ErrorApp(
          MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED,
          401,
          MESSAGE_CODE.UNAUTHORIZED
        );
      }
      return new ErrorApp(
        MESSAGES.ERROR.INVALID.AUTH,
        401,
        MESSAGE_CODE.UNAUTHORIZED
      );
    }
  });

  const user = await getUserById(decodeToken.id);
  if (!user) {
    return new ErrorApp(
      MESSAGES.ERROR.UNAUTHORIZED.RECOGNIZED,
      401,
      MESSAGE_CODE.UNAUTHORIZED
    );
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
    },
    environment.JWT_SECRET as string,
    { expiresIn: environment.JWT_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    `${environment.SECRET_KEY}${environment.JWT_SECRET}`,
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
  };
};
