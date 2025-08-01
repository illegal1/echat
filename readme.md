# 💬 E-Chat

> Real-time chat application with user authentication, chat rooms, and live messaging — built with Node.js, Express, and WebSockets.

![License](https://img.shields.io/github/license/illegal1/echat?style=flat-square)
![Node Version](https://img.shields.io/badge/Node.js-18.x-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational%20Database-blue?style=flat-square)

---

## 🚀 Features

- 🔐 **User Authentication**  
  Secure login and registration using **JWT** stored in `HttpOnly` cookies.

- 🔑 **Password Hashing**  
  Passwords are hashed using `bcryptjs` for strong security.

- 🔁 **Real-Time Messaging**  
  Live chat using WebSocket protocol (`ws`) with bidirectional communication.

- 💬 **Chat Rooms**  
  Create or join custom rooms to organize conversations.

- 🧠 **MVC Architecture**  
  Clean project structure using Model-View-Controller pattern.

- 🛡️ **Protected Routes & Sockets**  
  Middleware-secured HTTP routes and WebSocket connections.

---

## 🧱 Tech Stack

| Category       | Tech                                                         |
|----------------|--------------------------------------------------------------|
| **Backend**    | Node.js, Express.js, WebSocket (`ws`)                        |
| **Database**   | PostgreSQL (via Sequelize ORM)                               |
| **Auth**       | JSON Web Token (`jsonwebtoken`), Bcrypt (`bcryptjs`)         |
| **Middleware** | Cookie Parser (`cookie-parser`)                              |
| **Templating** | Pug                                                          |

---

## 🛠️ Getting Started

Follow these instructions to get the project running locally for development or testing.

### ✅ Prerequisites

- Node.js (v18.x or later)
- PostgreSQL database (local or hosted)

### 📦 Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/illegal1/echat.git
   cd echat
