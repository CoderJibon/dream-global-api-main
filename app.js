const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("./middlewares/errorHandlers.js");
const notFound = require("./middlewares/notFound.js");
const authRoute = require("./routes/authRoute.js");
const userRoute = require("./routes/userRoute.js");
const depositRoute = require("./routes/depositRoute.js");
const cashOutRoute = require("./routes/cashOutRoute.js");
const planRoute = require("./routes/planRoute.js");
const supportRoute = require("./routes/supportRoute.js");
const workRoute = require("./routes/workRoute.js");
const commissionRoute = require("./routes/commissionRoute.js");

// initialize express
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

//static Folder
// app.use(express.static(path.join(path.resolve() + "/public")));
app.use(express.static(path.join(__dirname, "public")));

// all router routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/deposit", depositRoute);
app.use("/api/v1/cashOut", cashOutRoute);
app.use("/api/v1/plan", planRoute);
app.use("/api/v1/support", supportRoute);
app.use("/api/v1/work", workRoute);
app.use("/api/v1/commission", commissionRoute);

// error handlers

app.use(errorHandler);

// 404 not found

app.use(notFound);

// export app
module.exports = app;
