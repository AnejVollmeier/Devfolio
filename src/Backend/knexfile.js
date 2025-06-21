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
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  },
  
  // Production config (Render.com + Postgres)
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};