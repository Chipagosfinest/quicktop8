const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(express.static('.'));

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard server running on http://localhost:${PORT}`);
  console.log(`🔗 Dashboard URL: http://localhost:${PORT}`);
  console.log(`📈 Backend API: http://localhost:4000/health`);
}); 