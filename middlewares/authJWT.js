const jwt = require("jsonwebtoken");
const envs = require("../config/env");

const authJWT = (req, res, next) => {
  const BOT_TOKEN = req.headers.authorization?.split(" ")[1];
  const JWT_SECRET = envs.JWT_SECRET;

  if (!BOT_TOKEN) return res.sendStatus(403);

  try {
    const decoded = jwt.verify(BOT_TOKEN, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

module.exports = authJWT;
