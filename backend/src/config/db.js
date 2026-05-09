import mysql from "mysql2/promise";
import { config } from "./env.js";
import { fileQuery } from "./fileDb.js";

let mysqlPool;
let useFileDb = process.env.DB_DRIVER === "file";

function getMysqlPool() {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      ...config.db,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }

  return mysqlPool;
}

async function runMysql(sql, params = {}) {
  const [rows] = await getMysqlPool().execute(sql, params);
  return rows;
}

export const pool = {
  async query(sql, params = {}) {
    return [await query(sql, params)];
  }
};

export async function query(sql, params = {}) {
  if (!useFileDb) {
    try {
      return await runMysql(sql, params);
    } catch (error) {
      const connectionError = ["ECONNREFUSED", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ENOTFOUND"].includes(error.code);
      if (!connectionError) throw error;

      useFileDb = true;
      console.warn(`MySQL unavailable (${error.code}). Using local JSON database fallback.`);
    }
  }

  return fileQuery(sql, params);
}
