exports.up = function(knex) {
  return knex.schema.createTable('UserType', function(table) {
    table.increments('id_UserType').primary();
    table.string('name', 30);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('UserType');
};