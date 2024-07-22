const { User, Code } = require("../modules/user");
const jwt = require("jsonwebtoken");
const { sendCode } = require("../mail/authmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { error } = require("console");

//handle errors
const handleErrors = (err) => {
  let errors = { username: "", email: "", password: "" };

  //incorrect username
  if (err.message === "incorrect username") {
    errors.username = "that username is not registered";
  }
  //incorrect email
  if (err.message === "incorrect email") {
    errors.email = "that email is not registered";
  }

  //incorrect password
  if (err.message === "incorrect password") {
    errors.password = "that password is incorrect";
  }

  //duplicate error code
  //duplicate error code
  if (err.code === 11000) {
    if (
      err.errmsg.includes(
        "E11000 duplicate key error collection: anime.users index: username_"
      )
    ) {
      errors.username = "This username is already registered";
    } else {
      errors.email = "This email is already registered";
    }
    // Stop processing further and return the errors
    return errors;
  }

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors; // Return errors if no duplicate error occurred
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "winteristheonlysalvation", { expiresIn: maxAge });
};

module.exports.signup_get = async (req, res) => {
  const token = req.cookies.jwt_v;
  const tokenF = req.cookies.jwt_f;
  let showVerification;
  let showRecovery;
  if (token) {
    showVerification = true;
  } else {
    showVerification = false;
  }
  if (tokenF) {
    showRecovery = true;
  } else {
    showRecovery = false;
  }
  res.render("signup", { showVerification, showRecovery });
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { username, email, password } = req.body;
  try {

    const user = await User.create({
      username,
      email,
      password,
      verified: false,
    });
    console.log("User created:", user);


    const code = crypto.randomInt(100000, 999999);


    const verificationCode = await Code.create({
      email,
      code,
    });
    console.log("verificationCode created:", verificationCode);
    const token = createToken(verificationCode._id);
    res.cookie("jwt_v", token, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
    });


    await sendCode(email, code);
    console.log("Verification email sent");


    res.status(201).json({ user });
  } catch (err) {
    console.error("Error:", err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.verify_post = async (req, res) => {
  const { code, password } = req.body; 
  const token = req.cookies.jwt_v;
  const tokenF = req.cookies.jwt_f;
  if (!code) {
    return res.status(400).json({ errors: "Code is required" });
  }

  if (token) {
    jwt.verify(token, "winteristheonlysalvation", async (err, decodedToken) => {
      if (err) {
        console.log("JWT verification error:", err.message);
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        console.log("Decoded token:", decodedToken);
        try {
          let user = await Code.findById(decodedToken.id);
          console.log("User found:", user);

          if (user && user.code === code) {
            let userSigned = await User.findOneAndUpdate(
              { email: user.email }, 
              { verified: true }, 
              { new: true } 
            );
            res.cookie("jwt_v", "", { maxAge: 1 });

            await Code.deleteOne({ _id: user._id });
            console.log("Code verified and deleted");

            const token = createToken(userSigned._id);
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: maxAge * 1000,
            });
            res.status(201).json({ user: userSigned._id });
          } else if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
          } else {
            console.log("Invalid code provided");
            return res.status(400).json({ message: "Invalid code" });
          }
        } catch (error) {
          console.error("Database error:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    });
  } else if (tokenF) {
    if (!password) {
      return res.status(400).json({ errors: "Password is required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ errors: "Password must be at least 6 characters long" });
    }
    jwt.verify(
      tokenF,
      "winteristheonlysalvation",
      async (err, decodedToken) => {
        if (err) {
          console.log("JWT verification error:", err.message);
          return res.status(401).json({ message: "Unauthorized" });
        } else {
          console.log("Decoded token:", decodedToken);
          try {
            let user = await Code.findById(decodedToken.id);
            console.log("User found:", user);

            if (user && user.code === code) {
              const salt = await bcrypt.genSalt();
              const hashedPassword = await bcrypt.hash(password, salt);
              await User.findOneAndUpdate(
                { email: user.email }, 
                { password: hashedPassword }, 
                { new: true } 
              );
              res.cookie("jwt_f", "", { maxAge: 1 });

              await Code.deleteOne({ _id: user._id });
              console.log("Code verified and deleted");

              res.status(201).json({ redirect: "/login" });
            } else if (!user) {
              console.log("User not found");
              return res.status(404).json({ errors: "User not found" });
            } else {
              console.log("Invalid code provided");
              return res.status(400).json({ errors: "Invalid code" });
            }
          } catch (error) {
            console.error("Database error:", error);
            return res.status(500).json({ errors: "Internal server error" });
          }
        }
      }
    );
  } else {
    console.log("No token provided");
    return res.status(400).json({ message: "No token provided" });
  }
};

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);
    if (user.verified === true) {
      const token = createToken(user._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });
      res.cookie("jwt_v", "", { maxAge: 1 });
      res.cookie("jwt_f", "", { maxAge: 1 });
      res.status(201).json({ user });
    } else if (user.verified === false) {
      res.cookie("jwt_v", "", { maxAge: 1 });
      console.log(user.email);
      const email = user.email;
      await Code.deleteOne({ email: user.email });


      const code = crypto.randomInt(100000, 999999);


      const verificationCode = await Code.create({
        email,
        code,
      });
      console.log("verificationCode created:", verificationCode);


      const tokenI = createToken(verificationCode._id);
      res.cookie("jwt_v", tokenI, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000,
      });
      console.log("Verification cookie set");


      await sendCode(email, code);
      console.log("Verification email sent");
      res.status(404).json({ verified: false, redirect: "/signup" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    console.error(err); 
    return res.status(400).json({ errors });
  }
};

module.exports.logout_get = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports.delete_get = async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "winteristheonlysalvation", async (err, decodedToken) => {
      if (err) {
        next();
      } else {
        console.log(decodedToken);
        await User.findByIdAndDelete(decodedToken.id);
        res.cookie("jwt", "", { maxAge: 1 });
        res.redirect("/");
        console.log("user deleted");
      }
    });
  } else {
    next();
  }
};

module.exports.forgotPassword_post = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      // Generate verification code
      const token = req.cookies.jwt_f;
      if (token) {
        jwt.verify(
          token,
          "winteristheonlysalvation",
          async (err, decodedToken) => {
            if (err) {
              console.log(err);
              res.status(500).json("internal server error");
            } else {
              console.log(decodedToken);
              await Code.findByIdAndDelete(decodedToken.id);
            }
          }
        );
      }
      res.cookie("jwt_f", "", { maxAge: 1 });
      const code = crypto.randomInt(100000, 999999);

      // Save verification code to the database
      const verificationCode = await Code.create({
        email,
        code,
      });
      console.log("verificationCode created:", verificationCode);

      //create the new token
      const tokenI = createToken(verificationCode._id);
      res.cookie("jwt_f", tokenI, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000,
      });
      console.log("Verification cookie set");

      // Send verification email
      await sendCode(email, code);
      console.log("Verification email sent");
      res.status(200).json({ verified: false, redirect: "/signup" });
    } else {
      res.status(404).json({ errors: "This email does not exist" });
      console.log("User does not exist");
    }
  } catch (err) {
    res.status(500).json("Internal server error");
    console.error(err);
  }
};
