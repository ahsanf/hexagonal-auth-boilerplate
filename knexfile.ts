import { config as appConfig } from "./src/config/config";
import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: appConfig.database.mysql.connection.host,
      user: appConfig.database.mysql.connection.user,
      password: appConfig.database.mysql.connection.password,
      database: appConfig.database.mysql.connection.database,
    },
    pool: {
      min: 2,
      max: 20,
      idleTimeoutMillis: 30000,
      createTimeoutMillis: 2000,
      acquireTimeoutMillis: 2000,
    },
    migrations: {
      directory: './src/migrations',
      tableName: "knex_migrations",
      extension: 'ts',
    }
  },

  staging: {},

  production: {}

};

module.exports = config;
