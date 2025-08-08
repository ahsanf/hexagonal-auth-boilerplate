import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('username').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('phone').nullable();
    table.text('address').nullable();
    table.string('lang', 10).nullable();
    table.string('image_url').nullable();
    table.boolean('is_active').defaultTo(true).nullable();
    table.json('roles').nullable();
    table.timestamp('last_login').nullable();
    table.timestamp('last_password_change').nullable();
    table.boolean('email_verified').defaultTo(false).nullable();
    table.string('refresh_token').nullable();
    table.string('google_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();
  });

  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('token').notNullable();
    table.timestamp('expired_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();
    table.string('user_agent').nullable();
    table.string('ip_address').nullable();
    table.string('mac_address').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}