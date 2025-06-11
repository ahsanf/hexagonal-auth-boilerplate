import { config as appConfig } from "./src/config/config";
import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: appConfig.database.pg.connection.host,
      user: appConfig.database.pg.connection.user,
      password: appConfig.database.pg.connection.password,
      database: appConfig.database.pg.connection.database,
      port: appConfig.database.pg.connection.port || 5432,
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
      tableName: "knex_migrations"
    }
  },

  staging: {},

  production: {}

};

module.exports = config;
