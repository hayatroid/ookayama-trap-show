import { Connection } from "mariadb";

interface DBCheckin {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  count: number;
  location_id: string;
  updated_at: string;
}

const dbToCheckin = (dbCheckin: DBCheckin) => ({
  id: dbCheckin.id,
  year: dbCheckin.year,
  month: dbCheckin.month,
  day: dbCheckin.day,
  hours: dbCheckin.hours,
  count: dbCheckin.count,
  locationId: dbCheckin.location_id,
  updatedAt: dbCheckin.updated_at,
});

const checkinFields: (keyof DBCheckin)[] = [
  "id",
  "year",
  "month",
  "day",
  "hours",
  "count",
  "location_id",
  "updated_at",
];

// checkin
export const fetchCheckins = async (
  userId: string,
  options: {
    year?: number;
    month?: number;
    day?: number;
    hours?: number;
    locationId?: string;
  },
  DB: Connection
) => {
  const conditions = ["user_id = ?"];
  const params: any[] = [userId];
  if (options.year !== undefined) {
    conditions.push("year = ?");
    params.push(options.year);
  }
  if (options.month !== undefined) {
    conditions.push("month = ?");
    params.push(options.month);
  }
  if (options.day !== undefined) {
    conditions.push("day = ?");
    params.push(options.day);
  }
  if (options.hours !== undefined) {
    conditions.push("hours = ?");
    params.push(options.hours);
  }
  if (options.locationId !== undefined) {
    conditions.push("location_id = ?");
    params.push(options.locationId);
  }
  const query = `SELECT ${checkinFields.join(
    ", "
  )} FROM checkin WHERE ${conditions.join(" AND ")}`;
  const result = await DB.query<DBCheckin[]>(query, params);
  return result.map(dbToCheckin);
};

export const insertCheckin = async (
  userId: string,
  year: number,
  month: number,
  day: number,
  hours: number,
  locationId: string,
  DB: Connection
) => {
  const query = `INSERT INTO checkin (user_id, year, month, day, hours, location_id, count) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  await DB.query(query, [userId, year, month, day, hours, locationId, 1]);
};

export const updateCheckin = async (
  id: number,
  count: number,
  DB: Connection
) => {
  const query = `UPDATE checkin SET count = ? WHERE id = ?`;
  await DB.query(query, [count, id]);
};
