require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// app.use(
//   session({
//     secret: "thisisthesecretofourwebsite",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// userSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.route("/").get((req, res) => {
  res.render("home");
});

app.route("/secrets").get((req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
  res.render("secrets");
});

app.route("/register").get((req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  console.log("Register process has started");
  let email = await req.body.email;
  let password = await req.body.password;
  console.log(email);
  console.log(password);
  User.register({ username: email }, password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/errInRegister");
    } else {
      passport.authenticate("local", {
        failureRedirect: "/",
        failureMessage: true,
        failureFlash: true,
      })(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

  // console.log(req.session);
  console.log("Register process has ended");
});
// User.register({ username: email }, password, async (err, user) => {
//   if (!err) {
//     console.log(user);
//     await passport.authenticate("local"),
//       function (req, res) {
//         console.log("redirecting started");
//         res.redirect("/secrets");
//       };
//   } else {
//     console.log("error has arrived");
//     console.log(err);
//     res.redirect("/register");
//   }
// });

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {});

app.listen(3000, () => {
  console.log("Server has started!!");
});
