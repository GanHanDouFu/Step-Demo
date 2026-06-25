const POETRY = require('../poetry.js');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const shuffled = [...POETRY].sort(() => Math.random() - 0.5);
  res.json(shuffled);
};
