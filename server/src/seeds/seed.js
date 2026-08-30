import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';
import { ComplaintUpdate } from '../models/ComplaintUpdate.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintUpdate.deleteMany({});
    await Notification.deleteMany({});

    console.log('🧹 Cleaned up existing collections.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Campus Administrator',
      email: 'admin@college.edu',
      password: 'Admin@123',
      department: 'Administration',
      role: 'admin',
    });

    const student1 = await User.create({
      name: 'Alex Chen',
      email: 'alex@college.edu',
      password: 'Student@123',
      studentId: 'STU-2024-101',
      department: 'Computer Science',
      year: '3rd Year',
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      password: 'Student@123',
      studentId: 'STU-2024-205',
      department: 'Electronics & Comm',
      year: '2nd Year',
      role: 'student',
    });

    console.log('👥 Created Admin and Demo Students');

    // 2. Create Realistic Complaints
    const complaint1 = await Complaint.create({
      complaintId: 'CMP-001',
      studentId: student1._id,
      title: 'Wi-Fi connection dropped in Computer Lab 2',
      category: 'Wi-Fi / Internet',
      description: 'The wireless access point in Computer Lab 2 on the 3rd floor is refusing connections since this morning. Practical exams are scheduled for tomorrow.',
      summary: 'Wi-Fi access point in Computer Lab 2 is down prior to practical exams.',
      location: 'Computer Lab 2 - Science Block 3rd Floor',
      priority: 'High',
      status: 'In Progress',
      department: 'IT Department',
      assignedStaff: 'IT Administrator',
      adminComment: 'Network engineer dispatched with replacement access point router.',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60',
      imageClassification: 'Network / Router Disruption',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
    });

    const complaint2 = await Complaint.create({
      complaintId: 'CMP-002',
      studentId: student2._id,
      title: 'Hostel Block A hot water geyser malfunctioning',
      category: 'Hostel',
      description: 'Second floor geyser in Block A bathroom trips the main circuit breaker whenever switched on.',
      summary: 'Hostel Block A 2nd floor bathroom geyser trips circuit breaker.',
      location: 'Hostel Block A - 2nd Floor Washroom',
      priority: 'Medium',
      status: 'Under Review',
      department: 'Hostel',
      assignedStaff: 'Hostel Warden',
      imageUrl: '',
      imageClassification: 'Hostel Maintenance Issue',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    });

    const complaint3 = await Complaint.create({
      complaintId: 'CMP-003',
      studentId: student1._id,
      title: 'Ceiling projector flickers in Room 204',
      category: 'Classroom',
      description: 'HDMI cable connector is loose and projector lamp shuts off intermittently during lectures.',
      summary: 'Projector in Room 204 HDMI connector loose and turning off.',
      location: 'Main Block - Room 204',
      priority: 'Medium',
      status: 'Resolved',
      department: 'Maintenance',
      assignedStaff: 'Maintenance Officer',
      adminComment: 'Technician replaced the ceiling HDMI cabling and recalibrated lamp.',
      resolutionDetails: 'Replaced faulty HDMI cable, tested with multiple laptops. Projector operates normally.',
      resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      rating: 5,
      feedback: 'Very prompt resolution before our afternoon seminar! Thank you.',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
      imageClassification: 'Classroom Facility Damage',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    });

    const complaint4 = await Complaint.create({
      complaintId: 'CMP-004',
      studentId: student2._id,
      title: 'Cafeteria seating area water dispenser leak',
      category: 'Cleanliness',
      description: 'Water dispenser near North exit is leaking clean water onto floor, creating slip hazard.',
      summary: 'Leaking water dispenser near cafeteria North exit causing safety hazard.',
      location: 'Student Cafeteria - North Wing',
      priority: 'Low',
      status: 'Submitted',
      department: 'Housekeeping',
      assignedStaff: '',
      imageUrl: '',
      imageClassification: 'Sanitation / Cleaning Required',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });

    const complaint5 = await Complaint.create({
      complaintId: 'CMP-005',
      studentId: student1._id,
      title: 'College Bus Route #4 engine overheating delay',
      category: 'Transportation',
      description: 'The morning pickup bus broke down twice this week on Highway junction.',
      summary: 'Route 4 college bus suffering frequent engine breakdown on highway.',
      location: 'College Bus - Route 4 (North Suburbs)',
      priority: 'Critical',
      status: 'In Progress',
      department: 'Transportation',
      assignedStaff: 'Transport Supervisor',
      isEscalated: true,
      escalatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      adminComment: 'Mechanic team inspecting cooling radiator. Backup bus deployed.',
      imageUrl: '',
      imageClassification: 'Vehicle / Transit Discrepancy',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });

    // 3. Create Timeline Updates
    await ComplaintUpdate.create([
      {
        complaintId: complaint1._id,
        adminId: student1._id,
        message: 'Complaint CMP-001 submitted by student',
        status: 'Submitted',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint1._id,
        adminId: admin._id,
        message: 'Status updated from "Submitted" to "Under Review" | Assigned to IT Department (Staff: IT Administrator)',
        status: 'Under Review',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint1._id,
        adminId: admin._id,
        message: 'Status updated from "Under Review" to "In Progress" | Admin note: "Network engineer dispatched with replacement access point router."',
        status: 'In Progress',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint3._id,
        adminId: student1._id,
        message: 'Complaint CMP-003 submitted by student',
        status: 'Submitted',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint3._id,
        adminId: admin._id,
        message: 'Assigned to Maintenance (Staff: Maintenance Officer)',
        status: 'Assigned',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
      {
        complaintId: complaint3._id,
        adminId: admin._id,
        message: 'Issue marked as Resolved. Resolution: Replaced faulty HDMI cable, tested with multiple laptops. Projector operates normally.',
        status: 'Resolved',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ]);

    // 4. Create Notifications
    await Notification.create([
      {
        userId: student1._id,
        complaintId: complaint1._id,
        complaintFormattedId: 'CMP-001',
        type: 'status_changed',
        title: 'Status changed to In Progress',
        message: 'Your complaint "Wi-Fi connection dropped in Computer Lab 2" is now In Progress by IT Department.',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      },
      {
        userId: student1._id,
        complaintId: complaint3._id,
        complaintFormattedId: 'CMP-003',
        type: 'complaint_resolved',
        title: 'Complaint Resolved: CMP-003',
        message: 'Your complaint "Ceiling projector flickers in Room 204" has been resolved. Please rate our service!',
        isRead: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        userId: student2._id,
        complaintId: complaint2._id,
        complaintFormattedId: 'CMP-002',
        type: 'complaint_assigned',
        title: 'Complaint Assigned',
        message: 'Your complaint CMP-002 has been assigned to Hostel Warden for inspection.',
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ]);

    console.log('✨ Seed data created successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo Login Credentials:');
    console.log('   Admin:   admin@college.edu / Admin@123');
    console.log('   Student: alex@college.edu  / Student@123');
    console.log('   Student: priya@college.edu / Student@123');
    console.log('----------------------------------------------------');

    return { admin, student1, student2 };
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    throw err;
  }
};

// Execute if run directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      await closeDB();
      process.exit(1);
    });
}
