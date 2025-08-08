import knex, { Knex } from "knex"
import { config } from "@config"

let client: Knex

export const getMysqlClient = () => {
  if (!client) {
    client = knex(config.database.mysql)
  }
  return client
}

export const initMysql = async (): Promise<void> => {
  client = knex({
    client: 'mysql2',
    connection: config.database.mysql.connection,
    pool: {
      min: 2,
      max: 10
    }
  })

  try {
    await client.raw('SELECT 1+1 AS result')
    console.log('Connected to MySQL via Knex successfully.')
  } catch (err) {
    console.error('Failed to connect to MySQL via Knex:', err)
    throw err
  }
}

export const closeMysql = async (): Promise<void> => {
  if (client) {
    await client.destroy()
    console.log('🔌 MySQL connection closed.')
  }
}