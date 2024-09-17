const express = require("express");
const router = express.Router();
const { checkPasscode, isAuthenticatedForHisaab, clearAuthenticatedHisaabs } = require("../middlewares/hisaab-auth");
const { isLoggedIn } = require("../middlewares/login-middleware");
const hisaabModel = require("../models/hisaab-model");
const userModel = require("../models/users-model");
const moment = require("moment");

router.get("/", (req, res) => {
  res.send("this is a hisaab route");
});

router.get("/create", isLoggedIn, (req, res) => {
  res.render("create");
});

router.post("/createhisaab", isLoggedIn, async (req, res) => {
  try {
    let { title, description, encryption, passcode, shareable, available, editPermission } = req.body;

    encryption = (encryption === 'on');
    shareable = (shareable === 'on');
    editPermission = (editPermission === 'on');

    if (encryption && !passcode) {
      req.flash("error_msg", "When encryption is enabled, passcode is required.");
      return res.redirect("/hisaab/create");
    }

    if (!title) {
      req.flash("error_msg", "Title is required.");
      return res.redirect("/hisaab/create");
    }
    if (!description) {
      req.flash("error_msg", "Description is required.");
      return res.redirect("/hisaab/create");
    }

    const newHisaab = await hisaabModel.create({
      title,
      description,
      encryption,
      passcode,
      shareable,
      available,
      editpermissions: editPermission,
      user: req.user._id
    });

    await userModel.findByIdAndUpdate(req.user._id, { $push: { hisaab: newHisaab._id } });

    req.flash("success_msg", "Hisaab created successfully.");
    res.redirect("/profile");
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect("/hisaab/create");
  }
});

router.get("/:id", isLoggedIn, isAuthenticatedForHisaab, clearAuthenticatedHisaabs, async (req, res) => {
  try {
    const hisaab = await hisaabModel.findOne({ _id: req.params.id, user: req.user._id });
    const user = await userModel.findOne({ email: req.user.email });
    res.render("view", { user, hisaab, moment });
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect("/profile");
  }
});

router.get("/view/:id", isLoggedIn, async (req, res) => {
  try {
    const hisaab = await hisaabModel.findOne({ _id: req.params.id, user: req.user._id });
    const user = await userModel.findOne({ email: req.user.email });
    if(hisaab.encryption) {
      req.flash("error_msg","This is encrypted Hisaab")
      return res.redirect("/hisaab/:id")
    }
    res.render("view", { user, hisaab, moment });
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect("/profile");
  }
});

router.post("/passcode/:id", isLoggedIn, checkPasscode, (req, res) => {
  const hisaabId = req.params.id;
  res.redirect(`/hisaab/${hisaabId}`);
});

router.post("/update/:id", isLoggedIn, async (req, res) => {
  try {
    const { title, description, encryption, passcode, shareable, available, editPermission } = req.body;

    const updateData = {
      title,
      description,
      encryption: encryption === 'on',
      passcode,
      shareable: shareable === 'on',
      available,
      editpermissions: editPermission === 'on'
    };

    const hisaab = await hisaabModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!hisaab) {
      req.flash("error_msg", "Hisaab not found.");
      return res.redirect("/profile");
    }

    req.flash("success_msg", "Hisaab updated successfully.");
    res.redirect("/profile");
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect(`/hisaab/view/${req.params.id}`);
  }
});
router.get("/delete/:id",(req,res)=>{
  res.redirect("/profile")
})
router.post("/delete/:id",isLoggedIn, async (req, res) => {
  try {
   hisaabModel.findOneAndDelete({ _id: req.params.id });
    req.flash("success_msg", "Hisaab deleted successfully.");
    res.redirect("/profile");
  } catch (err) {
    req.flash("error_msg", err.message);
    res.redirect("/profile");
  }
});

// router.post('/verify-passcode', async (req, res) => {
//   const { hisaabId, currentPasscode } = req.body;

//   try {
//     const hisaab = await hisaabModel.findOne({ _id: hisaabId });

//     if (hisaab && hisaab.passcode === currentPasscode) {
//       return res.status(200).json({ message: 'Passcode verified' });
//     } else {
//       return res.status(401).json({ message: 'Incorrect passcode' });
//     }
//   } catch (error) {
//     console.error('Error verifying passcode:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// });

module.exports = router;

