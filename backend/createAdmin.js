const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

mongoose.connect('mongodb://localhost:27017/DMS', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  const email = "f219340@cfd.nu.edu.pk".trim().toLowerCase();
  const password = "12346789";

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.deleteMany({ email });

  const admin = new Admin({ email, password: hashedPassword });
  await admin.save();

  console.log("✅ Admin account created correctly!");

  mongoose.disconnect();
})
.catch(err => console.error("⚠️ Error:", err));
