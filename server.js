const http = require('http');
const app = require('./app');
const setupWebSocket = require('./ws/chatSocket');

const server = http.createServer(app);

setupWebSocket(server);

server.listen(3000, () => {
  console.log('Server running on http://localhost:5000');
});
