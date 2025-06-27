const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const publisherSchema = new mongoose.Schema({
  agencyName: {
    type: String,
    required: [true, 'Agency name is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  regions: {
    type: [String],
    required: [true, 'At least one region is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(region => typeof region === 'string' && region.trim().length > 0);
      },
      message: 'At least one valid region is required'
    }
  },
  role: {
    type: String,
    enum: ['publisher'],
    default: 'publisher'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
publisherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
publisherSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher; 