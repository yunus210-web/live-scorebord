const express = require('express');
const cors = require('cors');
const http = require('http');
const resultRoutes  = require('./routes/resultRoutes');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/results',resultRoutes);

// In-memory scoreboard for now
let scoreboard = {
  eventName: 'HIM MEELAD FEST',
  eventTitle: 'നൂറെ റസൂൽ',
  teams: [],
};

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Live Scoreboard Server is running',
    message: 'RESULT ROUTE LOADED'
  });
});

// Get current scoreboard
app.get('/api/scoreboard', (req, res) => {
  res.json(scoreboard);
});

// Update complete scoreboard
app.post('/api/scoreboard', (req, res) => {
  scoreboard = {
    ...scoreboard,
    ...req.body,
  };

  // Send update to every connected TV/browser
  io.emit('scoreboard:update', scoreboard);

  res.json({
    success: true,
    scoreboard,
  });
});

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Immediately send current scoreboard
  socket.emit('scoreboard:update', scoreboard);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Live Scoreboard Server running on port ${PORT}`);
});