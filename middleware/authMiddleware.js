const jwt = require("jsonwebtoken");
const { User } = require("../modules/user");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "winteristheonlysalvation", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "winteristheonlysalvation", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedToken);
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

const checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "winteristheonlysalvation", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        next();
      } else {
        res.redirect("/clientHome");
      }
    });
  } else {
    next();
  }
};

module.exports = { checkLogin, requireAuth, checkUser };
