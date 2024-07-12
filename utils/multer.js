const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
  destination: (req, file, cb) => {
    if (file.fieldname === "user-photo") {
      cb(null, path.join(__dirname, "../public/UsersPhoto"));
    }
    if (file.fieldname === "support-photo") {
      cb(null, path.join(__dirname, "../public/SupportPhoto"));
    }
  },
});

const userMulter = multer({ storage }).single("user-photo");
const supportMulter = multer({ storage }).single("support-photo");

// export
module.exports = { userMulter, supportMulter };
