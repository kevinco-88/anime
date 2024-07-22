const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const animeRoutes = require("./routes/animeRoutes");
const {
  checkLogin,
  requireAuth,
  checkUser,
} = require("./middleware/authMiddleware");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const dbURI =
  "mongodb+srv://kevikevi123:kevikevi123@cluster0.6xweptx.mongodb.net/anime";
mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

app.get("*", checkUser);

app.get("/", checkLogin, (req, res) => {
  res.render("home");
});
app.get("/clientHome", requireAuth, (req, res) => {
  res.render("clientHome");
});

app.use(authRoutes);
app.use(animeRoutes);
