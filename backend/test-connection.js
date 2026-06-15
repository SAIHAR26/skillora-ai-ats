/**
 * MongoDB Connection Diagnostic Tool
 * Tests connectivity and identifies issues
 */

const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  console.log("\n🔍 MongoDB Connection Diagnostic\n");
  console.log("=" .repeat(50));

  // Check environment
  console.log("\n📋 Configuration Check:");
  console.log("-" .repeat(50));
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log("❌ MONGO_URI not found in .env");
    return;
  }
  
  console.log("✅ MONGO_URI configured");
  
  // Parse connection string safely
  const urlObj = new URL(mongoUri);
  console.log("  - Host: " + urlObj.hostname);
  console.log("  - Database: " + urlObj.pathname.replace("/", ""));
  console.log("  - Username: " + urlObj.username);

  // Test connection
  console.log("\n🧪 Connection Test:");
  console.log("-" .repeat(50));

  try {
    console.log("⏳ Attempting to connect to MongoDB Atlas...");
    
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log("✅ Connection successful!");
    console.log("  - Connected to: " + connection.connection.host);
    console.log("  - Database: " + connection.connection.name);
    console.log("  - Connection ready state: " + connection.connection.readyState);

    // List databases (requires admin privileges)
    try {
      const admin = connection.connection.getClient().db("admin");
      const databases = await admin.admin().listDatabases();
      console.log("✅ Can list databases");
      console.log("  - Total databases: " + databases.databases.length);
    } catch (e) {
      console.log("⚠️  Cannot list databases (may lack permissions)");
    }

    await mongoose.connection.close();
    console.log("\n✅ Connection closed successfully");

  } catch (error) {
    console.log("❌ Connection failed!");
    console.log("  Error: " + error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n🔧 Troubleshooting ECONNREFUSED:");
      console.log("  1. Check MongoDB Atlas IP Whitelist:");
      console.log("     - Go to: https://cloud.mongodb.com");
      console.log("     - Select Project → Network Access");
      console.log("     - Add your IP or use 0.0.0.0/0 (for development)");
      console.log("  2. Verify credentials are correct");
      console.log("  3. Check your internet connection");
      console.log("  4. Try pinging the server:");
      console.log("     nslookup cluster0.36hjtsn.mongodb.net");
    } else if (error.message.includes("authentication failed")) {
      console.log("\n🔧 Troubleshooting Authentication Failed:");
      console.log("  1. Verify username: skilloraadmin");
      console.log("  2. Verify password is correct");
      console.log("  3. Special characters in password must be URL-encoded");
      console.log("  4. Check if user exists in MongoDB Atlas");
    } else if (error.message.includes("getaddrinfo")) {
      console.log("\n🔧 Troubleshooting DNS Resolution:");
      console.log("  1. Check internet connection");
      console.log("  2. Try DNS: nslookup cluster0.36hjtsn.mongodb.net");
      console.log("  3. Verify .env file has correct hostname");
    }
  }

  console.log("\n" + "=" .repeat(50));
  console.log("Diagnostic complete.\n");
};

testConnection();
