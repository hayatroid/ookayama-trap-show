import { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import bcrypt from "bcryptjs";

import { Bindings, error, success } from "./utils";
import { Connection } from "mariadb";

export const hashToken = (token: string) => {
  return bcrypt.hashSync(token, 10);
};

export const getIdToken = (userId: string, token: string) => {
  return `${userId}:${token}`;
};

export const setCookieToken = (c: Context, idToken: string) => {
  setCookie(c, "token", idToken, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30 日間保持
    sameSite: "strict",
  });
};

const authorizeUser = async (idToken: string | undefined, DB: Connection) => {
  // トークンを検証
  if (!idToken) {
    return error("Token not found", 401);
  }
  // UUID:UUID の形式であるか
  const split = idToken.split(":");
  if (split.length !== 2) {
    return error("Invalid token", 401);
  }
  const [userId, token] = split;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId) || !uuidRegex.test(token)) {
    return error("Invalid token", 401);
  }

  // ユーザを検索
  const query = `SELECT id, hashed_token FROM user WHERE id = ?`;
  const userResult = await DB.query<{ id: string; hashed_token: string }[]>(
    query,
    [userId]
  );
  if (userResult.length === 0) {
    return error("Invalid token", 401);
  }

  // トークンを検証
  const hashedToken = userResult[0].hashed_token;
  if (!bcrypt.compareSync(token, hashedToken)) {
    return error("Invalid token", 401);
  }
  return success(userId);
};

export const authMiddleware = (
  occursError: boolean,
  type: "cookie" | "authorization"
) =>
  createMiddleware<{
    Bindings: Bindings;
    Variables: {
      userId: string | null;
    };
  }>(async (c, next) => {
    // Authorization ヘッダまたは Cookie からトークンを取得
    let idToken: string | undefined = undefined;
    if (type === "cookie") {
      idToken = getCookie(c, "token");
    } else {
      idToken = c.req.header("Authorization");
    }

    const userIdResult = await authorizeUser(idToken, c.env.DB);
    if (userIdResult.type === "error") {
      if (occursError) {
        return c.json({ error: userIdResult.message }, userIdResult.status);
      } else {
        c.set("userId", null);
        await next();
        return;
      }
    }
    c.set("userId", userIdResult.value);
    await next();
  });
