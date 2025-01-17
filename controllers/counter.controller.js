const User = require("../models/user.model");

exports.updateCounter = async (req, res) => {
  if (!req.user) {
    res.json({
      message: "USER_NOT_IN_REQ",
    });
  }
  try {
    let user = await User.findOne({
      _id: req.user._id,
    });
    const data = req.body;
    user.counter = data.counter;
    user = await user.save();
    res.json({
      message: "COUNTER_UPDATED_SUCCESS",
      user,
    });
  } catch (error) {
    res.sendStatus(500).json({
      message: "COUNTER_UPDATED_FAILED",
      error,
    });
  }
};
