const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Plese enter a username"],
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter an password "],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  verified: {
    type: Boolean,
  },
});

const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, expires: "10m" },
});

userSchema.post("save", function (doc, next) {
  console.log("new user was created");
  next();
});

tokenSchema.post("save", function (doc, next) {
  console.log("new user was created");
  next();
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
};

const User = mongoose.model("user", userSchema);
const Code = mongoose.model("tokenUser", tokenSchema);
module.exports = { User, Code };
