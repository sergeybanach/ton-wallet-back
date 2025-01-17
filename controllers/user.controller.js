const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { validate, parse } = require("@telegram-apps/init-data-node");
const envs = require("../config/env");
const {
  generatePassword,
  getSalt,
  getHash,
  validatePasswordHash,
} = require("../utils/randomString");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = envs.JWT_SECRET;
const JWT_EXPIRES = envs.JWT_EXPIRES;

exports.validateTelegramUser = async (req, res) => {
  try {
    const BOT_TOKEN = envs.BOT_TOKEN;
    validate(req.body.initDataRaw, BOT_TOKEN); // Throw error if validation failed
    const initData = parse(req.body.initDataRaw);

    let user = await User.findOne({ telegramId: initData.user?.id });
    if (!user) {
      user = new User({
        telegramId: initData.user?.id,
        username: initData.user?.username,
        firstName: initData.user?.firstName,
        lastName: initData.user?.lastName,
      });
      await user.save();
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.json({
      status: "SUCCESS",
      message: "VAL_SUCCESS",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "Telegram validation failed",
      data: { error },
    });
  }
};;

exports.register = async (req, res) => {
  try {
    let password = req.body.password;

    if (!password) {
      // return res.status(401).json({
      //   status: "FAILED",
      //   message: "No password",
      // });
      password = generatePassword();
    }

    const email = req.body.email;

    if (!email) {
      return res.status(401).json({
        status: "FAILED",
        message: "No email",
      });
    }

    let user = await User.findOne({
      email: email,
    });
    if (user) {
      return res.status(401).json({
        status: "FAILED",
        message: "User with this email already registered",
      });
    }
    user = new User();

    user.email = email;
    user.salt = getSalt();
    user.hash = getHash(password, user.salt).toString("base64");

    const transporter = nodemailer.createTransport({
      host: envs.EMAIL_HOST,
      port: envs.EMAIL_PORT,
      secure: envs.EMAIL_IS_SECURE,
      auth: {
        user: envs.EMAIL_USER,
        pass: envs.EMAIL_PASS,
      },
    });

    const emailInfo = await transporter.sendMail({
      from: "noreply@ton-wallet.com",
      to: email,
      subject: "You have successfully registered at ton-wallet.com",
      text: "Welcome to ton-wallet.com!",
      html: `<h1>Welcome to ton-wallet.com!</h1><br><div>Your id: <b>${user._id}</b></div>
      <div>Your password: <b>${password}</b></div>`,
    });

    await user.save();
    return res.json({
      status: "SUCCESS",
      message: "REGISTER_SUCCESS",
      data: {
        user: {
          _id: user._id,
          // password: password,
        },
        // emailInfo,
        // userDB: user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "REGISTER_FAILED",
      data: {
        error,
      },
    });
  }
};

exports.registerFast = async (req, res) => {
  try {
    const user = new User();
    const password = generatePassword();
    user.salt = getSalt();
    user.hash = getHash(password, user.salt).toString("base64");

    await user.save();
    return res.json({
      status: "SUCCESS",
      message: "REGISTER_SUCCESS",
      data: {
        user: {
          _id: user._id,
          password: password,
        },
        // userDB: user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "REGISTER_FAILED",
      data: {
        error,
      },
    });
  }
};

exports.login = async (req, res) => {
  try {
    const userId = req.body._id;
    const password = req.body.password;

    const user = await User.findOne({
      _id: userId,
    });

    if (!user) {
      return res.status(401).json({
        message: "USER_NOT_FOUND",
      });
    }

    if (
      !validatePasswordHash(
        password,
        user.salt,
        Buffer.from(user.hash, "base64")
      )
    ) {
      return res.status(401).json({
        status: "FAILED",
        message: "Wrong credentials",
      });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.json({
      status: "SUCCESS",
      message: "LOGIN_SUCCESS",
      data: {
        token,
        // userDB: user, // TODO remove
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: "LOGIN_FAILED",
      data: {
        error,
      },
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user._id,
    });
    if (!user) {
      return res.status(401).json({
        status: "FAILED",
        message: "USER_NOT_FOUND",
      });
    }

    return res.json({
      status: "SUCCESS",
      message: "USER_GET_ME",
      data: {
        user: {
          _id: user._id,
          wallets: user.wallets,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      message: "GET_ME_FAILED",
      data: {
        error,
      },
    });
  }
};
