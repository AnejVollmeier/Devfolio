exports.up = function(knex) {
  return knex.schema.createTable('Technologies', function(table) {
    table.increments('id_Technologies').primary();
    table.string('name', 30).notNullable();
    table.string('image_url', 255);
    table.text('description');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('Technologies');
};