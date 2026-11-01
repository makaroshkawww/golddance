const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.databaseurl,
});

async function initDB() {
  // Создаем таблицу, если её нет
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      phone VARCHAR(20),
      avatar TEXT,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Если таблица уже была, добавляем колонку для аватарки
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`);
  
  console.log('База данных готова');
}

module.exports = { pool, initDB };