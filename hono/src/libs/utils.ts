import dayjs from "dayjs";
import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { cidrSubnet } from "ip";
import { Connection } from "mariadb";
import { getConnInfo } from "@hono/node-server/conninfo";

export interface Bindings {
  DB: Connection;
}

interface Success<T> {
  type: "success";
  value: T;
}

interface Error {
  type: "error";
  message: string;
  status: ContentfulStatusCode;
}

export type Result<T> = Success<T> | Error;

export const success = <T>(value: T): Success<T> => ({
  type: "success",
  value,
});

export const error = (
  message: string,
  status: ContentfulStatusCode
): Error => ({
  type: "error",
  message,
  status,
});

export const screenNameRegexStr = "[a-z0-9_]{4,16}";

export const getIP = (c: Context) => {
  return getConnInfo(c).remote.address ?? "undefined";
};

export const isInternalIP = (ip: string) => {
  return cidrSubnet("131.112.127.0/26").contains(ip);
};

export const getNow = () => {
  const now = dayjs().tz();
  const year = now.year();
  const month = now.month() + 1;
  const day = now.date();
  const hours = now.hour();
  return { year, month, day, hours };
};
