const { runQuery, getQuery, allQuery } = require('../database/database');

class Session {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.createdAt = data.created_at;
    this.expiresAt = data.expires_at;
    this.isActive = data.is_active;
    this.characterCount = data.character_count;
  }

  static async create(sessionId, userId = null, expiresInHours = 24) {
    try {
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
      
      const result = await runQuery(
        `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *`,
        [sessionId, userId, expiresAt]
      );

      return new Session(result);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async findById(sessionId) {
    try {
      const session = await getQuery(
        `SELECT * FROM sessions WHERE id = $1 AND is_active = true AND expires_at > NOW()`,
        [sessionId]
      );

      return session ? new Session(session) : null;
    } catch (error) {
      console.error('Error finding session:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const sessions = await allQuery(
        `SELECT * FROM sessions WHERE user_id = $1 AND is_active = true AND expires_at > NOW() ORDER BY created_at DESC`,
        [userId]
      );

      return sessions.map(session => new Session(session));
    } catch (error) {
      console.error('Error finding sessions by user:', error);
      throw error;
    }
  }

  static async updateLastActivity(sessionId) {
    try {
      await runQuery(
        `UPDATE sessions SET expires_at = $1 WHERE id = $2`,
        [new Date(Date.now() + 24 * 60 * 60 * 1000), sessionId] // Extend by 24 hours
      );
      return true;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return false;
    }
  }
  
  static async updateCharacterCount(characterCount, sessionId) {
    try {
      await runQuery(
        `UPDATE sessions SET character_count = character_count + $1 WHERE id = $2`,
        [characterCount, sessionId]
      );
      return true;
    } catch (error) {
      console.error('Error updating character count:', error);
      return false;
    }
  }

  static async deactivate(sessionId) {
    try {
      await runQuery(
        `UPDATE sessions SET is_active = false WHERE id = $1`,
        [sessionId]
      );
      return true;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  static async cleanupExpired() {
    try {
      const result = await runQuery(
        `UPDATE sessions SET is_active = false WHERE expires_at <= NOW() AND is_active = true`,
        []
      );
      console.log(`🧹 Cleaned up ${result.rowCount} expired sessions`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  static async getActiveSessionCount() {
    try {
      const result = await getQuery(
        `SELECT COUNT(*) as count FROM sessions WHERE is_active = true AND expires_at > NOW()`,
        []
      );
      return parseInt(result.count);
    } catch (error) {
      console.error('Error getting active session count:', error);
      return 0;
    }
  }
}

module.exports = Session;
