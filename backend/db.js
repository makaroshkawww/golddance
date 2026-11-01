const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  // Таблица пользователей
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
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`);

  // 1. Абонементы (Действующие)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      type VARCHAR(100),
      style VARCHAR(100),
      end_date DATE,
      classes_left INT
    );
  `);

  // 2. Покупки (История)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      item VARCHAR(255),
      price INT,
      purchase_date DATE DEFAULT CURRENT_DATE
    );
  `);

  // 3. Посещения
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      visit_date DATE,
      status VARCHAR(50)
    );
  `);

  // 4. Записи на занятия
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      day_name VARCHAR(50),
      time VARCHAR(50),
      style VARCHAR(100),
      teacher VARCHAR(100)
    );
  `);

  console.log('✅ Все таблицы готовы');
}

module.exports = { pool, initDB };