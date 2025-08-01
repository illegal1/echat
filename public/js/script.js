let ws;
let userId;
const form = document.getElementById('message-form');
const createRoomForm = document.getElementById('create-room-form');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomSelect = document.getElementById('room-select');
const logoutBtn = document.getElementById('logout-btn');

function joinChat(room, password) {
  if (ws) ws.close();
  document.getElementById('messages').innerHTML = '';
  // const username = document.getElementById('username').value;
  const username = window.currentUser.username;

  ws = new WebSocket('ws://localhost:5000');

  ws.onopen = () => {
    console.log('Connected to WebSocket');
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log('Received:', msg);

    if (msg.type === 'Welcome') {
      ws.send(JSON.stringify({ type: 'SET_USERNAME', username }));
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', room, username, password }));
    }

    if (msg.type === 'JOINED_ROOM') {
      addMessage(`✅ Joined room: ${msg.room}`);
      document.getElementById('room-title').innerHTML = `Room: ${msg.room}`;
    }

    if (msg.type === 'CHAT') {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      addMessage(`[${time}] ${msg.username}: ${msg.message}`);
    }

    if (msg.type === 'ERROR') {
      addMessage(`❌ Error: ${msg.message}`);
    }
  };
}

function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'CHAT', message }));
  }
}

function addMessage(text) {
  const div = document.createElement('div');
  div.textContent = text;
  document.getElementById('messages').appendChild(div);
  const messagesContainer = document.getElementById('messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
if (roomSelect) {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await axios.get('/api/rooms');
      const rooms = response.data;

      rooms.data.forEach((room) => {
        const option = document.createElement('option');
        option.value = room.name;
        option.textContent = room.name;
        roomSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Failed to load rooms : ', err);
    }
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('message-input');
  sendMessage(input.value);
  const messagesContainer = document.getElementById('messages');
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  input.value = '';
});

createRoomForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const roomName = document.getElementById('new-room-name');
  const password = document.getElementById('new-room-password');
  await axios.post(
    '/api/rooms',
    {
      name: roomName.value,
      password: password.value,
    },
    { withCredentials: true },
  );
  document.getElementById('create-room-modal').close();
  window.location.href = '/';
});

document.getElementById('join-room-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const password = document.getElementById('room-password');
  joinChat(roomSelect.value, password.value);
});
