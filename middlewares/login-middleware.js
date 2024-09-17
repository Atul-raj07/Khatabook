const jwt = require("jsonwebtoken");
const userModel = require("../models/users-model");
const JWT_SECRET = process.env.JWT_SECRET;

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash("error_msg", "You must be logged in to access this page.");
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      req.flash("error_msg", "Invalid token. Please log in again.");
      return res.redirect("/");
    }

    req.user = user;
    next();
  } catch (err) {
    req.flash("error_msg", "Invalid token. Please log in again.");
    res.redirect("/");
    next()
  }
};

module.exports = { isLoggedIn };
