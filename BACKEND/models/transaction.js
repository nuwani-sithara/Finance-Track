const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
  recurring: {
    type: Boolean,
    default: false,
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
  },
  endDate: {
    type: Date,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);