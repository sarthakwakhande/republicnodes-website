import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

const smtpTransport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE) === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

app.get('/api/health', async (_, res) => {
  const [r] = await db.query('SELECT 1 as ok');
  res.json({ ok: r[0].ok === 1 });
});

app.post('/api/settings/:type', async (req, res) => {
  const { type } = req.params;
  await db.query('REPLACE INTO settings (`key`,`value`) VALUES (?,?)', [type, JSON.stringify(req.body)]);
  res.json({ ok: true, type });
});

app.post('/api/orders', async (req, res) => {
  const o = req.body;
  await db.query('INSERT INTO orders (id,user_email,total,status,tracking,eta,payment,timeline_json) VALUES (?,?,?,?,?,?,?,?)', [o.id, o.user, o.total, o.status, o.tracking, o.eta, o.payment, JSON.stringify(o.timeline || [])]);
  res.json({ ok: true });
});

app.post('/api/orders/:id/status', async (req, res) => {
  await db.query('UPDATE orders SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ ok: true });
});

app.post('/api/orders/:id/tracking', async (req, res) => {
  await db.query('UPDATE orders SET tracking=? WHERE id=?', [req.body.tracking, req.params.id]);
  res.json({ ok: true });
});

app.post('/api/orders/:id/message', async (req, res) => {
  const [[o]] = await db.query('SELECT timeline_json,user_email FROM orders WHERE id=?', [req.params.id]);
  const timeline = JSON.parse(o.timeline_json || '[]');
  timeline.push(req.body.message);
  await db.query('UPDATE orders SET timeline_json=? WHERE id=?', [JSON.stringify(timeline), req.params.id]);

  const tx = smtpTransport();
  await tx.sendMail({
    from: process.env.SMTP_FROM,
    to: o.user_email,
    subject: 'Delivery Update',
    text: `Your order update: ${req.body.message}`
  });
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`API listening on ${port}`));
