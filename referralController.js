import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Send a referral
router.post('/referral/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'senderId and receiverId are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        senderId,
        receiverId,
        message: message || ''
      }
    });
    res.status(201).json({ status: 'sent', referral });
  } catch (err) {
    console.error('Error sending referral:', err);
    res.status(500).json({ error: 'Failed to send referral' });
  }
});

// View incoming referrals
router.get('/referrals/incoming/:userId', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { receiverId: req.params.userId },
      include: { sender: true }
    });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incoming referrals' });
  }
});

// View outgoing referrals
router.get('/referrals/outgoing/:userId', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { senderId: req.params.userId },
      include: { receiver: true }
    });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outgoing referrals' });
  }
});

// Accept referral
router.patch('/referral/:id/accept', async (req, res) => {
  try {
    const updated = await prisma.referral.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' }
    });
    res.json({ status: 'accepted', updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept referral' });
  }
});

// Decline referral
router.patch('/referral/:id/decline', async (req, res) => {
  try {
    const updated = await prisma.referral.update({
      where: { id: req.params.id },
      data: { status: 'DECLINED' }
    });
    res.json({ status: 'declined', updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline referral' });
  }
});

export default router;
