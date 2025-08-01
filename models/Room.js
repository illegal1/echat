const pool = require('./../db/db');

class Room {
  static async getAllRooms() {
    const result = await pool.query(
      'SELECT id, name, created_by, created_at FROM chat_rooms',
    );
    return result.rows;
  }

  static async createRoom(name, password, created_by) {
    const result = await pool.query(
      'INSERT INTO chat_rooms(name, password, created_by) VALUES ($1,$2,$3) RETURNING id, name, created_by',
      [name, password, created_by],
    );
    return result.rows[0];
  }

  static async getRoom(name) {
    const result = await pool.query(
      'SELECT * FROM chat_rooms WHERE name = $1',
      [name],
    );
    return result.rows[0];
  }
}

module.exports = Room;
