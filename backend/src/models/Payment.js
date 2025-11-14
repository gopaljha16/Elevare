const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
    index: true
  },
  // Razorpay payment details
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  // Payment information
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'authorized', 'captured', 'failed', 'refunded'],
    default: 'created',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'wallet', 'upi', 'emi', 'other']
  },
  // Plan details
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  // Transaction details
  transactionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  capturedAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  // Error handling
  errorCode: {
    type: String
  },
  errorDescription: {
    type: String
  },
  errorSource: {
    type: String
  },
  errorStep: {
    type: String
  },
  errorReason: {
    type: String
  },
  // Refund information
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundId: {
    type: String
  },
  // Invoice details
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  invoiceNumber: {
    type: String
  },
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    attemptCount: {
      type: Number,
      default: 1
    },
    webhookReceived: {
      type: Boolean,
      default: false
    },
    webhookReceivedAt: Date,
    notes: String
  },
  // Discount and offers
  discountApplied: {
    type: Boolean,
    default: false
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountCode: {
    type: String
  },
  referralCreditUsed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ transactionDate: -1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for net amount after discount
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.discountAmount - this.referralCreditUsed;
});

// Virtual for is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'captured' || this.status === 'authorized';
});

// Virtual for is failed
paymentSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

// Virtual for is refunded
paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded';
});

// Method to mark payment as captured
paymentSchema.methods.markAsCaptured = async function(paymentId, signature) {
  this.status = 'captured';
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.capturedAt = new Date();
  this.metadata.webhookReceived = true;
  this.metadata.webhookReceivedAt = new Date();
  
  await this.save();
  return this;
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = async function(errorDetails) {
  this.status = 'failed';
  this.failedAt = new Date();
  
  if (errorDetails) {
    this.errorCode = errorDetails.code;
    this.errorDescription = errorDetails.description;
    this.errorSource = errorDetails.source;
    this.errorStep = errorDetails.step;
    this.errorReason = errorDetails.reason;
  }
  
  await this.save();
  return this;
};

// Method to process refund
paymentSchema.methods.processRefund = async function(refundAmount, reason, refundId) {
  this.status = 'refunded';
  this.refundAmount = refundAmount || this.amount;
  this.refundReason = reason;
  this.refundId = refundId;
  this.refundedAt = new Date();
  
  await this.save();
  return this;
};

// Method to increment attempt count
paymentSchema.methods.incrementAttempt = async function() {
  this.metadata.attemptCount += 1;
  await this.save();
  return this;
};

// Method to apply discount
paymentSchema.methods.applyDiscount = function(discountAmount, discountCode) {
  this.discountApplied = true;
  this.discountAmount = discountAmount;
  this.discountCode = discountCode;
  return this;
};

// Method to apply referral credit
paymentSchema.methods.applyReferralCredit = function(creditAmount) {
  this.referralCreditUsed = creditAmount;
  return this;
};

// Static method to find payments by user
paymentSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.status) {
    query.where('status').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query.sort({ transactionDate: -1 });
};

// Static method to find successful payments
paymentSchema.statics.findSuccessful = function(startDate, endDate) {
  const query = {
    status: { $in: ['captured', 'authorized'] }
  };
  
  if (startDate && endDate) {
    query.transactionDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.find(query).sort({ transactionDate: -1 });
};

// Static method to calculate revenue
paymentSchema.statics.calculateRevenue = async function(startDate, endDate) {
  const matchStage = {
    status: { $in: ['captured', 'authorized'] }
  };
  
  if (startDate && endDate) {
    matchStage.transactionDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalDiscount: { $sum: '$discountAmount' },
        totalReferralCredit: { $sum: '$referralCreditUsed' },
        netRevenue: { 
          $sum: { 
            $subtract: [
              '$amount', 
              { $add: ['$discountAmount', '$referralCreditUsed'] }
            ]
          }
        },
        transactionCount: { $sum: 1 },
        averageTransactionValue: { $avg: '$amount' }
      }
    }
  ]);
  
  return result[0] || {
    totalRevenue: 0,
    totalDiscount: 0,
    totalReferralCredit: 0,
    netRevenue: 0,
    transactionCount: 0,
    averageTransactionValue: 0
  };
};

// Static method to get payment stats by plan
paymentSchema.statics.getStatsByPlan = async function(startDate, endDate) {
  const matchStage = {
    status: { $in: ['captured', 'authorized'] }
  };
  
  if (startDate && endDate) {
    matchStage.transactionDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);
  
  return stats;
};

// Static method to get failed payment reasons
paymentSchema.statics.getFailureAnalysis = async function(startDate, endDate) {
  const matchStage = {
    status: 'failed'
  };
  
  if (startDate && endDate) {
    matchStage.transactionDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const analysis = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$errorReason',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return analysis;
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
