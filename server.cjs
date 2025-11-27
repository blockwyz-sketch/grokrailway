// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const chat = require('./api/chat');

const app = express();
app.use(bodyParser.json());

// Route API
app.post('/api/chat', (req, res) => chat(req, res));
app.options('/api/chat', (req, res) => chat(req, res));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});
