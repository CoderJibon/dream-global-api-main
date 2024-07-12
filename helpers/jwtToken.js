const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/secret.js");

//Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
};

//verify the token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// export
module.exports = {
  generateToken,
  verifyToken,
};
