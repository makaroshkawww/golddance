const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDB } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Эти две строчки позволяют серверу показывать ваши HTML-файлы
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Лимит для картинок

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Введите email и пароль' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Этот email уже занят' });

    const hash = await bcrypt.hash(password, 10);
    const count = await pool.query('SELECT COUNT(*) FROM users');
    const role = count.rows[0].count === '0' ? 'admin' : 'user'; 

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, role, avatar',
      [email.toLowerCase(), hash, name || null, phone || null, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ВХОД
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Неверный email или пароль' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ПОЛУЧЕНИЕ ДАННЫХ ДЛЯ ПРОФИЛЯ
app.get('/api/auth/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Нет токена' });
    
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, name, phone, role, avatar FROM users WHERE id = $1', 
      [decoded.id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// ОБНОВЛЕНИЕ АВАТАРКИ
app.post('/api/users/avatar', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Нет токена' });
    
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const { avatar } = req.body; 
    
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar, decoded.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка сохранения аватарки:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ЗАПУСК
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Ошибка инициализации БД:', err);
  process.exit(1);
});