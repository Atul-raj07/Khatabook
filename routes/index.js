const express = require("express");
const router = express.Router();
const userModel = require("../models/users-model");
const hisaabModel = require("../models/hisaab-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { isLoggedIn } = require("../middlewares/login-middleware");

if (!process.env.JWT_SECRET) { 
  // req.flash('error',"set env JWT_SECRET")
  throw new Error("Set env variable JWT_SECRET first");
}

router.get("/", (req, res) => {
  res.render("index", { loggin: false });
});

router.get("/register", (req, res) => {
  res.render("register", { loggin: false });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      req.flash('error_msg', 'Email & password are required');
      return res.redirect('/register');
    }

    let user = await userModel.findOne({ email });

    if (user) {
      req.flash('error_msg', 'User already exists. Please login');
      return res.redirect('/');
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        const createdUser = await userModel.create({
          username,
          email,
          password: hash,
        });

        const token = jwt.sign(
          { id: createdUser._id, email: createdUser.email },
          process.env.JWT_SECRET
        );

        res.cookie("token", token);
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect("/profile");
      });
    });
  } catch (err) {
    req.flash('error_msg', err.message);
    res.redirect('/register');
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error_msg', 'Email and password are required');
      return res.redirect('/');
    }

    let user = await userModel.findOne({ email: email }).select("+password");

    if (!user) {
      req.flash('error_msg', 'Please register first');
      return res.redirect('/');
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (!result) {
        req.flash('error_msg', 'Email or password did not match');
        return res.redirect('/');
      }

      let token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET);
      res.cookie("token", token);
      req.flash('success_msg', 'You are now logged in');
      res.redirect("/profile");
    });
  } catch (err) {
    req.flash('error_msg', err.message);
    res.redirect('/');
  }
});

router.get("/logout", (req, res) => {
  res.cookie('token', "");
  req.flash('success_msg', 'You are now logged out');
  res.redirect("/");
});

router.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  const { sort, dateFrom, dateTo } = req.query;
  const sorted = (sort === "1" || sort === "-1") ? parseInt(sort, 10) : -1;

  let filterQuery = { user: req.user._id };

  if (dateFrom || dateTo) {
    filterQuery.createdAt = {};
    if (dateFrom) {
      filterQuery.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      filterQuery.createdAt.$lte = new Date(dateTo);
    }
  }

  const hisaabs = await hisaabModel
    .find(filterQuery)
    .sort({ createdAt: sorted });

  res.render("profile", { user, hisaabs, moment });
});

module.exports = router;
