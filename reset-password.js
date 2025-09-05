#!/usr/bin/env node

const bcrypt = require('bcrypt');
const User = require('./models/User');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.log('Usage: node reset-password.js <email> <new-password>');
    process.exit(1);
  }
  
  try {
    console.log(`Resetting password for ${email}...`);
    
    // Find the user
    const user = await User.findUserByEmail(email);
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.name}`);
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user
    await User.updateUser(user.id, { passwordHash: hashedPassword });
    
    console.log('✅ Password updated successfully!');
    console.log(`You can now login with email: ${email} and password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }
}

resetPassword();
