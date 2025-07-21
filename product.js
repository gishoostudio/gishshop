const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
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
  const product = new Product({ ...req.body, owner: req.user.id });
  await product.save();
  res.status(201).json(product);
});

router.get('/', async (req, res) => {
  const products = await Product.find().populate('owner', 'username');
  res.json(products);
});

module.exports = router;