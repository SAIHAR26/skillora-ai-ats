/**
 * Seed Script for Skillora Database
 * Creates sample records for testing
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Recruiter = require("./models/Recruiter");
const Candidate = require("./models/Candidate");
const Admin = require("./models/Admin");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Recruiter.deleteMany({});
    await Candidate.deleteMany({});
    await Admin.deleteMany({});
    console.log("📝 Cleared existing collections");

    // Create sample recruiter user
    const recruiterUser = await User.create({
      name: "John Doe",
      email: "recruiter@company.com",
      passwordHash: await bcrypt.hash("SecurePassword123!", 10),
      role: "recruiter",
      status: "active",
      profileCompleted: true,
    });
    console.log("✅ Created Recruiter User");

    // Create recruiter profile
    const recruiter = await Recruiter.create({
      userId: recruiterUser._id,
      age: 35,
      phoneNumber: "+1-555-0123",
      personalEmail: "john.doe@personal.com",
      linkedinProfile: "https://linkedin.com/in/johndoe",
      companyName: "Tech Solutions Inc",
      companyEmail: "john.doe@techsolutions.com",
      companyAddress: "123 Tech Street, Silicon Valley, CA 94025",
      companyWebsite: "https://techsolutions.com",
      companySize: "500-1000",
      companyId: "TSI-2026",
      industry: "Technology",
      roleInCompany: "Senior Recruiter",
      yearsOfExperience: 8,
      description: "Experienced recruiter specializing in tech talent",
      verificationStatus: "approved",
      verified: true,
    });
    console.log("✅ Created Recruiter Profile");

    // Create sample candidate user
    const candidateUser = await User.create({
      name: "Jane Smith",
      email: "jane.smith@gmail.com",
      passwordHash: await bcrypt.hash("CandidatePass123!", 10),
      role: "candidate",
      status: "active",
      profileCompleted: true,
    });
    console.log("✅ Created Candidate User");

    // Create candidate profile
    const candidate = await Candidate.create({
      userId: candidateUser._id,
      phoneNumber: "+1-555-0456",
      headline: "Full Stack Developer | React & Node.js Expert",
      summary: "Passionate developer with 5+ years of experience in web development",
      currentLocation: "San Francisco, CA",
      location: "San Francisco, CA",
      preferredLocations: ["San Francisco", "New York", "Austin"],
      linkedin: "https://linkedin.com/in/janesmith",
      github: "https://github.com/janesmith",
      experienceLevel: "Mid-Level",
      experienceYears: 5,
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express.js", "TypeScript"],
      education: [
        {
          college: "University of California",
          institution: "UC Berkeley",
          degree: "Bachelor of Science",
          specialization: "Computer Science",
          field: "Computer Science",
          graduationYear: 2019,
          cgpa: 3.8,
          startDate: new Date("2015-09-01"),
          endDate: new Date("2019-05-15"),
        },
      ],
      workExperience: [
        {
          company: "WebDev Corp",
          title: "Senior Developer",
          startDate: new Date("2021-03-01"),
          endDate: new Date(),
          description: "Led development of client-facing web applications",
        },
      ],
      projects: [
        {
          name: "E-commerce Platform",
          description: "Built a full-stack e-commerce platform with MERN",
          link: "https://github.com/janesmith/ecommerce",
        },
      ],
      certifications: [
        {
          name: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          date: new Date("2023-06-15"),
          credentialUrl: "https://aws.amazon.com/certification",
        },
      ],
      preferredJobTypes: ["Full-time", "Remote"],
      workPreference: ["Remote", "Hybrid"],
      resumeIds: [],
    });
    console.log("✅ Created Candidate Profile");
    // Create Lasya candidate user advertised on the login page
    const lasyaUser = await User.create({
      name: "Lasya",
      email: "lasya@skillora.com",
      passwordHash: await bcrypt.hash("LasyaPass123!", 10),
      role: "candidate",
      status: "active",
      profileCompleted: true,
    });
    console.log("Created Lasya Candidate User");

    await Candidate.create({
      userId: lasyaUser._id,
      id: "cand-lasya",
      name: "Lasya",
      email: "lasya@skillora.com",
      phone: "+91-98765-43210",
      phoneNumber: "+91-98765-43210",
      avatar: "/images/candidate-lasya.jpg",
      college: "Vellore Institute of Technology",
      degree: "Bachelor of Technology",
      specialization: "Artificial Intelligence and Data Science",
      graduationYear: "2025",
      cgpa: 8.9,
      skills: ["Python", "React", "Machine Learning", "SQL", "Node.js"],
      education: ["B.Tech Artificial Intelligence and Data Science, Vellore Institute of Technology"],
      projects: ["AI resume screening dashboard", "Skill-based job recommendation engine"],
      experienceLevel: "Fresher",
      atsScore: 96,
      location: "Hyderabad, India",
      currentLocation: "Hyderabad, India",
      preferredLocation: "Remote",
      preferredLocations: ["Remote"],
      workPreference: "Full-time",
      preferredJobTypes: ["Full-time"],
      linkedin: "https://linkedin.com/in/lasya-skillora",
      github: "https://github.com/lasya-skillora",
      resumeUrl: "/resumes/lasya.pdf",
      appliedJobs: [],
      resumeIds: [],
      status: "active",
    });
    console.log("Created Lasya Candidate Profile");

    // Create sample admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@skillora.com",
      passwordHash: await bcrypt.hash("AdminPass123!", 10),
      role: "admin",
      status: "active",
      profileCompleted: true,
    });
    console.log("✅ Created Admin User");

    // Create admin profile
    const admin = await Admin.create({
      userId: adminUser._id,
      phoneNumber: "+1-555-0789",
      department: "Operations",
      permissions: [
        "manage_recruiters",
        "manage_candidates",
        "manage_jobs",
        "manage_complaints",
        "manage_opportunities",
        "view_analytics",
      ],
      adminLevel: "super_admin",
      isActive: true,
      notes: "Primary system administrator",
    });
    console.log("✅ Created Admin Profile");

    console.log("\n✅ All sample data created successfully!");
    console.log("\n📊 Summary:");
    console.log("  - Recruiter User: recruiter@company.com");
    console.log("  - Candidate User: jane.smith@gmail.com");
    console.log("  - Lasya Candidate User: lasya@skillora.com");
    console.log("  - Admin User: admin@skillora.com");
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log("\n✅ Database seeding complete");
};

main();
