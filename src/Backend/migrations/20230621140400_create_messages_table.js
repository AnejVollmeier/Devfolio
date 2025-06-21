exports.up = function(knex) {
  return knex.schema.createTable('Messages', function(table) {
    table.increments('id_Messages').primary();
    table.string('email', 100).notNullable();
    table.string('subject', 30).notNullable();
    table.text('message').notNullable();
    table.date('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('Messages');
};