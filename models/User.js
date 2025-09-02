const bcrypt = require('bcrypt');

class User {
  constructor() {
    // In-memory storage for demo purposes
    // In production, you'd use a proper database like MongoDB, PostgreSQL, etc.
    this.users = new Map();
    this.nextId = 1;
  }

  async createUser(userData) {
    const { email, password, name } = userData;
    
    // Check if user already exists
    if (this.findUserByEmail(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const user = {
      id: this.nextId++,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    // Store user
    this.users.set(user.id, user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateUser(email, password) {
    const user = this.findUserByEmail(email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email.toLowerCase().trim()) {
        return user;
      }
    }
    return null;
  }

  findUserById(id) {
    const user = this.users.get(parseInt(id));
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  updateUser(id, updateData) {
    const user = this.users.get(parseInt(id));
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    const allowedFields = ['name', 'email'];
    const updatedUser = { ...user };
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updatedUser[field] = updateData[field];
      }
    }
    
    updatedUser.updatedAt = new Date().toISOString();
    this.users.set(parseInt(id), updatedUser);
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  deactivateUser(id) {
    const user = this.users.get(parseInt(id));
    
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    user.updatedAt = new Date().toISOString();
    this.users.set(parseInt(id), user);
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getAllUsers() {
    const users = [];
    for (const user of this.users.values()) {
      const { password: _, ...userWithoutPassword } = user;
      users.push(userWithoutPassword);
    }
    return users;
  }
}

module.exports = new User();
