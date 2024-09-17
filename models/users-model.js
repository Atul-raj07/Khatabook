const  mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  hisaab: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Hisaab", 
  }],
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
