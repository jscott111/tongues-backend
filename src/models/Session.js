const { runQuery, getQuery, allQuery } = require('../database/database');

class Session {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.createdAt = data.created_at;
    this.lastActivity = data.last_activity;
    this.isActive = data.is_active;
    this.characterCount = data.character_count;
  }

  static async create(sessionId, userId = null) {
    try {
      const result = await runQuery(
        `INSERT INTO sessions (id, user_id) VALUES ($1, $2) RETURNING *`,
        [sessionId, userId]
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
        `SELECT * FROM sessions WHERE id = $1 AND is_active = true`,
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
        `SELECT * FROM sessions WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`,
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
        `UPDATE sessions SET last_activity = NOW() WHERE id = $1`,
        [sessionId]
      );
      return true;
    } catch (error) {
      console.error('Error updating last activity:', error);
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

  static async deactivateAllForUser(userId) {
    try {
      await runQuery(
        `UPDATE sessions SET is_active = false WHERE user_id = $1 AND is_active = true`,
        [userId]
      );
      return true;
    } catch (error) {
      console.error('Error deactivating sessions for user:', error);
      return false;
    }
  }

  static async deactivateAllForUserExcept(userId, exceptSessionId) {
    try {
      await runQuery(
        `UPDATE sessions SET is_active = false WHERE user_id = $1 AND is_active = true AND id != $2`,
        [userId, exceptSessionId]
      );
      return true;
    } catch (error) {
      console.error('Error deactivating sessions for user except current:', error);
      return false;
    }
  }

  static async getActiveSessionCount() {
    try {
      const result = await getQuery(
        `SELECT COUNT(*) as count FROM sessions WHERE is_active = true`,
        []
      );
      return parseInt(result.count);
    } catch (error) {
      console.error('Error getting active session count:', error);
      return 0;
    }
  }

  static async getActiveSessionsForUser(userId) {
    try {
      const sessions = await getQuery(
        `SELECT * FROM sessions WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`,
        [userId]
      );
      return sessions.map(session => new Session(session));
    } catch (error) {
      console.error('Error getting active sessions for user:', error);
      return [];
    }
  }

  static async cleanupExpired() {
    try {
      const result = await runQuery(
        `UPDATE sessions SET is_active = false 
         WHERE is_active = true 
         AND last_activity < NOW() - INTERVAL '24 hours'`,
        []
      );
      
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }
}

module.exports = Session;
