const envs = {
  PORT: Number(process.env.PORT) || 5002,
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  MONGO_URI:
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/link-tma-app-demo" ||
    "",
  JWT_SECRET: process.env.JWT_SECRET || "jwtsecret",
  JWT_EXPIRES: process.env.JWT_EXPIRES || "365d",
  TON_CENTER_API_KEY_TESTNET: process.env.TON_CENTER_API_KEY_TESTNET || "",

  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.ethereal.email",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  EMAIL_IS_SECURE: (process.env.EMAIL_IS_SECURE.toLowerCase()) === "true",
};

module.exports = envs;
