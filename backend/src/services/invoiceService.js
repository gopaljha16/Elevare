const { Invoice, Payment } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Invoice Generation Service
 */

class InvoiceService {
  /**
   * Generate invoice for payment
   */
  async generateInvoice(paymentId) {
    try {
      const payment = await Payment.findById(paymentId).populate('userId');
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check if invoice already exists
      let invoice = await Invoice.findOne({ paymentId });
      
      if (invoice) {
        return invoice;
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Calculate GST (18%)
      const baseAmount = Math.round(payment.amount / 1.18);
      const gstAmount = payment.amount - baseAmount;

      // Create invoice
      invoice = await Invoice.create({
        invoiceNumber,
        userId: payment.userId._id,
        paymentId: payment._id,
        subscriptionId: payment.subscriptionId,
        amount: payment.amount,
        baseAmount,
        gstAmount,
        gstPercentage: 18,
        currency: payment.currency,
        plan: payment.plan,
        billingCycle: payment.billingCycle,
        status: 'paid',
        issueDate: new Date(),
        dueDate: new Date(),
        paidDate: payment.capturedAt,
        customerDetails: {
          name: payment.userId.name || payment.userId.email,
          email: payment.userId.email,
          phone: payment.userId.phone || ''
        }
      });

      // Update payment with invoice ID
      payment.invoiceId = invoice._id;
      payment.invoiceNumber = invoiceNumber;
      await payment.save();

      return invoice;
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  }

  /**
   * Generate sequential invoice number
   */
  async generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Find last invoice of current month
    const prefix = `INV-${year}-${month}`;
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: new RegExp(`^${prefix}`)
    }).sort({ createdAt: -1 });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop());
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(5, '0')}`;
  }

  /**
   * Generate PDF invoice
   */
  async generatePDF(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId).populate('userId');
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create PDF directory if it doesn't exist
      const pdfDir = path.join(__dirname, '../../invoices');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfPath = path.join(pdfDir, `${invoice.invoiceNumber}.pdf`);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // Add content
      this.addInvoiceHeader(doc, invoice);
      this.addInvoiceDetails(doc, invoice);
      this.addInvoiceItems(doc, invoice);
      this.addInvoiceFooter(doc, invoice);

      doc.end();

      // Wait for PDF to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Update invoice with PDF path
      invoice.pdfPath = pdfPath;
      await invoice.save();

      return pdfPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Add invoice header
   */
  addInvoiceHeader(doc, invoice) {
    doc
      .fontSize(20)
      .text('INVOICE', 50, 50)
      .fontSize(10)
      .text(`Invoice #: ${invoice.invoiceNumber}`, 50, 80)
      .text(`Date: ${invoice.issueDate.toLocaleDateString()}`, 50, 95)
      .text(`Status: ${invoice.status.toUpperCase()}`, 50, 110);

    // Company details (right side)
    doc
      .fontSize(12)
      .text('JobSphere', 400, 50)
      .fontSize(10)
      .text('Your Company Address', 400, 70)
      .text('City, State, PIN', 400, 85)
      .text('GSTIN: YOUR_GSTIN', 400, 100);
  }

  /**
   * Add invoice details
   */
  addInvoiceDetails(doc, invoice) {
    doc
      .fontSize(12)
      .text('Bill To:', 50, 150)
      .fontSize(10)
      .text(invoice.customerDetails.name, 50, 170)
      .text(invoice.customerDetails.email, 50, 185)
      .text(invoice.customerDetails.phone || 'N/A', 50, 200);
  }

  /**
   * Add invoice items
   */
  addInvoiceItems(doc, invoice) {
    const tableTop = 250;

    doc
      .fontSize(10)
      .text('Description', 50, tableTop)
      .text('Amount', 400, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    const itemY = tableTop + 30;
    const planName = `${invoice.plan.toUpperCase()} Plan - ${invoice.billingCycle}`;
    
    doc
      .text(planName, 50, itemY)
      .text(`₹${(invoice.baseAmount / 100).toFixed(2)}`, 400, itemY);

    doc
      .text('GST (18%)', 50, itemY + 20)
      .text(`₹${(invoice.gstAmount / 100).toFixed(2)}`, 400, itemY + 20);

    doc
      .moveTo(50, itemY + 45)
      .lineTo(550, itemY + 45)
      .stroke();

    doc
      .fontSize(12)
      .text('Total', 50, itemY + 60)
      .text(`₹${(invoice.amount / 100).toFixed(2)}`, 400, itemY + 60);
  }

  /**
   * Add invoice footer
   */
  addInvoiceFooter(doc, invoice) {
    doc
      .fontSize(10)
      .text('Thank you for your business!', 50, 700, { align: 'center' })
      .text('For support, contact: support@jobsphere.com', 50, 720, { align: 'center' });
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      return invoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Get user invoices
   */
  async getUserInvoices(userId, options = {}) {
    try {
      const invoices = await Invoice.find({ userId })
        .sort({ createdAt: -1 })
        .limit(options.limit || 10)
        .skip(options.skip || 0);

      return invoices;
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      throw error;
    }
  }
}

module.exports = new InvoiceService();
