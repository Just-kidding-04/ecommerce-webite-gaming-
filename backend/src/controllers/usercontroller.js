const { User } = require("../models");
const bcrypt = require("bcrypt");
const { sendMail } = require('../utils/email');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
    }

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await User.destroy({
      where: { id: req.user.id },
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// Example: If you have any email sending logic in usercontroller.js, update it like this:
// let senderEmail = req.body.mail || undefined;
// let smtpUser = req.body.smtpUser || undefined;
// let smtpPass = req.body.smtpPass || undefined;
// sendMail({ to, subject, html, from: senderEmail, smtpUser, smtpPass });
