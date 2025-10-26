import { Connection } from "mariadb";

export type Visibility = "public" | "private" | "internal";

interface DBUser {
  id: string;
  screen_name: string;
  name: string;
  message: string;
  visibility: Visibility;
  listed: number;
  displays_past: number;
}

type DBUserWithCheckin = DBUser & {
  location_id: string;
};

interface User {
  id: string;
  screenName: string;
  name: string;
  message: string;
  visibility: Visibility;
  listed: boolean;
  displaysPast: boolean;
}

export type UserWithCheckin = User & {
  latestLocationId: string;
};

const dbUserFields: (keyof DBUser)[] = [
  "id",
  "screen_name",
  "name",
  "message",
  "visibility",
  "listed",
  "displays_past",
];

const dbToUser = (dbUser: DBUser): User => ({
  id: dbUser.id,
  screenName: dbUser.screen_name,
  name: dbUser.name,
  message: dbUser.message,
  visibility: dbUser.visibility,
  listed: dbUser.listed === 1,
  displaysPast: dbUser.displays_past === 1,
});

const dbToUserWithCheckin = (dbUser: DBUserWithCheckin): UserWithCheckin => ({
  ...dbToUser(dbUser),
  latestLocationId: dbUser.location_id,
});

// user
export const fetchAllUsers = async (
  DB: Connection,
  checkinDate: {
    year: number;
    month: number;
    day: number;
    hours: number;
  }
) => {
  const userFieldsSelect = dbUserFields
    .map((field) => `user.${field}`)
    .join(", ");
  const query = `
    SELECT ${userFieldsSelect}, checkin.location_id
    FROM user
    LEFT JOIN checkin ON user.id = checkin.user_id
      AND checkin.count > 0
      AND checkin.year = ?
      AND checkin.month = ?
      AND checkin.day = ?
      AND checkin.hours = ?
    WHERE user.listed = 1
  `;
  const params = [
    checkinDate.year,
    checkinDate.month,
    checkinDate.day,
    checkinDate.hours,
  ];
  const results = await DB.query<DBUserWithCheckin[]>(query, params);
  return results.map(dbToUserWithCheckin);
};

export const fetchUser = async (
  { type, value }: { type: "id" | "screen_name"; value: string },
  DB: Connection
) => {
  const conditions = type === "id" ? "id = ?" : "screen_name = ?";
  const query = `SELECT ${dbUserFields.join(
    ", "
  )} FROM user WHERE ${conditions}`;
  const results = await DB.query<DBUser[]>(query, [value]);
  return results.length > 0 ? dbToUser(results[0]) : null;
};

export const insertUser = async (
  id: string,
  screenName: string,
  name: string,
  message: string,
  visibility: "public" | "private" | "internal",
  listed: boolean,
  displaysPast: boolean,
  hashedToken: string,
  DB: Connection
) => {
  const query = `INSERT INTO user (id, screen_name, name, message, visibility, listed, displays_past, hashed_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  await DB.query(query, [
    id,
    screenName,
    name,
    message,
    visibility,
    listed ? 1 : 0,
    displaysPast ? 1 : 0,
    hashedToken,
  ]);
};

export const updateUser = async (
  id: string,
  {
    screenName,
    name,
    message,
    visibility,
    listed,
    displaysPast,
    hashedToken,
  }: {
    screenName?: string;
    name?: string;
    message?: string;
    visibility?: "public" | "private" | "internal";
    listed?: boolean;
    displaysPast?: boolean;
    hashedToken?: string;
  },
  DB: Connection
) => {
  const updates: string[] = [];
  const params: any[] = [];

  if (screenName !== undefined) {
    updates.push("screen_name = ?");
    params.push(screenName);
  }
  if (name !== undefined) {
    updates.push("name = ?");
    params.push(name);
  }
  if (message !== undefined) {
    updates.push("message = ?");
    params.push(message);
  }
  if (visibility !== undefined) {
    updates.push("visibility = ?");
    params.push(visibility);
  }
  if (listed !== undefined) {
    updates.push("listed = ?");
    params.push(listed ? 1 : 0);
  }
  if (displaysPast !== undefined) {
    updates.push("displays_past = ?");
    params.push(displaysPast ? 1 : 0);
  }
  if (hashedToken !== undefined) {
    updates.push("hashed_token = ?");
    params.push(hashedToken);
  }

  if (updates.length === 0) return;

  const query = `UPDATE user SET ${updates.join(", ")} WHERE id = ?`;
  params.push(id);
  await DB.query(query, params);
};
