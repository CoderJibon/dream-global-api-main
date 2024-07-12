const mongoose = require("mongoose");
const { MONGODB_URL } = require("../utils/secret.js");

// DB connection

const mongoDbConnection = async () => {
  try {
    // mongodb connection established

    await mongoose.connect(MONGODB_URL);

    console.log("mongodb connection established..".bgGreen.black);
  } catch (error) {
    // mongodb connection error

    console.log(`${error.message}`.bgRed.black);
  }
};

// export
module.exports =  mongoDbConnection ;
