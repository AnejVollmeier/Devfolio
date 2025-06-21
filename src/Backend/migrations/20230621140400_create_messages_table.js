// Popravek za Messages tabelo
exports.up = function(knex) {
  return knex.schema.createTable('Messages', function(table) {
    table.increments('id_Messages').primary();
    table.string('email', 100).notNullable();
    table.string('subject', 30).notNullable();
    table.text('message').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()); // Sprememba iz date v timestamp
  });
};