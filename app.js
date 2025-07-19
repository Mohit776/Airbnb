// =======================
// Import Required Modules
// =======================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
require('dotenv').config();


// =======================
// Load Environment Variables
// =======================
dotenv.config();

// =======================
// Import Routes
// =======================
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// =======================
// Initialize Express App
// =======================
const app = express();

// =======================
// Set Up View Engine
// =======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// =======================
// Middleware
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// =======================
// Cookies and Passport setup
// =======================
const sessionOptions = {
  secret: "mykey",
  resave: false,
  saveUninitialized: true,
  cookies: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash setup
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});

// =======================
// Routes
// =======================
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Home Route - Basic Test Endpoint
app.get("/", (req, res) => {
  res.render("listings/home.ejs", { title: "Airbnb Clone" });
});

// For Testing
app.get("/demo", async (req, res) => {
  let fake = new User({
    email: "mohit123@gmail.com",
    username: "Mohit4",
    
  });
  let re =  User.register(fake,"hello");
  res.send(re);
});

// =======================
// MongoDB Connection
// =======================
const MONGO_URL = process.env.MONGO_URL ;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("🟢 MongoDB connected!🟢");

    // Start the server only after the database connection is successful
    app.listen(8000, () => {
      console.log("===============================");
      console.log("❤️  Server is running on port 8000 ❤️  ");
      console.log("===============================");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Exit the process
  });

// =======================
// Error Handling Middleware
// =======================
// app.use((err, req, res, next) => {
//   const { statusCode = 500, message = "Something went wrong" } = err;
//   res.status(statusCode).render("listings/error.ejs", { statusCode, message });
// });
