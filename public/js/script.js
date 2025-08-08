// We wrap all our code in a DOMContentLoaded listener to ensure
// the page is fully loaded before we try to access any elements.
document.addEventListener('DOMContentLoaded', () => {
  // ========================================================================
  // 1. STATE MANAGEMENT
  // ========================================================================
  // Use a single object to hold the application's state, avoiding global variables.
  const state = {
    ws: null, // This will hold our single, active WebSocket connection
  };

  // ========================================================================
  // 2. DOM ELEMENT REFERENCES
  // ========================================================================
  // Get all necessary DOM elements once at the beginning.
  const messageForm = document.getElementById('message-form');
  const createRoomForm = document.getElementById('create-room-form');
  const joinRoomBtn = document.getElementById('join-room-btn');
  const roomSelect = document.getElementById('room-select');
  const userList = document.getElementById('user-list');
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  const messagesContainer = document.getElementById('messages');
  const roomTitle = document.getElementById('room-title');
  const messageInput = document.getElementById('message-input');

  // ========================================================================
  // 3. UI / DOM UPDATE FUNCTIONS
  // ========================================================================

  /**
   * Renders a message or file in the chat window.
   */
  const addMessage = (text, fileUrl, fileType) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message'); // For styling

    if (fileUrl) {
      // If it's a file, create an image or a link
      if (fileType && fileType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = fileUrl;
        img.classList.add('chat-image'); // For styling
        messageElement.innerHTML = `${text}<br>`;
        messageElement.appendChild(img);
      } else {
        // For other file types, create a downloadable link
        const link = document.createElement('a');
        link.href = fileUrl;
        link.textContent = fileUrl;
        link.target = '_blank';
        messageElement.innerHTML = `${text} `;
        messageElement.appendChild(link);
      }
    } else {
      // If it's just a text message
      messageElement.textContent = text;
    }

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
  };

  /**
   * Clears and re-renders the list of online users.
   */
  const updateOnlineUsers = (onlineUsers) => {
    userList.innerHTML = '';
    console.log(onlineUsers);
    for (const user of onlineUsers) {
      const li = document.createElement('li');
      li.className = 'list-group-item'; // For Bootstrap styling
      li.textContent = `${user.username}`;
      li.id = `user-${user.userId}`;
      userList.appendChild(li);
    }
  };

  /**
   * Renders the list of available rooms in the dropdown.
   */
  const renderRooms = (rooms) => {
    roomSelect.innerHTML =
      '<option value="" disabled selected>Select a room</option>';
    rooms.forEach((room) => {
      const option = document.createElement('option');
      option.value = room.name;
      option.textContent = room.name;
      roomSelect.appendChild(option);
    });
  };

  // ========================================================================
  // 4. API & WEBSOCKET COMMUNICATION
  // ========================================================================

  /**
   * Fetches the list of rooms from the server and renders them.
   */
  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      renderRooms(response.data.data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      alert('Could not load available rooms.');
    }
  };

  /**
   * Creates a new WebSocket connection and sets up its event handlers.
   */
  const connectToChat = (room, password) => {
    // If a connection already exists, close it first.
    if (state.ws) {
      state.ws.close();
    }

    messagesContainer.innerHTML = ''; // Clear chat history

    state.ws = new WebSocket('ws://localhost:5000'); // Use your WebSocket URL

    state.ws.onopen = () => {
      console.log('Connected to WebSocket server.');
      // The server will send a 'Welcome' message to trigger the join request.
    };

    state.ws.onmessage = (event) => {
      handleWebSocketMessage(JSON.parse(event.data), room, password);
    };

    state.ws.onclose = () => {
      console.log('Disconnected from WebSocket server.');
      addMessage('🔌 You have been disconnected.');
    };

    state.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      addMessage('❌ A connection error occurred.');
    };
  };

  /**
   * Handles all incoming messages from the WebSocket server.
   */
  const handleWebSocketMessage = (msg, room, password) => {
    console.log('Received:', msg);

    switch (msg.type) {
      case 'Welcome':
        const username = window.currentUser.username;
        state.ws.send(
          JSON.stringify({ type: 'JOIN_ROOM', room, username, password }),
        );
        break;

      case 'JOIN_SUCCESS': // Use a consistent name from your server
        addMessage(`✅ Joined room: ${msg.room}`);
        roomTitle.innerHTML = `Room: ${msg.room}`;
        updateOnlineUsers(msg.users); // Use the correct property name from server
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('chat-window').style.display = 'grid';
        break;

      case 'CHAT':
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const text = `[${time}] ${msg.username}: ${msg.message}`;
        addMessage(text, msg.fileUrl, msg.fileType);
        break;

      case 'USER_JOINED':
      case 'USER_LEFT': // Can handle both with the same logic
        updateOnlineUsers(msg.users); // Assuming server sends the full updated list
        break;

      case 'ERROR':
        addMessage(`❌ Error: ${msg.message}`);
        break;
    }
  };

  // ========================================================================
  // 5. EVENT LISTENERS & INITIALIZATION
  // ========================================================================

  /**
   * Sets up all the event listeners for the page.
   */
  const initializeEventListeners = () => {
    // Handle submitting the chat message form
    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (
        state.ws &&
        state.ws.readyState === WebSocket.OPEN &&
        messageInput.value
      ) {
        state.ws.send(
          JSON.stringify({ type: 'CHAT', message: messageInput.value }),
        );
        messageInput.value = '';
      }
    });

    // Handle the "Join Room" button click
    joinRoomBtn.addEventListener('click', () => {
      const room = roomSelect.value;
      const password = document.getElementById('room-password').value;
      if (room) {
        connectToChat(room, password);
      } else {
        alert('Please select a room.');
      }
    });

    // Handle submitting the "Create Room" modal form
    createRoomForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const roomName = document.getElementById('new-room-name').value;
      const password = document.getElementById('new-room-password').value;
      try {
        await axios.post(
          '/api/rooms',
          { name: roomName, password },
          { withCredentials: true },
        );
        document.getElementById('create-room-modal').close();
        fetchRooms(); // Refresh the room list after creating a new one
      } catch (err) {
        console.error('Failed to create room:', err);
        alert('Error creating room.');
      }
    });

    // Handle clicking the paperclip icon to open the file dialog
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    // Handle the actual file selection
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
        alert('You must be in a room to upload a file.');
        return;
      }

      const formData = new FormData();
      formData.append('chatFile', file); // Ensure 'chatFile' matches backend

      try {
        const response = await axios.post('/api/upload', formData);
        state.ws.send(
          JSON.stringify({
            type: 'CHAT',
            message: `${file.name}`,
            fileUrl: response.data.fileUrl,
            fileType: file.type,
          }),
        );
      } catch (err) {
        console.error('File upload failed: ', err);
        alert('Sorry, there was an error uploading your file.');
      } finally {
        messageForm.reset();
      }
    });
  };

  // --- KICK IT ALL OFF ---
  fetchRooms();
  initializeEventListeners();
});
