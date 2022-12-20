const { createUser, loginUser } = require("../db/user");
const passport = require("passport");
const { validateEmail, validatePassword } = require("../utils/validation");
const User = require("../models/user");
const  jwt = require('jsonwebtoken');

const authController = {
  google: (req, res) => {
    return passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
  },
  googleCallback: (req, res) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/login?e=Unauthorized" },
      (err, user) => {
        req.login(user, async (err) => {
          if (!err) {
            const token =  jwt.sign({ user: {username: user.username, _id: user._id } }, process.env.SECRET);
            res.cookie('token', token);
            return res.redirect("/");
          }
        });
      }
    )(req, res);
  },
  login: async (req, res, next) => {
    const { username, password } = req.body;
    return await loginUser(req, res, username, password);
  },
  register: async (req, res, next) => {
    const { username, password, confirm } = req.body;
    const name = username.split("@")[0];
    const profileUrl = "";
    const searchName = name.toLowerCase();

    if (!validateEmail(username)) {
      return res.render("register", { error: { emailError: "Invalid email format" } });
    }
    if (!validatePassword(password, confirm)) {
      return res.render("register", {
        error: {
          passwordError:
            "Password should contain atleast one digit, one lower and upper case letter and the length should be atleast 8 characters",
        },
      });
    }
    return await createUser(
      req,
      res,
      username,
      password,
      name,
      profileUrl,
      searchName
    );
  },
  logout: async (req, res, next) => {
    req.logout((err) => {
      req.session.destroy(function (err) {
        res.clearCookie('token');
        return res.redirect('/'); 
      });
    });
  },
};

module.exports = authController;
