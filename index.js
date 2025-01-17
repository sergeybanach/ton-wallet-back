const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./utils/db");

const envs = require("./config/env");
console.log("envs:");
console.log(envs);

app.listen(envs.PORT, async () => {
  console.log(`Listening on ${envs.PORT}`);
  await connectDB();
});
