#!/usr/bin/env node

const bcrypt = require('bcrypt');
const User = require('./models/User');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  try {
    console.log(`Resetting password for ${email}...`);
    
    const user = await User.findUserByEmail(email);
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await User.updateUser(user.id, { passwordHash: hashedPassword });
    
    console.log('✅ Password updated successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetPassword();
