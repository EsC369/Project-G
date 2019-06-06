const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require("bcryptjs");
const config = require("config");
// const auth = require("./middleware/auth");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// Session:
const sessionSecret = config.get("sessionSecret");
const session = require("express-session");
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } // One hour I believe
}));
// Flash messages
// Note for flashing it is best to install as such: npm install git://github.com/RGBboy/express-flash.git:
const flash = require("express-flash");
app.use(flash());

// Db Config:
const db = config.get("mongoURI");

// Models:
const User = require("./models/User");

// Routes
// Root / Register page:
app.get('/', (req, res) => {
  // This is where we will retrieve the users from the database and include them in the view page we will be rendering.
  res.render('index.ejs');
})
// Login page:
app.get("/logPage", (req, res) => {
  res.render("login.ejs")
})

// Raffle:
app.get('/raffle', (req, res) => {
  res.render('raffle.ejs');
})

// Lottery:
app.get('/lottery', (req, res) => {
  res.render('lottery.ejs');
})

// Scratcher:
app.get('/scratcher', (req, res) => {
  res.render('scratcher.ejs');
})

// Games Table:
app.get('/games', (req, res) => {
  if(!req.session.user_id) {
    console.log("Session Verfication Failed! Please Register or Login...");
    req.flash("error", "Session Verfication Failed! Please Register or Login...");
    res.redirect("/");
}else {
  User.findOne({_id: req.session.user_id}, function(err, user){
    if(err) {
      console.log("Session Verfication Failed! Please Register or Login...");
      req.flash("error", "Session Verfication Failed! Please Register or Login...");
      res.redirect("/");
    }
    else {
        res.render("games", {user: user});
    }
});
    
}
  
});

// AUTH / LOGIN:
// @ desc     Auth user/login
// @ route    GET api/auth
// @ access   Public
app.post("/login", (req, res) => {
  // Destructuring, Pulling the values out from request.body
  const { email, password } = req.body;

  // Simple validation:
  if (!email || !password) {
    console.log("Please Enter All fields!")
    req.flash("error", "Please Enter All fields")
    res.redirect("/logpage");
  }

  // Check for existing user:
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        console.log("User Not found!")
        req.flash("error", "User Not Found!")
        res.redirect("/logpage");
      }
      else{
        // Compare password with hash:   user.password = hash
      bcrypt.compare(password, user.password)
      // Add Id to Session:
      req.session.user_id = user._id;
      // Add Name to Session:
      req.session.user_name = user.name;
      req.session.user = user
      // console.log("Currently in Session: ", req.session)
      res.render("games.ejs", {user: req.session.user});
      }
    });
});


// SHOW USER:
// @ desc     Get User Data
// @ route    GET user
// @ access   Private
app.get("/user", (req, res) => {
  User.findById(req.user.id)
    // disregard password/Dont select/use password:
    .select("-password")
    .then(user => res.json(user));
})

// DELETE USER:
// @ desc     DELETE User
// @ route    Delete user
// @ access   Private
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/")
});

// REGISTER NEW USER:
// @ desc     Register new User
// @ route    GET api/users
// @ access   Public
app.post("/register", (req, res) => {
  // Destructuring, Pulling the values out from request.body
  const { name, email, password } = req.body;

  // Simple validation:
  if (!name || !email || !password) {
    console.log("Please Enter All fields!")
    req.flash("error", "Please Enter All fields")
    res.redirect("/");;
  }

  // Check for existing user:
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        console.log("User Already Exists!")
        req.flash("error", "User Already Exists!")
        res.redirect("/");
      }
      const newUser = new User({
        name,
        email,
        password
      })
      // Create salt and hashed password:
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err
          newUser.password = hash;
          console.log("HASHED Password", hash);
          newUser.save((err) => {
            console.log("User Already Exists!")
            req.flash("error", "User Already Exists")
            res.redirect("/");
          })
          if(user){
            console.log("success")
            console.log(user)
            // Add Id Into Session:
            req.session.user_id = user._id;
            res.render("/games", user);
          }
            
           
        });
      });
    });
});

// Connect Mongo:
// // Connect to Mongo:
mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => console.log("Mongo DB Connected..."))
  .catch(err => console.log(err));

app.listen(port, () => {
  console.log(`Server Running On port ${port}`);
})