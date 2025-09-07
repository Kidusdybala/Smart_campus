const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {string} userId - The recipient user ID
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} data - Additional data for the notification
 * @param {string} priority - Priority level (low, medium, high, urgent)
 * @returns {Promise<Object>} - The created notification
 */
async function createNotification(userId, type, title, message, data = {}, priority = 'medium') {
  try {
    const notification = new Notification({
      recipient: userId,
      type,
      title,
      message,
      data,
      priority,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create a payment success notification
 * @param {string} userId - The recipient user ID
 * @param {number} amount - Payment amount
 * @param {string} paymentType - Type of payment (topup, food_order, etc.)
 * @param {string} paymentId - ID of the payment
 * @returns {Promise<Object>} - The created notification
 */
async function createPaymentSuccessNotification(userId, amount, paymentType, paymentId) {
  const title = 'Payment Successful';
  let message = '';
  
  switch (paymentType) {
    case 'topup':
      message = `Your wallet has been topped up with ${amount} ETB successfully.`;
      break;
    case 'food_order':
      message = `Your payment of ${amount} ETB for food order was successful.`;
      break;
    case 'parking':
      message = `Your payment of ${amount} ETB for parking reservation was successful.`;
      break;
    default:
      message = `Your payment of ${amount} ETB was successful.`;
  }
  
  return createNotification(
    userId,
    'payment_success',
    title,
    message,
    { amount, paymentType, paymentId },
    'medium'
  );
}

/**
 * Create a payment failed notification
 * @param {string} userId - The recipient user ID
 * @param {number} amount - Payment amount
 * @param {string} paymentType - Type of payment (topup, food_order, etc.)
 * @param {string} paymentId - ID of the payment
 * @param {string} reason - Reason for failure
 * @returns {Promise<Object>} - The created notification
 */
async function createPaymentFailedNotification(userId, amount, paymentType, paymentId, reason = 'Unknown error') {
  const title = 'Payment Failed';
  let message = '';
  
  switch (paymentType) {
    case 'topup':
      message = `Your wallet top-up of ${amount} ETB failed. Reason: ${reason}`;
      break;
    case 'food_order':
      message = `Your payment of ${amount} ETB for food order failed. Reason: ${reason}`;
      break;
    case 'parking':
      message = `Your payment of ${amount} ETB for parking reservation failed. Reason: ${reason}`;
      break;
    default:
      message = `Your payment of ${amount} ETB failed. Reason: ${reason}`;
  }
  
  return createNotification(
    userId,
    'payment_failed',
    title,
    message,
    { amount, paymentType, paymentId, reason },
    'high'
  );
}

/**
 * Create a low balance notification
 * @param {string} userId - The recipient user ID
 * @param {number} balance - Current balance
 * @returns {Promise<Object>} - The created notification
 */
async function createLowBalanceNotification(userId, balance) {
  return createNotification(
    userId,
    'low_balance',
    'Low Wallet Balance',
    `Your wallet balance is low (${balance} ETB). Consider topping up soon.`,
    { balance },
    'medium'
  );
}

/**
 * Create a payment pending notification
 * @param {string} userId - The recipient user ID
 * @param {number} amount - Payment amount
 * @param {string} paymentType - Type of payment (topup, food_order, etc.)
 * @param {string} paymentId - ID of the payment
 * @returns {Promise<Object>} - The created notification
 */
async function createPaymentPendingNotification(userId, amount, paymentType, paymentId) {
  const title = 'Payment Pending';
  let message = '';
  
  switch (paymentType) {
    case 'topup':
      message = `Your wallet top-up of ${amount} ETB is being processed.`;
      break;
    case 'food_order':
      message = `Your payment of ${amount} ETB for food order is being processed.`;
      break;
    case 'parking':
      message = `Your payment of ${amount} ETB for parking reservation is being processed.`;
      break;
    default:
      message = `Your payment of ${amount} ETB is being processed.`;
  }
  
  return createNotification(
    userId,
    'payment_pending',
    title,
    message,
    { amount, paymentType, paymentId },
    'low'
  );
}

module.exports = {
  createNotification,
  createPaymentSuccessNotification,
  createPaymentFailedNotification,
  createLowBalanceNotification,
  createPaymentPendingNotification
};