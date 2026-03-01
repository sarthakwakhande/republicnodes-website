import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) console.warn(`[warn] Missing env var: ${key}`);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});

const validSettingTypes = new Set(['payment', 'smtp', 'shipping']);

function smtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

function isSafeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

app.get('/api/health', async (_, res) => {
  const [rows] = await db.query('SELECT 1 AS ok');
  res.json({ ok: rows[0].ok === 1 });
});

app.get('/api/settings/:type', async (req, res) => {
  const { type } = req.params;
  if (!validSettingTypes.has(type)) return res.status(400).json({ ok: false, error: 'Invalid setting type' });

  const [rows] = await db.query('SELECT `value` FROM settings WHERE `key` = :key LIMIT 1', { key: type });
  if (!rows.length) return res.json({ ok: true, type, value: null });
  res.json({ ok: true, type, value: rows[0].value });
});

app.post('/api/settings/:type', async (req, res) => {
  const { type } = req.params;
  if (!validSettingTypes.has(type)) return res.status(400).json({ ok: false, error: 'Invalid setting type' });
  if (!isSafeObject(req.body)) return res.status(400).json({ ok: false, error: 'Invalid payload' });

  await db.query('REPLACE INTO settings (`key`, `value`) VALUES (:key, :value)', {
    key: type,
    value: JSON.stringify(req.body)
  });
  res.json({ ok: true, type });
});

app.get('/api/orders', async (_, res) => {
  const [rows] = await db.query('SELECT id, user_email, total, status, tracking, eta, payment, timeline_json, created_at FROM orders ORDER BY created_at DESC LIMIT 200');
  const orders = rows.map((row) => ({
    id: row.id,
    user: row.user_email,
    total: Number(row.total),
    status: row.status,
    tracking: row.tracking,
    eta: row.eta,
    payment: row.payment,
    timeline: Array.isArray(row.timeline_json) ? row.timeline_json : JSON.parse(row.timeline_json || '[]'),
    createdAt: row.created_at
  }));
  res.json({ ok: true, orders });
});

app.post('/api/orders', async (req, res) => {
  const order = req.body;
  if (!order?.id || !order?.user || !order?.tracking || !order?.status) {
    return res.status(400).json({ ok: false, error: 'Missing required order fields' });
  }

  await db.query(
    `INSERT INTO orders (id, user_email, total, status, tracking, eta, payment, timeline_json)
     VALUES (:id, :user, :total, :status, :tracking, :eta, :payment, :timeline)
     ON DUPLICATE KEY UPDATE total=:total, status=:status, tracking=:tracking, eta=:eta, payment=:payment, timeline_json=:timeline`,
    {
      id: order.id,
      user: order.user,
      total: Number(order.total || 0),
      status: order.status,
      tracking: order.tracking,
      eta: order.eta || '',
      payment: order.payment || '',
      timeline: JSON.stringify(order.timeline || [])
    }
  );

  res.json({ ok: true });
});

app.post('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ ok: false, error: 'status required' });
  await db.query('UPDATE orders SET status = :status WHERE id = :id', { status, id: req.params.id });
  res.json({ ok: true });
});

app.post('/api/orders/:id/tracking', async (req, res) => {
  const { tracking } = req.body;
  if (!tracking) return res.status(400).json({ ok: false, error: 'tracking required' });
  await db.query('UPDATE orders SET tracking = :tracking WHERE id = :id', { tracking, id: req.params.id });
  res.json({ ok: true });
});

app.post('/api/orders/:id/message', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ ok: false, error: 'message required' });

  const [rows] = await db.query('SELECT timeline_json, user_email FROM orders WHERE id = :id LIMIT 1', { id: req.params.id });
  if (!rows.length) return res.status(404).json({ ok: false, error: 'order not found' });

  const order = rows[0];
  const timeline = Array.isArray(order.timeline_json) ? order.timeline_json : JSON.parse(order.timeline_json || '[]');
  timeline.push(message);

  await db.query('UPDATE orders SET timeline_json = :timeline WHERE id = :id', {
    timeline: JSON.stringify(timeline),
    id: req.params.id
  });

  if (process.env.SMTP_FROM && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = smtpTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: order.user_email,
      subject: 'Delivery Update',
      text: `Your order update: ${message}`
    });
  }

  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
