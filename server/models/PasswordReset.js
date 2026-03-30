const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    resetToken: {
      type: String,
      required: true,
      unique: true,
    },
    resetCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete after expiry
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
