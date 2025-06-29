const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create subjects
    const subjects = [
      { name: 'Mathematics', code: 'MATH101', grade: '10', credits: 4 },
      { name: 'English', code: 'ENG101', grade: '10', credits: 3 },
      { name: 'Science', code: 'SCI101', grade: '10', credits: 4 },
      { name: 'History', code: 'HIST101', grade: '10', credits: 3 },
      { name: 'Geography', code: 'GEO101', grade: '10', credits: 3 }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log('Subjects created');

    // Create teacher
    const teacher = new User({
      firstName: 'John',
      lastName: 'Teacher',
      email: 'teacher@school.com',
      password: 'teacher123',
      role: 'teacher',
      employeeId: 'EMP20240001',
      department: 'Mathematics',
      qualification: 'M.Sc Mathematics',
      experience: 5,
      subjects: [createdSubjects[0]._id], // Math subject
      phone: '+1234567891'
    });
    await teacher.save();
    console.log('Teacher created');

    // Create class
    const classData = new Class({
      name: 'Grade 10-A',
      grade: '10',
      section: 'A',
      academicYear: '2024-2025',
      classTeacher: teacher._id,
      subjects: [{
        subject: createdSubjects[0]._id,
        teacher: teacher._id
      }],
      capacity: 40,
      room: 'Room 101'
    });
    await classData.save();
    console.log('Class created');

    // Create student
    const student = new User({
      firstName: 'Jane',
      lastName: 'Student',
      email: 'student@school.com',
      password: 'student123',
      role: 'student',
      studentId: 'STU20240001',
      enrollmentDate: new Date(),
      class: classData._id,
      dateOfBirth: new Date('2008-05-15'),
      gender: 'female',
      phone: '+1234567892'
    });
    await student.save();

    // Update class with student
    await Class.findByIdAndUpdate(classData._id, {
      $push: { students: student._id }
    });

    console.log('Student created');

    // Create parent
    const parent = new User({
      firstName: 'Robert',
      lastName: 'Parent',
      email: 'parent@school.com',
      password: 'parent123',
      role: 'parent',
      children: [student._id],
      phone: '+1234567893'
    });
    await parent.save();

    // Update student with parent
    await User.findByIdAndUpdate(student._id, {
      parentId: parent._id
    });

    console.log('Parent created');
    console.log('Demo data seeded successfully!');
    
    console.log('\n--- Demo Credentials ---');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher: teacher@school.com / teacher123');
    console.log('Student: student@school.com / student123');
    console.log('Parent: parent@school.com / parent123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run seeder
seedData();
