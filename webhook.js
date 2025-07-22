const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Webhook utility that creates a JWT token and sends data to a specified URL
 * @param {string} url - The webhook URL to send data to
 * @param {object} data - The data to send in the request body
 * @param {object} options - Optional configuration
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {object} options.headers - Additional headers to include
 * @param {number} options.timeout - Request timeout in milliseconds (default: 5000)
 * @param {string} options.jwtExpiration - JWT expiration time (default: '1h')
 * @returns {Promise<object>} - The webhook response
 */
async function sendWebhook(url, data, options = {}) {
  try {
    // Validate inputs
    if (!url) {
      throw new Error('URL is required');
    }

    if (!data) {
      throw new Error('Data is required');
    }

    // Get token from environment variables
    const secret = 'test'; // process.env.TOKEN; // XXX: Uncomment this line to use the TOKEN environment variable
    if (!secret) {
      throw new Error('TOKEN environment variable is not set');
    }

    // Set default options
    const { method = 'GET', headers = {}, timeout = 50000, jwtExpiration = '1h' } = options;

    // Create JWT token with the data as payload
    const token = jwt.sign(
      {
        data: data,
        timestamp: Date.now(),
        url: url,
      },
      secret,
      {
        expiresIn: jwtExpiration,
        issuer: 'ClumsyBot',
        audience: url,
      }
    );

    // Prepare request options
    const requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'ClumsyBot-Webhook/1.0',
        ...headers,
      },
      body: JSON.stringify(data),
      timeout: timeout,
    };

    // Send the webhook request
    const response = await fetch(url, requestOptions);

    // Parse response
    let responseData;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      data: responseData,
      url: url,
      timestamp: new Date().toISOString(),
    };

    if (!response.ok) {
      console.warn(`[Webhook] Request failed (${response.status}): ${response.statusText}`);
    }

    return result;
  } catch (error) {
    console.error(`[Webhook] Error sending webhook:`, error.message);

    return {
      success: false,
      error: error.message,
      url: url,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Verify a JWT token using the same secret
 * @param {string} token - The JWT token to verify
 * @returns {object} - Decoded token payload or error
 */
function verifyWebhookToken(token) {
  try {
    const secret = process.env.TOKEN;
    if (!secret) {
      throw new Error('TOKEN environment variable is not set');
    }

    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      payload: decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a simple webhook server endpoint handler
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
function webhookHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const verification = verifyWebhookToken(token);

    if (!verification.success) {
      return res.status(401).json({ error: 'Invalid token', details: verification.error });
    }

    // Token is valid, process the webhook
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
      payload: verification.payload,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

module.exports = {
  sendWebhook,
  verifyWebhookToken,
  webhookHandler,
};
