import { exec } from 'child_process';

if (process.env.AUTO_PUSH === 'true') {
  exec('npx prisma db push', (err, stdout, stderr) => {
    if (err) console.error('Prisma push failed:', stderr);
    else console.log('Prisma push successful:', stdout);
  });
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hash, role }
    });
    res.json({ message: 'User created', user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: 'User already exists or invalid input' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

app.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    res.json({ email: user.email, role: user.role });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(3000, () => console.log('✅ Hayy backend running on port 3000'));
