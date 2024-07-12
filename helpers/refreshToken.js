const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/secret.js");

//Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "3d" });
};

//Refresh verify the token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// export
module.exports = {
  generateRefreshToken,
  verifyRefreshToken,
};
