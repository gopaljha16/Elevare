const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  // Invoice details
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date
  },
  // Customer details
  customerDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    gstNumber: String
  },
  // Company details (your company)
  companyDetails: {
    name: {
      type: String,
      default: 'Elevare Technologies'
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    gstNumber: String,
    pan: String,
    email: String,
    phone: String,
    website: String
  },
  // Line items
  items: [{
    description: {
      type: String,
      required: true
    },
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
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  // Amounts
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    code: String,
    description: String
  },
  referralCredit: {
    type: Number,
    default: 0
  },
  // Tax details (GST for India)
  tax: {
    cgst: {
      rate: {
        type: Number,
        default: 9 // 9% CGST
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    sgst: {
      rate: {
        type: Number,
        default: 9 // 9% SGST
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    igst: {
      rate: {
        type: Number,
        default: 18 // 18% IGST for inter-state
      },
      amount: {
        type: Number,
        default: 0
      }
    },
    totalTax: {
      type: Number,
      default: 0
    }
  },
  total: {
    type: Number,
    required: true
  },
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partially_paid', 'refunded'],
    default: 'paid',
    index: true
  },
  paymentMethod: {
    type: String
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidDate: {
    type: Date
  },
  razorpayPaymentId: {
    type: String
  },
  // PDF details
  pdfUrl: {
    type: String
  },
  pdfGenerated: {
    type: Boolean,
    default: false
  },
  pdfGeneratedAt: {
    type: Date
  },
  // Email details
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  emailSentTo: {
    type: String
  },
  // Notes and metadata
  notes: {
    type: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
invoiceSchema.index({ userId: 1, invoiceDate: -1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ createdAt: -1 });

// Virtual for formatted invoice number
invoiceSchema.virtual('formattedInvoiceNumber').get(function() {
  return `INV-${this.invoiceNumber}`;
});

// Virtual for is paid
invoiceSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

// Virtual for is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.paymentStatus === 'paid') return false;
  if (!this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  }
  
  // Calculate taxable amount
  const taxableAmount = this.subtotal - this.discount.amount - this.referralCredit;
  
  // Calculate GST (assuming 18% total - 9% CGST + 9% SGST for intra-state)
  // For inter-state, use 18% IGST
  const isInterState = this.customerDetails.address?.state !== this.companyDetails.address?.state;
  
  if (isInterState) {
    // Inter-state: IGST
    this.tax.igst.amount = (taxableAmount * this.tax.igst.rate) / 100;
    this.tax.cgst.amount = 0;
    this.tax.sgst.amount = 0;
    this.tax.totalTax = this.tax.igst.amount;
  } else {
    // Intra-state: CGST + SGST
    this.tax.cgst.amount = (taxableAmount * this.tax.cgst.rate) / 100;
    this.tax.sgst.amount = (taxableAmount * this.tax.sgst.rate) / 100;
    this.tax.igst.amount = 0;
    this.tax.totalTax = this.tax.cgst.amount + this.tax.sgst.amount;
  }
  
  // Calculate total
  this.total = taxableAmount + this.tax.totalTax;
  
  next();
});

// Method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Find the last invoice for this month
  const lastInvoice = await this.findOne({
    invoiceNumber: new RegExp(`^${year}-${month}-`)
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = String(sequence).padStart(5, '0');
  return `${year}-${month}-${sequenceStr}`;
};

// Method to mark as paid
invoiceSchema.methods.markAsPaid = async function(paymentDetails) {
  this.paymentStatus = 'paid';
  this.paidAmount = this.total;
  this.paidDate = new Date();
  
  if (paymentDetails) {
    this.paymentMethod = paymentDetails.method;
    this.razorpayPaymentId = paymentDetails.razorpayPaymentId;
  }
  
  await this.save();
  return this;
};

// Method to mark PDF as generated
invoiceSchema.methods.markPDFGenerated = async function(pdfUrl) {
  this.pdfGenerated = true;
  this.pdfGeneratedAt = new Date();
  this.pdfUrl = pdfUrl;
  
  await this.save();
  return this;
};

// Method to mark email as sent
invoiceSchema.methods.markEmailSent = async function(emailAddress) {
  this.emailSent = true;
  this.emailSentAt = new Date();
  this.emailSentTo = emailAddress;
  
  await this.save();
  return this;
};

// Method to process refund
invoiceSchema.methods.processRefund = async function() {
  this.paymentStatus = 'refunded';
  await this.save();
  return this;
};

// Static method to find invoices by user
invoiceSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.status) {
    query.where('paymentStatus').equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query.sort({ invoiceDate: -1 });
};

// Static method to get invoice stats
invoiceSchema.statics.getInvoiceStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.invoiceDate = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        averageAmount: { $avg: '$total' }
      }
    }
  ]);
  
  return stats;
};

// Static method to get revenue by month
invoiceSchema.statics.getRevenueByMonth = async function(year) {
  const stats = await this.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        invoiceDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$invoiceDate' },
        revenue: { $sum: '$total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return stats;
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
