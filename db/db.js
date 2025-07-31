const { Pool } = require('pg');

const pool = new Pool({
  user: 'illegal',
  host: 'localhost',
  database: 'echat',
  password: '101011',
  port: 5432,
});

module.exports = pool;
