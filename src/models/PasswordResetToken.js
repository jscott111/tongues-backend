const { runQuery } = require('../database/database');
const crypto = require('crypto');

class PasswordResetToken {
  constructor(id, userId, token, expiresAt, used, createdAt) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.used = used;
    this.createdAt = createdAt;
  }

  /**
   * Create a new password reset token
   * @param {number} userId - The user ID
   * @param {number} expirationMinutes - Token expiration time in minutes (default: 60)
   * @returns {Promise<PasswordResetToken>}
   */
  static async create(userId, expirationMinutes = 60) {
    try {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

      // Invalidate any existing tokens for this user
      await runQuery(
        'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
        [userId]
      );

      // Insert new token
      const result = await runQuery(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, $3) 
         RETURNING id, user_id, token, expires_at, used, created_at`,
        [userId, token, expiresAt]
      );

      const row = result.rows[0];
      return new PasswordResetToken(
        row.id,
        row.user_id,
        row.token,
        row.expires_at,
        row.used,
        row.created_at
      );
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
  }

  /**
   * Find a valid token by token string
   * @param {string} token - The token string
   * @returns {Promise<PasswordResetToken|null>}
   */
  static async findByToken(token) {
    try {
      const result = await runQuery(
        `SELECT id, user_id, token, expires_at, used, created_at 
         FROM password_reset_tokens 
         WHERE token = $1 AND used = false AND expires_at > NOW()`,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new PasswordResetToken(
        row.id,
        row.user_id,
        row.token,
        row.expires_at,
        row.used,
        row.created_at
      );
    } catch (error) {
      console.error('Error finding password reset token:', error);
      throw error;
    }
  }

  /**
   * Mark a token as used
   * @param {string} token - The token string
   * @returns {Promise<boolean>}
   */
  static async markAsUsed(token) {
    try {
      const result = await runQuery(
        'UPDATE password_reset_tokens SET used = true WHERE token = $1',
        [token]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error marking token as used:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   * @returns {Promise<number>} Number of tokens cleaned up
   */
  static async cleanupExpired() {
    try {
      const result = await runQuery(
        'DELETE FROM password_reset_tokens WHERE expires_at < NOW()',
        []
      );
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  /**
   * Get all tokens for a user (for debugging)
   * @param {number} userId - The user ID
   * @returns {Promise<PasswordResetToken[]>}
   */
  static async findByUserId(userId) {
    try {
      const result = await runQuery(
        `SELECT id, user_id, token, expires_at, used, created_at 
         FROM password_reset_tokens 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows.map(row => new PasswordResetToken(
        row.id,
        row.user_id,
        row.token,
        row.expires_at,
        row.used,
        row.created_at
      ));
    } catch (error) {
      console.error('Error finding tokens by user ID:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      token: this.token,
      expiresAt: this.expiresAt,
      used: this.used,
      createdAt: this.createdAt
    };
  }
}

module.exports = PasswordResetToken;


