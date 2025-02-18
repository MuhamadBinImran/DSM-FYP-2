const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  companyEmail: {
    type: String,  // Storing the email of the company posting the job
    required: true,
  },
  companyName: {
    type: String,  // Storing the name of the company posting the job
    required: true,  // This can be made optional if needed
  },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
