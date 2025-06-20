module.exports = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'anej', 
    database: 'devfolio',
    port: 3306,
    charset: 'utf8',
  },
  migrations: {
    tableName: 'knex_migrations',
  },
};
