const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  next();
});

router.get('/', (req, res) => {
  
  res.status(200).json('hi1');
});

router.get('/about', (req, res) => {
  res.send('hi2');
});

module.exports = router;