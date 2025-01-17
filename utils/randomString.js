const crypto = require("crypto");

module.exports.generatePassword = (
  length = 20,
  characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$"
) =>
  Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => characters[x % characters.length])
    .join("");

module.exports.getSalt = () => crypto.randomBytes(128).toString("base64");

module.exports.getHash = (password, salt) =>
  crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");

module.exports.validatePasswordHash = (password, salt, hash) => {
  const encryptHash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  return crypto.timingSafeEqual(hash, encryptHash);
};
