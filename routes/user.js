const express = require("express");
const router = express.Router();
const WrapAsync = require("../utils/WrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


router.get("/signup", async(req, res) => {
    res.render("user/signup.ejs")
  });

router.get("/login",(req, res) => {
    res.render("user/login.ejs")
  });
router.post("/login",saveRedirectUrl,
      passport.authenticate('local', {
         failureRedirect: '/login',
         failureFlash : true 
        }),
        async(req, res) => {
            req.flash("success", "Logged in Successfully" )
         let redirectUrl = "/listings"
    res.redirect(redirectUrl)
  });
  
  router.post("/signup",WrapAsync( async(req, res) => {
    try {
        let {email,username,password } = req.body;
        const newUser = new User({email,username});
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser,(err) => {
          if(err){
            next(err);
          }
          req.flash("success", `${username}, Signup Successfully `)
          res.redirect("/listings");
        }
        )
        
    } catch (error) {
        req.flash("error", `${username} already exists `)
        res.redirect("/signup")

        
    }


  }))
  
  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You are logged out");
      res.redirect("/listings");
    });
  });
  
  module.exports = router;