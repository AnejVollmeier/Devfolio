exports.up = function(knex) {
  return knex.schema.createTable('Projects', function(table) {
    table.increments('id_Project').primary();
    table.string('title', 20).notNullable();
    table.text('description').notNullable();
    table.string('github_url', 100).notNullable();
    table.string('address_url', 100).notNullable();
    table.string('image_url', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    // Postgres nima unsigned()
    table.integer('TK_idUser');
    table.foreign('TK_idUser').references('id_User').inTable('Users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
};

// Dodana manjkajoča down funkcija
exports.down = function(knex) {
  return knex.schema.dropTable('Projects');
};