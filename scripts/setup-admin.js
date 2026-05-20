const mongoose = require('mongoose');
const { connectDB } = require('../lib/db');
const { User } = require('../lib/models');

async function setupAdmin() {
  try {
    await connectDB();
    
    // Create or update admin user
    const adminEmail = 'admin@nicsi.gov.in';
    const adminPassword = 'admin123'; // Change this in production
    
    // Check if admin already exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // Update existing user to admin role
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('Updated existing user to admin role:', adminEmail);
    } else {
      // Create new admin user
      const crypto = require('crypto');
      
      function hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
      }
      
      function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      adminUser = new User({
        userId: generateUserId(),
        name: 'NICSI Admin',
        email: adminEmail,
        phone: '0000000000',
        department: 'Administration',
        password: hashPassword(adminPassword),
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Created new admin user:', adminEmail);
      console.log('Password:', adminPassword);
    }
    
    console.log('Admin setup complete!');
    console.log('Login credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupAdmin();
