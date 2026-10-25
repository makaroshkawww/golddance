const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ВАЖНО: Напишите здесь email того пользователя, которого хотите удалить
const emailToDelete = 'test3@mail.ru'; 

console.log(`⏳ Удаляем пользователя: ${emailToDelete}...`);

pool.query('DELETE FROM users WHERE email = $1', [emailToDelete], (err, res) => {
  if (err) {
    console.error("❌ Ошибка:", err.message);
  } else {
    if (res.rowCount > 0) {
      console.log(`✅ Пользователь ${emailToDelete} успешно удален!`);
    } else {
      console.log(`⚠️ Пользователь с таким email не найден.`);
    }
  }
  pool.end();
});