const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD missing");
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await Admin.findOneAndUpdate(
    { email },
    { email, password: hashedPassword },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${admin.email}`);
};

module.exports = seedAdmin;
