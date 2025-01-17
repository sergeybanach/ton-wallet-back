const express = require("express");
const {
  validateTelegramUser,
  register,
  login,
  getMe,
  registerFast,
  loginPassword,
} = require("../controllers/user.controller");

const authJWT = require("../middlewares/authJWT");
const {
  createWallet,
  getWalletById,
  transferTonFromWalletId,
} = require("../controllers/wallet.controller");
const { updateCounter } = require("../controllers/counter.controller");

const router = express.Router();

// user
router.post("/validateTelegramUser", validateTelegramUser);
router.post("/register", register);
router.post("/registerFast", registerFast);
router.post("/login", login);
router.post("/getMe", authJWT, getMe); // TODO remove
router.get("/getMe", authJWT, getMe);

// wallet
router.post("/createWallet", authJWT, createWallet);
router.post("/getWalletById", authJWT, getWalletById);
router.post("/transferTonFromWalletId", authJWT, transferTonFromWalletId);

// counter
router.post("/updateCounter", authJWT, updateCounter);

module.exports = router;
