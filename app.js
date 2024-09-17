const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")


dotenv.config();

const indexRouter = require("./routes/index");
const hisaabRouter = require("./routes/hisaab");
const flashMsg = require("./middlewares/flash-msg");

// Connect to the database
const db = require("./config/mongoose-connect");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session and Flash middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'lolo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // In production, use `secure: true` with HTTPS
}));
app.use(flash());
app.use(flashMsg);

// Routes
app.use("/", indexRouter);
app.use("/hisaab", hisaabRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {

});
