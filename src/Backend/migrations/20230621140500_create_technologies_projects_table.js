exports.up = function(knex) {
  return knex.schema.createTable('Technologies_Projects', function(table) {
    table.increments('id_Technologies_Projects').primary();
    table.integer('TK_idTechnologies').unsigned();
    table.integer('TK_idProjects').unsigned();
    
    table.foreign('TK_idTechnologies').references('id_Technologies').inTable('Technologies')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
      
    table.foreign('TK_idProjects').references('id_Project').inTable('Projects')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('Technologies_Projects');
};