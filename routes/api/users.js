const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");
const { result } = require("lodash");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
    // Form validation

    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        if(user) {
            return res.status(400).json({ email: "Email already exists" });
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                dept: req.body.dept,
                courses: req.body.courses,
                textarea: req.body.textarea
            });

            // Hash passord before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
    // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

  const email = req.body.email;
    const password = req.body.password;
  // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };
  // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
  });

// @route POST api/users/fetchdata
//   router.get("/fetchdata", (req, res) => {
//     User.find({}, (err, data) => {
//         res.json(data);
//     })
// });

router.route('/fetchdata')
  .get((req, res) => {
      User.find({}, (err, users) => {
          if (err) throw err;
          res.json(users)
      })
  })
  .post((req, res) => {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        dept: req.body.dept,
        courses: req.body.courses,
        textarea: req.body.textarea
      });
      // Hash passord before saving in database
      bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user.save()
            res.json(user)
        });
    });
  })

// @route GET api/users/:id
// router.get("/:id", (req, res) => {
//     User.findById(req.params.id, (err, user) => {
//         res.json(user)
//     })
// })


// Middleware
router.use("/:id", (req, res, next) => {
    User.findById(req.params.id, (err, user) => {
        if(err)
            res.status(500).send(err)
        else {
            req.user = user;
            next()
        }
    })
})

// @route UPDATE api/users/:id
router.route("/:id")
    .get((req, res) => {
        res.json(req.user)
    })
    .put((req, res) => {
            req.user.name = req.body.name;
            req.user.email = req.body.email;
            req.user.password = req.body.password;
            req.user.dept = req.body.dept;
            req.user.courses = req.body.courses;
            req.user.textarea= req.body.textarea;
            // Hash passord before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.user.password, salt, (err, hash) => {
                    if (err) throw err;
                    req.user.password = hash;
                    req.user
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
    })
    .patch((req, res) => {
        if(req.body._id){
            delete req.body._id;
        }
        for( let p in req.body ){
            req.user[p] = req.body[p]
        }
        req.user.save()
        res.json(req.user)
    })
    .delete((req, res) => {
        req.user.remove(err => {
            if(err){
                res.status(500).send(err)
            }
            else {
                res.status(204).send('removed')
            }
        })
    })

module.exports = router;