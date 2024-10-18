require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
var generator = require("generate-password");

const { userSchema } = require("../models");

const baseUrl =
  process.env.DEV == "Develop"
    ? process.env.BASE_URL + ":" + process.env.CLIENT_PORT
    : process.env.BASE_URL;

module.exports = () => {


  const getUsers = async (req, res) => {
    try {
      const userId = req.user.id;
      const admin = await userSchema.findOne({ _id: userId });
      if (admin && admin.role === "Admin") {
        const users = await userSchema.find({});
        res.status(200).json({ users });
      } else if (admin && admin.role === "Manager") {
        const users = await userSchema.find({ role: "Client" });
        res.status(200).json({ users });
      } else {
        res.status(401).send({ message: "Access Denied" });
      }catch (err) {
      console.log("error", err);
      res.status(401).send({ message: "Error Occured", error: err });
    }
    } 
  };

  const addUser = async (req, res) => {
    const {
      fname,
      lname,
      email,
      phone,
      country,
      address,
      role,
      company,
      image,
    } = req.body;
    const userId = req.user.id;
    if (!(email && fname && lname && userId)) {
      res.status(400).json({ message: "All Input is required" });
      return;
    }
    
    try {
      const admin = await userSchema.findOne({ _id: userId });
      const user1 = await userSchema.findOne({ lname });
      const user2 = await userSchema.findOne({ email });
      console.log(user1);

      if (admin && (user2 || user1)) {
        res.status(400).json({ message: "Already same user exists!" });
      } else {
        if (admin && admin.role != "Admin" && admin.role != "Manager") {
          res.status(401).send({ message: "Access Denied" });
          return;
        }
        if (admin.role == "Manager" && role != "Client") {
          res.status(401).send({ message: "Access Denied" });
          return;
        }
        const hashedPassword = await bcrypt.hash("1", 10);

        const verifyToken = randHex(32);
        let user = new userSchema({
          fname: fname,
          lname: lname,
          email: email,
          password: hashedPassword,
          phone: phone,
          country: country,
          address: address,
          company: company,
          role: role,
          verified: false,
          token: verifyToken,
          image: image,
        });
        await user.save();

        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "9h",
        });
        const message = `${baseUrl}/backend/auth/verify/${user.id}/${verifyToken}`;
        sendEmail("wuquianjie@gmail.com", "Verify Email", message);
        console.log("email verification:", message);
        res.status(200).json({ token });
      }
    } catch (err) {
      console.log("error", err);
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };

  const updateUser = async (req, res) => {
    const {
      fname,
      lname,
      email,
      phone,
      country,
      address,
      role,
      company,
      image,
    } = req.body;
    const userId = req.user.id;
    if (!(email && fname && lname && userId)) {
      res.status(400).json({ message: "All Input is required" });
      return;
    }
    try {
      const admin = await userSchema.findOne({ _id: userId });
      if (
        (admin && admin.role == "Client") ||
        (admin.role == "Manager" && role != "Client")
      ) {
        res.status(401).json({ message: "Permission Error!" });
        return;
      }
      userSchema.updateOne(
        { email: email },
        {
          $set: {
            fname: fname,
            lname: lname,
            phone: phone,
            country: country,
            address: address,
            company: company,
            role: role,
            image: image,
          },
        },
        (err, result) => {
          if (err) {
            res.status(401).json({ message: "Something went wrong" });
          } else {
            res
              .status(200)
              .json({ message: "User updated successfully", result });
          }
        }
      );
    } catch (err) {
      console.log("error", err);
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };

  const removeUser = async (req, res) => {
    const userId = req.user.id;
    const { email } = req.body;
    if (!email || email == "") {
      res.status(401).json({ message: "Something went wrong" });
      return;
    }
    try {
      const admin = await userSchema.findOne({ _id: userId });
      const user = await userSchema.findOne({ email: email });
      if (!user) {
        res.status(200).json({ message: "User not exist" });
        return;
      }

      if (
        (admin && admin.role == "Admin") ||
        (admin.role == "Manager" && user.role == "Client")
      ) {
        await user.deleteOne();
        res.status(200).json({ message: "User deleted successfully" });
      } else {
        res.status(401).send({ message: "Access Denied" });
      }
    } catch (err) {
      console.log("error", err);
      res.status(500).json({ message: "Something went wrong.", err: err });
    }
  };

  const activateUser = async (req, res) => {
    const { email, activate } = req.body;
    const userId = req.user.id;
    if (!email || email == "") {
      res.status(401).json({ message: "User info wrong." });
      return;
    }
    try {
      const admin = await userSchema.findOne({ _id: userId });
      const user = await userSchema.findOne({ email: email });

      if (
        (admin && user && admin.role == "Admin") ||
        (admin.role == "Manager" && user.role == "Client")
      ) {
        userSchema.updateOne(
          { email: email },
          { $set: { verified: activate } },
          (err, result) => {
            if (err) {
              res
                .status(401)
                .json({ message: "Something went wrong", error: err });
            } else {
              res
                .status(200)
                .json({ message: "User activated successfully", result });
            }
          }
        );
      } else {
        res.status(401).json({ message: "Params Wrong!!" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong.", err: err });
    }
  };

  // to use nodemail
  // const sendEmail = (to, subject, text) => {
  //   const transporter = nodemailer.createTransport({
  //     host: "smtp.vehtechs.com",
  //     port: 465,
  //     secure: true, // use SSL
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASS,
  //     },
  //   });
  //   const mailOptions = {
  //     from: process.env.EMAIL_USER,
  //     to,
  //     subject,
  //     text,
  //   };
  //   transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       console.error(error);
  //     } else {
  //       console.log(`Email sent: ${info.response}`);
  //     }
  //   });

  // };

  const sendEmail = (to, subject, text) => {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
    });

    mg.messages
      .create(process.env.MAILGUN_API_DOMAIN || "", {
        from: "support@vehtechs.com",
        to: [to],
        subject,
        text: `Click on the following link to complete your registration: ${text}`,
      })
      .then((msg) => console.log(msg)) // logs response data
      .catch((err) => console.log(err));
  };

  const login = async (req, res) => {
    const { type, userId, password } = req.body;
    if (!(type && userId && password)) {
      res.status(400).send({ message: "All Input is required" });
      return;
    }

    try {
      let user;
      if (type == "email") {
        user = await userSchema.findOne({ email: userId });
      } else {
        user = await userSchema.findOne({ lname: userId });
      }
      console.log(
        password,
        user.password,
        await bcrypt.compare(password, user.password)
      );
      //if (user && user.verified && (await bcrypt.compare(password, user.password))) {
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { id: user.id.toString() },
          process.env.TOKEN_SECRET,
          { expiresIn: "9h" }
        );
        res.user = user;
        res.status(200).send({ user, token });
      } else {
        res.status(401).send({ message: "Invalid Credentials" });
      }
    } catch (err) {
      console.log("error", err);
      res.status(400).json({ message: "Something went wrong.", err: err });
    }
  };

  const signup = async (req, res) => {
    const { fname, userName, email, password, phone, city, country } = req.body;
    if (!(email && password && fname && userName)) {
      res.status(400).json({ message: "All Input is required" });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password should not be less than 6 digits" });
      return;
    }
    try {
      const user = await userSchema.findOne({ email });
      const user1 = await userSchema.findOne({ lname: userName });

      if (user || user1) {
        res.status(400).send({ message: "Already same user exists!" });
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const verifyToken = randHex(32);
        let user = new userSchema({
          fname: fname,
          lname: userName,
          email: email,
          password: hashedPassword,
          phone: phone,
          address: city,
          country: country,
          verified: false,
          token: verifyToken,
        });
        await user.save();

        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "9h",
        });
        const message = `${baseUrl}/login?userId=${user.id}&verifyToken=${verifyToken}`;
        console.log(">>>>>>>>", message);
        sendEmail(email, "Verify Email", message);
        console.log("email verification:", message);
        res.status(200).json({ token, message: message });
      }
    } catch (err) {
      console.log("error", err);
      res.status(400).json({ message: "Something went wrong.", err: err });
    }
  };

  const verifyEmail = async (req, res) => {
    try {
      const token = await userSchema.findOne({
        _id: req.params.id,
        token: req.params.token,
      });
      if (!token) return res.status(400).send("Invalid link");
      await userSchema.updateOne(
        { _id: req.params.id },
        { $set: { verified: true } }
      );

      res.send("email verified sucessfully");
    } catch (error) {
      res.status(400).send("An error occured");
    }
  };

  const validateUserName = async (req, res) => {
    try {
      console.log(req.body);
      const users = await userSchema.find({ lname: req.body.userName });
      if (users.length > 0) {
        res.send(false);
      } else {
        res.send(true);
      }
    } catch (error) {
      res.status(400).send("An error occurred");
    }
  };

  const getUserIdList = async (req, res) => {
    try {
      const userIds = await userSchema.find({}, { lname: 1 });
      if (userIds) {
        res.status(200).send(userIds);
      }
    } catch (err) {
      res.status(400).send({ message: "An error occured", error: err });
    }
  };

  const getUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await userSchema.findOne({ _id: userId });
      if (user) {
        res.status(200).json({ user });
      }
    } catch (err) {
      res.status(400).send({ message: "An error occured", error: err });
    }
  };

  const getGoogleAPIKey = async (req, res) => {
    try {
      const apikey = process.env.GOOGLEMAP_APIKEY;
      if (apikey) {
        res.status(200).json({ apikey });
      }
    } catch (err) {
      res.status(400).send({ message: "An error occured", error: err });
    }
  };

  const reset = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "All Input is required" });
        return;
      }
      const user = await userSchema.findOne({ email });
      if (user) {
        const newpass = generator.generate({
          length: 12,
          numbers: true,
        });
        const hashedPassword = await bcrypt.hash(newpass, 10);
        await user.updateOne({ $set: { password: hashedPassword } });
        console.log(newpass, "newpass");
        sendEmail(
          "wuquianjie@gmail.com",
          "Reset Password",
          "Your New Password is \n" + newpass
        );
        res.status(200).send({ message: "Check your Email" });
      } else {
        res.status(401).send({ message: "Not registered!!!" });
      }
    } catch (error) {
      res.status(400).send("An error occured");
    }
  };

  const changeEmail = async (req, res) => {
    const { oldEmail, newEmail } = req.body;
    const userId = req.user.id;
    if (!(oldEmail && newEmail && userId)) {
      res.status(400).json({ message: "All Input is required" });
      return;
    }
    try {
      const admin = await userSchema.findOne({ _id: userId });
      const message = `${baseUrl}/backend/auth/verify/${admin.id}/${admin.token}/${newEmail}`;
      console.log(">>>>>>>>", message);
      sendEmail("wuquianjie@gmail.com", "Verify Email", message);
      res.status(200).send({ message: "Check your Email" });
    } catch (err) {
      console.log("error", err);
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };

  const verifyChangeEmail = async (req, res) => {
    try {
      const token = await userSchema.findOne({
        _id: req.params.id,
      });
      console.log(">>>VerifyChangeEmail", req.query);
      console.log(
        ">>>VerifyChangeEmail",
        req.params.id,
        req.params.newEmail,
        req.params.token
      );
      if (!token) return res.status(400).send("Invalid link");
      await userSchema.updateOne(
        { _id: req.params.id },
        { $set: { email: req.params.newEmail } }
      );
      res.send("change email verified sucessfully");
    } catch (error) {
      res.status(400).send("An error occured");
    }
  };

  const updatePwd = async (req, res) => {
    const { newPwd, email } = req.body;
    const userId = req.user.id;
    try {
      const admin = await userSchema.findOne({ _id: userId });
      if (!admin) {
        res.status(401).json({ message: "Permission Error!" });
        return;
      }
      const hashedPassword = await bcrypt.hash(newPwd, 10);
      console.log(">>>updatePwd", newPwd, hashedPassword);
      userSchema.updateOne(
        { email: email },
        {
          $set: {
            password: hashedPassword,
          },
        },
        (err, result) => {
          if (err) {
            res.status(401).json({ message: "Something went wrong" });
          } else {
            res
              .status(200)
              .json({ message: "Password changed successfully", result });
          }
        }
      );
    } catch (err) {
      console.log("error", err);
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };

  const updateAvatar = async (req, res) => {
    const { image, email } = req.body;
    const userId = req.user.id;
    try {
      const admin = await userSchema.findOne({ _id: userId });
      if (!admin) {
        res.status(401).json({ message: "Permission Error!" });
        return;
      }
      userSchema.updateOne(
        { email: email },
        {
          $set: {
            image: "data:image/jpeg;base64," + image,
          },
        },
        (err, result) => {
          if (err) {
            res.status(401).json({ message: "Something went wrong" });
          } else {
            res
              .status(200)
              .json({ message: "Image updated successfully", result });
          }
        }
      );
    } catch (err) {
      console.log("error", err);
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };

  const updateMobileNo = async (req, res) => {
    const { phone, email } = req.body;
    const userId = req.user.id;
    try {
      const admin = await userSchema.findOne({ _id: userId });
      if (!admin) {
        res.status(401).json({ message: "Permission Error!" });
        return;
      }
      userSchema.updateOne(
        { email: email },
        {
          $set: {
            phone: phone,
          },
        },
        (err, result) => {
          if (err) {
            res.status(401).json({ message: "Something went wrong" });
          } else {
            res
              .status(200)
              .json({ message: "Phone Updated Successfully!", result });
          }
        }
      );
    } catch (err) {
      console.log("error", err);
      res.status(401).json({ message: "Something went wrong.", err: err });
    }
  };

  const resendEmailbyUserid = async (req, res) => {
    console.log("0", req.body);
    const { userId } = req.body;

    const user = await userSchema.findOne({ _id: userId });
    if (user) {
      try {
        const verifyToken = randHex(32);
        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "9h",
        });
        await userSchema.updateOne({ _id: userId }, { token: verifyToken });

        const message = `${baseUrl}/login?userId=${user.id}&verifyToken=${verifyToken}`;
        console.log(">>>>>>>>", message);
        sendEmail(user.email, "Verify Email", message);
        res.status(200).json({ token, message: message });
      } catch (err) {
        console.log("error", err);
        res.status(400).json({ message: "Something went wrong.", err: err });
      }
    }
  };

  const resendEmailbyEmail = async (req, res) => {
    console.log("0", req.body);
    const { email } = req.body;

    const user = await userSchema.findOne({ email });
    if (user) {
      try {
        const verifyToken = randHex(32);
        const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "9h",
        });
        await userSchema.updateOne({ email }, { token: verifyToken });

        const message = `${baseUrl}/login?userId=${user.id}&verifyToken=${verifyToken}`;
        console.log(">>>>>>>>", message);
        sendEmail(user.email, "Verify Email", message);
        res.status(200).json({ token, message: message });
      } catch (err) {
        console.log("error", err);
        res.status(400).json({ message: "Something went wrong.", err: err });
      }
    }
  };

  return {
    signup,
    login,
    verifyEmail,
    reset,
    getUsers,
    addUser,
    updateUser,
    removeUser,
    getUserIdList,
    activateUser,
    getUser,
    getGoogleAPIKey,
    changeEmail,
    verifyChangeEmail,
    updatePwd,
    updateAvatar,
    updateMobileNo,
    resendEmailbyUserid,
    resendEmailbyEmail,
    validateUserName,
  };
};
