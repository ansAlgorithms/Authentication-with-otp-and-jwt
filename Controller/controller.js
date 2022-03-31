const router = require("express").Router();
const User = require("../models/User"); // Importing the user.js file so that we have accss of user.js file
const UserOtp = require("../models/UserOTP");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken')

module.exports = {
  register: async (req, res) => {
    // Checking whether the user is already existing in the Database
    const emailExist = await User.findOne({
      email: req.body.email
    });
    if (emailExist)
      return res.status(400).json({
        message: "Email already exists."
      });

    // Creating a new user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      verified: false, // by default it is set to false. Once otp verification complete then it will be true.
    }); // saving the user's informations
    user
      .save()
      .then((result) => {
        // nodemailer stuff
        const authEmail = process.env.AUTH_EMAIL;
        let authPass = process.env.PASS;

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          service: "Gmail",
          auth: {
            user: authEmail,
            pass: authPass,
          },
        });
        //send otp function
        const sendOTP = async ({
          _id,
          email
        }, res) => {
          try {
            // generating a random otp of four digits
            const otp = Math.floor(1000 + Math.random() * 9000);

            //mail option
            const mailOptions = {
              from: "anshu.kumar551832@gmail.com",
              to: email,
              subject: "Verify your Email",
              html: `<p>Otp for authentification at Nodejs intern project for user id
                         : <b>${user._id}</b> is : <b>${otp}</b> . Do not share it with anyone.</p>`,
            };

            const newOtp = await new UserOtp({
              userId: _id,
              otp: otp,
              createdAt: Date.now(),
            });

            // save otp record
            await newOtp.save();
            await transporter.sendMail(mailOptions);
            res.json({
              status: "pending",
              message: "Please verify the otp sent to your email",
              data: {
                userId: _id,
                email,
              },
            });
          } catch (error) {
            res.json({
              status: "failed",
              message: error.message,
            });
          }
        };
        sendOTP(result, res); // calling the function to send the otp
      })
      .catch((err) => {
        console.log(err);
        res.json({
          error: err
        });
      });
  },

  // Login
  login: async (req, res) => {
    // Checking whether the user is already existing in the Database
    const user = await User.findOne({
      email: req.body.email
    });
    if (!user) return res.status(400).json({
      message: "Email not found."
    });

    // Password req.body.password, user.password is correct
    if (req.body.password === user.password) {
      //check the user is verified
      if (user.verified === false) {
        res.status(400).json({
          message: "Please Activate your account by OTP"
        });
      } else {
        // Create and assign a token
        const token = jwt.sign({
          _id: user._id
        }, process.env.TOKEN_SECRET);
        res.set("auth-token", token)
        res.json({
          message: `Successfully Logged In.`,
          token: token
        });
      }
    } else res.status(400).json({
      message: "Invalid Password"
    });
  },

  // send otp verification email
  verify: async (req, res) => {
    // nodemailer stuff
    const otpRecord = await UserOtp.findOne({
      userId: req.body.userId
    });
    //console.log("succeed")
    if (req.body.otp === otpRecord.otp) {
      await User.updateOne({
        _id: req.body.userId
      }, {
        verified: true
      });
      await UserOtp.deleteMany({
        userId: req.body.userId
      });
      res.json({
        status: "verified",
        message: "email verified successfully",
      });
    } else {
      res.json({
        err: error
      });
    }
  },



  // Posts
  posts:  (req, res) => {
    res.json({
      Title: `IIT Patna`,
      Description: `Indian Institute of Technology Patna (abbreviated IIT Patna or IITP) is a 
      public technical university located in Patna, India. It is recognized as an Institute of
      National Importance by the Government of India. It is one of the new IITs established by 
      an Act of the Indian Parliament on August 6, 2008. The permanent campus of IIT Patna is 
      located at Bihta which is approximately 30 km from Patna and has been fully operational 
      since 2015.`,
    });
  },

  // delete
  delete: async (req, res) => {
    // Checking for non-existing student
    const emailExist = await User.findOne({
      email: req.params.email
    });
    if (!emailExist)
      return res.status(400).json({
        message: "Email not found !"
      });

    // Deletion of particular data from database
    User.deleteOne({
        email: req.params.email
      })
      .then((result) => {
        res
          .status(200)
          .json({
            message: "successfully deleted",
            result: result
          });
      })
      .catch((err) => {
        res.status(500).json({
          message: "something went wrong",
          error: err,
        });
      });
  },
};