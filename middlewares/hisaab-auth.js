const jwt = require("jsonwebtoken");
const userModel = require("../models/users-model");
const hisaabModel = require("../models/hisaab-model");
const JWT_SECRET = process.env.JWT_SECRET;

const checkPasscode = async (req, res, next) => {
  const { id } = req.params;
  const { passcode } = req.body;

  try {
    const hisaab = await hisaabModel.findOne({ _id: id });

    if (!hisaab) {
      req.flash("error_msg", "Hisaab not found");
      return res.redirect("/profile");
    }

    if (hisaab.encryption) {
      if (!passcode || passcode !== hisaab.passcode.toString()) {
        req.flash("error_msg", "Invalid passcode");
        return res.redirect("/profile");
      } else {
        if (!req.session.authenticatedHisaabs) {
          req.session.authenticatedHisaabs = [];
        }
        req.session.authenticatedHisaabs.push(id);
      }
    }

    req.hisaab = hisaab;
    next();
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect(`/hisaab/view/${id}`);
  }
};

const isAuthenticatedForHisaab = (req, res, next) => {
  const { id } = req.params;

  if (req.session.authenticatedHisaabs && req.session.authenticatedHisaabs.includes(id)) {
    next();
  } else {
    req.flash("error_msg", "You are not authenticated to view this Hisaab");
    res.redirect("/profile");
  }
};

const clearAuthenticatedHisaabs = (req, res, next) => {
  if (req.session.authenticatedHisaabs) {
    req.session.authenticatedHisaabs = [];
  }
  next();
};

module.exports = {
  checkPasscode,
  isAuthenticatedForHisaab,
  clearAuthenticatedHisaabs,
};
