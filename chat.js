const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/', auth, async (req, res) => {
  const msg = new Message({ sender: req.user.id, ...req.body });
  await msg.save();
  res.status(201).json(msg);
});

router.get('/:userId', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;