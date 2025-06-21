const url = require('url');

module.exports = {
  // Development config (lokalno)
  development: {
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
      directory: './migrations', // Relativno glede na mesto klicanja
      tableName: 'knex_migrations'
    }
  },
  
  // Production config (Heroku + JawsDB)
  production: {
    client: 'mysql2',
    connection: process.env.JAWSDB_URL || process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations', // Relativno glede na mesto klicanja 
      tableName: 'knex_migrations'
    }
  }
};