import knex, { Knex } from "knex"
import { config } from "@config"

let client: Knex

export const getMysqlClient = () => knex(config.database.mysql)

export const initMysql = async (): Promise<void> => {
  client = knex({
    client: 'mysql',
    connection: {
      
    }
  })

  try {
    await client.raw('SELECT 1+1 AS result')
    console.log('✅ Connected to MySQL via Knex successfully.')
  } catch (err) {
    console.error('❌ Failed to connect to MySQL via Knex:', err)
    throw err
  }
}
