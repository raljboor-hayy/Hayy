
// referralController.js
const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

router.post('/referral/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  try {
    const referral = await prisma.referral.create({
      data: { senderId, receiverId, message }
    });
    res.json({ status: 'sent', referral });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send referral' });
  }
});

router.get('/referrals/incoming/:userId', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { receiverId: req.params.userId }
    });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incoming referrals' });
  }
});

router.get('/referrals/outgoing/:userId', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { senderId: req.params.userId }
    });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outgoing referrals' });
  }
});

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

module.exports = router;
