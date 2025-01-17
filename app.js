const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  console.log(" --- Request --- ");
  console.log("req.url: ", req.url);
  console.log("req.headers: ", req.headers);
  console.log("req.body: ", req.body);
  next();
});

app.use("/", apiRoutes);

module.exports = app;
