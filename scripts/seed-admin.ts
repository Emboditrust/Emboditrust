import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '@/models/Admin';


async function seedAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI!;
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@emboditrust.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const password = 'TheEmbodimentTechnologies@26';
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new Admin({
      email: 'admin@emboditrust.com',
      password: hashedPassword, // Changed from passwordHash to password
      name: 'System Administrator',
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@emboditrust.com');
    console.log('🔑 Password: TheEmbodimentTechnologies@26');
    console.log('⚠️  Change this password after first login!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

//npx ts-node -r tsconfig-paths/register -P scripts/tsconfig.scripts.json scripts/seed-admin.ts

seedAdmin();