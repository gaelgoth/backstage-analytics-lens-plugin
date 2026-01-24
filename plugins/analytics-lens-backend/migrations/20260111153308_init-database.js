/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function up(knex) {
  return knex.schema.createTable('events', table => {
    table.bigIncrements('id').primary();
    table.string('action').notNullable();
    table.string('subject').notNullable();
    table.json('attributes').nullable();
    table.json('context').notNullable();
    table.string('user_entity_ref').notNullable();
    table.string('session_id').notNullable();
    table.timestamp('timestamp').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // TODO: add a field for extra metadata

    table.index(['timestamp']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(knex) {
  return knex.schema.dropTable('events');
};
