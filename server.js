const express = require('express');
const cors = require('cors');
const { generate } = require('./src/generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * POST /generate
 * Body:    { "template": "<LeetCode C++ template string>" }
 * Returns: { "code": "<complete runnable C++ file>" }
 */
app.post('/generate', (req, res) => {
  try {
    const { template } = req.body;

    if (!template || typeof template !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "template" field. Send { "template": "<LC C++ code>" }',
      });
    }

    const code = generate(template);
    return res.json({ code });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/** GET /health */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`LC Template Generator running on http://localhost:${PORT}`);
  console.log(`POST /generate — send { "template": "<LC C++ code>" }`);
});
