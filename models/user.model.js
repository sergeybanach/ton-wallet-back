const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  walletName: { type: String },
  stringWalletAddress: { type: String }, // TODO remove
  publicKey: { type: String },
  secretKey: { type: String },
  balance: { type: String },
});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String },
    salt: { type: String },
    hash: { type: String },

    firstName: { type: String },
    lastName: { type: String },
    telegramId: {
      type: Number,
    },
    wallets: [WalletSchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
