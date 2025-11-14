const razorpayService = require('../razorpayService');
const { Payment } = require('../../models');
const { getPlanAmount } = require('../../config/razorpay');

// Mock the models and config
jest.mock('../../models');
jest.mock('../../config/razorpay');

describe('RazorpayService - Order Creation', () => {
    let mockRazorpayInstance;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock Razorpay instance
        mockRazorpayInstance = {
            orders: {
                create: jest.fn()
            }
        };

        // Mock the razorpay instance
        razorpayService.razorpay = mockRazorpayInstance;
    });

    describe('createOrder', () => {
        it('should create order with correct plan details and monthly billing', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'pro',
                billingCycle: 'monthly',
                subscriptionId: '507f1f77bcf86cd799439012',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0'
            };

            getPlanAmount.mockReturnValue(49900); // ₹499 in paise

            mockRazorpayInstance.orders.create.mockResolvedValue({
                id: 'order_test123',
                amount: 49900,
                currency: 'INR'
            });

            Payment.create.mockResolvedValue({
                _id: 'payment_test123',
                userId: orderData.userId,
                razorpayOrderId: 'order_test123',
                amount: 49900,
                status: 'created'
            });

            // Act
            const result = await razorpayService.createOrder(orderData);

            // Assert
            expect(result).toHaveProperty('orderId', 'order_test123');
            expect(result).toHaveProperty('amount', 49900);
            expect(result).toHaveProperty('currency', 'INR');
            expect(result.planDetails.plan).toBe('pro');
            expect(result.planDetails.billingCycle).toBe('monthly');
            expect(result.planDetails.discountAmount).toBe(0);
        });

        it('should apply 20% discount for annual billing', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'pro',
                billingCycle: 'annual',
                subscriptionId: '507f1f77bcf86cd799439012'
            };

            // Mock monthly amount: ₹499
            // Mock annual amount: ₹4,999 (20% discount from ₹5,988)
            getPlanAmount.mockImplementation((plan, cycle) => {
                if (cycle === 'monthly') return 49900;
                if (cycle === 'annual') return 499900;
            });

            mockRazorpayInstance.orders.create.mockResolvedValue({
                id: 'order_annual123',
                amount: 499900,
                currency: 'INR'
            });

            Payment.create.mockResolvedValue({
                _id: 'payment_annual123',
                userId: orderData.userId,
                razorpayOrderId: 'order_annual123',
                amount: 499900,
                status: 'created'
            });

            // Act
            const result = await razorpayService.createOrder(orderData);

            // Assert
            expect(result.planDetails.billingCycle).toBe('annual');
            expect(result.planDetails.discountPercentage).toBe(20);
            expect(result.planDetails.discountAmount).toBe(98900); // ₹989 discount
            expect(result.planDetails.finalAmount).toBe(499900);
        });

        it('should generate unique order ID with proper formatting', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'enterprise',
                billingCycle: 'monthly',
                subscriptionId: '507f1f77bcf86cd799439012'
            };

            getPlanAmount.mockReturnValue(199900);

            mockRazorpayInstance.orders.create.mockResolvedValue({
                id: 'order_test456',
                amount: 199900,
                currency: 'INR'
            });

            Payment.create.mockResolvedValue({
                _id: 'payment_test456',
                userId: orderData.userId,
                razorpayOrderId: 'order_test456'
            });

            // Act
            const result = await razorpayService.createOrder(orderData);

            // Assert
            expect(result.receipt).toMatch(/^ORD-ENTERPRISE-MONTHLY-\d+-[A-Z0-9]{6}$/);
            expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    receipt: expect.stringMatching(/^ORD-ENTERPRISE-MONTHLY-/)
                })
            );
        });

        it('should store order details in database before payment', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'pro',
                billingCycle: 'monthly',
                subscriptionId: '507f1f77bcf86cd799439012',
                ipAddress: '192.168.1.1',
                userAgent: 'Test Agent'
            };

            getPlanAmount.mockReturnValue(49900);

            mockRazorpayInstance.orders.create.mockResolvedValue({
                id: 'order_test789',
                amount: 49900,
                currency: 'INR'
            });

            Payment.create.mockResolvedValue({
                _id: 'payment_test789',
                userId: orderData.userId,
                razorpayOrderId: 'order_test789',
                amount: 49900,
                status: 'created'
            });

            // Act
            await razorpayService.createOrder(orderData);

            // Assert
            expect(Payment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: orderData.userId,
                    subscriptionId: orderData.subscriptionId,
                    razorpayOrderId: 'order_test789',
                    amount: 49900,
                    currency: 'INR',
                    status: 'created',
                    plan: 'pro',
                    billingCycle: 'monthly',
                    metadata: expect.objectContaining({
                        ipAddress: '192.168.1.1',
                        userAgent: 'Test Agent'
                    })
                })
            );
        });

        it('should throw error for free plan', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'free',
                billingCycle: 'monthly'
            };

            // Act & Assert
            await expect(razorpayService.createOrder(orderData))
                .rejects
                .toThrow('Cannot create order for free plan');
        });

        it('should throw error for invalid billing cycle', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'pro',
                billingCycle: 'weekly'
            };

            // Act & Assert
            await expect(razorpayService.createOrder(orderData))
                .rejects
                .toThrow('Invalid billing cycle');
        });

        it('should handle discount codes', async () => {
            // Arrange
            const orderData = {
                userId: '507f1f77bcf86cd799439011',
                plan: 'pro',
                billingCycle: 'monthly',
                subscriptionId: '507f1f77bcf86cd799439012',
                discountCode: 'LAUNCH50'
            };

            getPlanAmount.mockReturnValue(49900);

            mockRazorpayInstance.orders.create.mockResolvedValue({
                id: 'order_discount123',
                amount: 24950, // 50% off
                currency: 'INR'
            });

            Payment.create.mockResolvedValue({
                _id: 'payment_discount123',
                userId: orderData.userId,
                razorpayOrderId: 'order_discount123',
                amount: 24950,
                status: 'created'
            });

            // Act
            const result = await razorpayService.createOrder(orderData);

            // Assert
            expect(result.planDetails.discountAmount).toBeGreaterThan(0);
            expect(mockRazorpayInstance.orders.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    notes: expect.objectContaining({
                        discountCode: 'LAUNCH50'
                    })
                })
            );
        });
    });
});

