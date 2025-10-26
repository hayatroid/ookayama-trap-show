import { Hono } from "hono";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ja";
import mariadb from "mariadb";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import { Bindings } from "./libs/utils";
import checkins from "./routes/checkins";
import users from "./routes/users";
import { usersMeProtected } from "./routes/users-me-protected";
import { usersMePublic } from "./routes/users-me-public";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");
dayjs.locale("ja");

const app = new Hono<{ Bindings: Bindings }>();

const pool = mariadb.createPool({
  host: process.env.NS_MARIADB_HOSTNAME || "localhost",
  port: Number(process.env.NS_MARIADB_PORT) || 3306,
  user: process.env.NS_MARIADB_USER || "root",
  password: process.env.NS_MARIADB_PASSWORD || "password",
  database: process.env.NS_MARIADB_DATABASE || "ookayama_trap",
});

app.use("*", async (c, next) => {
  const conn = await pool.getConnection();
  c.env.DB = conn;
  try {
    await next();
  } finally {
    conn.release();
  }
});

app.route("/api/checkins", checkins);
app.route("/api/users/me", usersMeProtected);
app.route("/api/users/me", usersMePublic);
app.route("/api/users", users);

app.use("/*", serveStatic({ root: "./dist" }));
app.get("/*", serveStatic({ path: "./dist/index.html" }));

serve(app);
