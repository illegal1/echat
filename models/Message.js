const pool = require('../db/db');

class Message {
  static async getRecent(room, limit = 50) {
    const res = await pool.query(
      'SELECT username, message, timestamp FROM chat_messages WHERE room = $1 ORDER BY timestamp ASC LIMIT $2',
      [room, limit],
    );
    return res.rows;
  }
  static async create(room, username, message) {
    await pool.query(
      'INSERT INTO chat_messages (room, username, message) VALUES ($1, $2, $3)',
      [room, username, message],
    );
  }

}

module.exports = Message;