describe('RazorpayService - Payment Verification', () => {
    let mockRazorpayInstance;
    let mockPayment;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Razorpay instance
        mockRazorpayInstance = {
            payments: {
                fetch: jest.fn()
            }
        };

        razorpayService.razorpay = mockRazorpayInstance;

        // Mock payment object
        mockPayment = {
            _id: 'payment_test123',
            userId: '507f1f77bcf86cd799439011',
            razorpayOrderId: 'order_test123',
            amount: 49900,
            status: 'created',
            markAsCaptured: jest.fn().mockResolvedValue(true),
            markAsFailed: jest.fn().mockResolvedValue(true),
            save: jest.fn().mockResolvedValue(true)
        };
    });

    describe('verifyPayment', () => {
        it('should successfully verify payment with valid signature', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            Payment.findOne.mockResolvedValue(mockPayment);

            mockRazorpayInstance.payments.fetch.mockResolvedValue({
                id: 'pay_test123',
                order_id: 'order_test123',
                amount: 49900,
                status: 'captured',
                method: 'upi'
            });

            // Mock signature verification to return true
            const { verifyPaymentSignature } = require('../../config/razorpay');
            jest.spyOn(require('../../config/razorpay'), 'verifyPaymentSignature').mockReturnValue(true);

            // Act
            const result = await razorpayService.verifyPayment(paymentData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.isDuplicate).toBe(false);
            expect(mockPayment.markAsCaptured).toHaveBeenCalledWith('pay_test123', 'valid_signature');
            expect(mockPayment.save).toHaveBeenCalled();
        });

        it('should throw error for invalid signature', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'invalid_signature'
            };

            Payment.findOne.mockResolvedValue(mockPayment);

            // Mock signature verification to return false
            jest.spyOn(require('../../config/razorpay'), 'verifyPaymentSignature').mockReturnValue(false);

            // Act & Assert
            await expect(razorpayService.verifyPayment(paymentData))
                .rejects
                .toThrow('Payment signature verification failed');

            expect(mockPayment.markAsFailed).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'SIGNATURE_VERIFICATION_FAILED',
                    reason: 'Invalid signature'
                })
            );
        });

        it('should prevent duplicate processing (idempotency)', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            // Mock payment that's already captured
            const capturedPayment = {
                ...mockPayment,
                status: 'captured',
                razorpayPaymentId: 'pay_test123'
            };

            Payment.findOne.mockResolvedValue(capturedPayment);

            // Act
            const result = await razorpayService.verifyPayment(paymentData);

            // Assert
            expect(result.success).toBe(true);
            expect(result.isDuplicate).toBe(true);
            expect(result.message).toBe('Payment already processed');
            expect(mockRazorpayInstance.payments.fetch).not.toHaveBeenCalled();
        });

        it('should throw error for amount mismatch', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            Payment.findOne.mockResolvedValue(mockPayment);

            mockRazorpayInstance.payments.fetch.mockResolvedValue({
                id: 'pay_test123',
                order_id: 'order_test123',
                amount: 99900, // Different amount
                status: 'captured',
                method: 'card'
            });

            jest.spyOn(require('../../config/razorpay'), 'verifyPaymentSignature').mockReturnValue(true);

            // Act & Assert
            await expect(razorpayService.verifyPayment(paymentData))
                .rejects
                .toThrow('Payment amount does not match expected amount');

            expect(mockPayment.markAsFailed).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'AMOUNT_MISMATCH',
                    reason: 'Amount validation failed'
                })
            );
        });

        it('should throw error for order ID mismatch', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            Payment.findOne.mockResolvedValue(mockPayment);

            mockRazorpayInstance.payments.fetch.mockResolvedValue({
                id: 'pay_test123',
                order_id: 'order_different456', // Different order ID
                amount: 49900,
                status: 'captured',
                method: 'card'
            });

            jest.spyOn(require('../../config/razorpay'), 'verifyPaymentSignature').mockReturnValue(true);

            // Act & Assert
            await expect(razorpayService.verifyPayment(paymentData))
                .rejects
                .toThrow('Payment order ID does not match');

            expect(mockPayment.markAsFailed).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: 'ORDER_ID_MISMATCH',
                    reason: 'Order ID validation failed'
                })
            );
        });

        it('should throw error for missing parameters', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                // Missing razorpayPaymentId and razorpaySignature
            };

            // Act & Assert
            await expect(razorpayService.verifyPayment(paymentData))
                .rejects
                .toThrow('Missing required payment verification parameters');
        });

        it('should throw error when payment record not found', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_nonexistent',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            Payment.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(razorpayService.verifyPayment(paymentData))
                .rejects
                .toThrow('Payment record not found for the given order ID');
        });

        it('should throw error for invalid payment status from Razorpay', async () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            Payment.findOne.mockResolvedValue(mockPayment);

            mockRazorpayInstance.payments.fetch.mockResolvedValue({
                id: 'pay_test123',
                order_id: 'order_test123',
                amount: 49900,
                status: 'failed', // Invalid status
                method: 'card'
            });

            jest.spyOn(require('../../config/razorpay'), 'verifyPaymentSignature').mockReturnValue(true);

            // Act & Assert
            await expect(razorpayService.verifyPayment(paymentData))
                .rejects
                .toThrow('Payment status is failed, expected captured or authorized');
        });
    });

    describe('validatePaymentData', () => {
        it('should validate correct payment data', () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            // Act
            const result = razorpayService.validatePaymentData(paymentData);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect missing order ID', () => {
            // Arrange
            const paymentData = {
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            // Act
            const result = razorpayService.validatePaymentData(paymentData);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Order ID is required');
        });

        it('should detect invalid order ID format', () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'invalid_format',
                razorpayPaymentId: 'pay_test123',
                razorpaySignature: 'valid_signature'
            };

            // Act
            const result = razorpayService.validatePaymentData(paymentData);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid order ID format');
        });

        it('should detect invalid payment ID format', () => {
            // Arrange
            const paymentData = {
                razorpayOrderId: 'order_test123',
                razorpayPaymentId: 'invalid_format',
                razorpaySignature: 'valid_signature'
            };

            // Act
            const result = razorpayService.validatePaymentData(paymentData);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid payment ID format');
        });
    });

    describe('checkPaymentIdempotency', () => {
        it('should return false when payment does not exist', async () => {
            // Arrange
            Payment.findOne.mockResolvedValue(null);

            // Act
            const result = await razorpayService.checkPaymentIdempotency('order_test123');

            // Assert
            expect(result.exists).toBe(false);
            expect(result.isProcessed).toBe(false);
            expect(result.payment).toBeNull();
        });

        it('should detect already processed payment', async () => {
            // Arrange
            const processedPayment = {
                ...mockPayment,
                status: 'captured'
            };

            Payment.findOne.mockResolvedValue(processedPayment);

            // Act
            const result = await razorpayService.checkPaymentIdempotency('order_test123');

            // Assert
            expect(result.exists).toBe(true);
            expect(result.isProcessed).toBe(true);
            expect(result.status).toBe('captured');
        });

        it('should detect unprocessed payment', async () => {
            // Arrange
            Payment.findOne.mockResolvedValue(mockPayment);

            // Act
            const result = await razorpayService.checkPaymentIdempotency('order_test123');

            // Assert
            expect(result.exists).toBe(true);
            expect(result.isProcessed).toBe(false);
            expect(result.status).toBe('created');
        });
    });

    describe('verifyPaymentAmount', () => {
        it('should return true for matching amounts', () => {
            // Act
            const result = razorpayService.verifyPaymentAmount(49900, 49900);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for mismatched amounts', () => {
            // Act
            const result = razorpayService.verifyPaymentAmount(49900, 99900);

            // Assert
            expect(result).toBe(false);
        });
    });
});
