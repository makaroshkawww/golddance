const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log("⏳ Запрашиваем ПОЛНЫЕ данные из базы...");

// Звездочка (*) означает "выбрать ВСЕ колонки"
pool.query('SELECT * FROM users', (err, res) => {
  if (err) {
    console.error("❌ Ошибка:", err.message);
  } else {
    console.log(`✅ Найдено пользователей: ${res.rows.length}`);
    console.table(res.rows); // Выведет абсолютно все данные
  }
  pool.end();
});