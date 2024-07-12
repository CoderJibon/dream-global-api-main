const dotenv = require("dotenv");

// dotenv config
dotenv.config();

// make secret key available

/**
 * server port
 */
const PORT = process.env.PORT || 6060;

/**
 * mongoDb URL
 */

const MONGODB_URL = process.env.MONGODB_URL;

/**
 * access token
 */

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;

/**
 * jwt secret key
 */

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * App Environment
 */

const APP_ENV = process.env.APP_ENV;

/**
 * Admin Path
 */

const ADMIN_PATH = process.env.ADMIN_PATH;

/**
 * node mail send info
 */

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// export
module.exports = {
  PORT,
  MONGODB_URL,
  ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRES,
  JWT_SECRET,
  APP_ENV,
  EMAIL_USER,
  EMAIL_PASS,
  ADMIN_PATH
};
