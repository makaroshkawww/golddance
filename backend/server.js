const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDB } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 80;
const JWT_SECRET = process.env.JWT_SECRET;

const path = require('path');
app.use(express.static(__dirname)); 
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- АВТОРИЗАЦИЯ ---
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
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

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
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Нет токена' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, email, name, phone, role, avatar FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user: result.rows[0] });
  } catch (err) { res.status(401).json({ error: 'Неверный токен' }); }
});

app.post('/api/users/avatar', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Нет токена' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [req.body.avatar, decoded.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// --- API ДЛЯ АДМИНКИ ---

// Абонементы
app.post('/api/admin/subscriptions', async (req, res) => {
  const { email, type, style, end_date, classes_left } = req.body;
  await pool.query('INSERT INTO subscriptions (user_email, type, style, end_date, classes_left) VALUES ($1, $2, $3, $4, $5)', [email, type, style, end_date, classes_left]);
  res.json({ success: true });
});

app.get('/api/admin/subscriptions', async (req, res) => {
  const result = await pool.query('SELECT * FROM subscriptions ORDER BY id DESC');
  res.json(result.rows);
});

app.delete('/api/admin/subscriptions/:id', async (req, res) => {
  await pool.query('DELETE FROM subscriptions WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// Покупки
app.post('/api/admin/purchases', async (req, res) => {
  const { email, item, price } = req.body;
  await pool.query('INSERT INTO purchases (user_email, item, price) VALUES ($1, $2, $3)', [email, item, price]);
  res.json({ success: true });
});

app.get('/api/admin/purchases', async (req, res) => {
  const result = await pool.query('SELECT * FROM purchases ORDER BY id DESC');
  res.json(result.rows);
});

app.delete('/api/admin/purchases/:id', async (req, res) => {
  await pool.query('DELETE FROM purchases WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// Посещения
app.post('/api/admin/visits', async (req, res) => {
  const { email, date, status } = req.body;
  await pool.query('INSERT INTO visits (user_email, visit_date, status) VALUES ($1, $2, $3)', [email, date, status]);
  
  // Если "Посещено", убираем занятие из абонемента
  if (status === 'Посещено') {
    await pool.query(`
      UPDATE subscriptions 
      SET classes_left = classes_left - 1 
      WHERE user_email = $1 AND classes_left > 0 
      ORDER BY id ASC LIMIT 1
    `, [email]);
  }
  res.json({ success: true });
});

app.get('/api/admin/visits', async (req, res) => {
  const result = await pool.query('SELECT * FROM visits ORDER BY id DESC');
  res.json(result.rows);
});

app.delete('/api/admin/visits/:id', async (req, res) => {
  await pool.query('DELETE FROM visits WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// Записи
app.post('/api/admin/records', async (req, res) => {
  const { email, day_name, time, style, teacher } = req.body;
  await pool.query('INSERT INTO records (user_email, day_name, time, style, teacher) VALUES ($1, $2, $3, $4, $5)', [email, day_name, time, style, teacher]);
  res.json({ success: true });
});

app.get('/api/admin/records', async (req, res) => {
  const result = await pool.query('SELECT * FROM records ORDER BY id DESC');
  res.json(result.rows);
});

app.delete('/api/admin/records/:id', async (req, res) => {
  await pool.query('DELETE FROM records WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

// Получение данных для ЛИЧНОГО КАБИНЕТА пользователя
app.get('/api/user/data', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Нет токена' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await pool.query('SELECT email FROM users WHERE id = $1', [decoded.id]);
    const email = user.rows[0].email;

    const subs = await pool.query('SELECT * FROM subscriptions WHERE user_email = $1', [email]);
    const visits = await pool.query('SELECT * FROM visits WHERE user_email = $1 ORDER BY id DESC', [email]);
    const purchases = await pool.query('SELECT * FROM purchases WHERE user_email = $1 ORDER BY id DESC', [email]);
    const records = await pool.query('SELECT * FROM records WHERE user_email = $1 ORDER BY id ASC', [email]);

    res.json({
      subscriptions: subs.rows,
      visits: visits.rows,
      purchases: purchases.rows,
      records: records.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
}).catch(err => {
  console.error('❌ Ошибка БД:', err);
  process.exit(1);
});