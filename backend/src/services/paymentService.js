// backend/src/services/paymentService.js
'use strict';

const Razorpay = require("razorpay");
const crypto = require("crypto");
const { secrets } = require("../core/secrets/secretManager");

/**
 * Lazily-initialised singleton.
 * Created on first call so it always reads live credentials from SecretManager,
 * even if the module was imported before .env was fully resolved.
 */
let _razorpay = null;

function getRazorpay() {
  if (!_razorpay) {
    const keyId     = secrets.get('RAZORPAY_KEY_ID');
    const keySecret = secrets.get('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env');
    }

    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    console.log(`💳 Razorpay initialised [${keyId.startsWith('rzp_live') ? 'LIVE' : 'TEST'}]`);
  }
  return _razorpay;
}

/**
 * Create a new Razorpay order
 */
async function createOrder(amount, currency = "INR", receipt, notes = {}) {
  try {
    const order = await getRazorpay().orders.create({
      amount,
      currency,
      receipt,
      notes,
    });
    return order;
  } catch (error) {
    // Razorpay errors have { statusCode, error: { description } } — not a plain Error
    const description = error?.error?.description || error?.message || 'Unknown Razorpay error';
    console.error("Razorpay Order Creation Error:", description, '| statusCode:', error?.statusCode);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 */
function verifySignature(orderId, paymentId, signature) {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secrets.get('RAZORPAY_KEY_SECRET'))
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

module.exports = {
  createOrder,
  verifySignature,
};
