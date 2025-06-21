exports.up = function(knex) {
  return knex.schema.createTable('Users', function(table) {
    table.increments('id_User').primary();
    table.string('email', 100).notNullable().unique();
    table.string('username', 20).notNullable().unique();
    table.string('password', 200).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    // Postgres nima unsigned(), zato odstranimo
    table.integer('TK_idUserType').notNullable();
    table.foreign('TK_idUserType').references('id_UserType').inTable('UserType')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('Users');
};