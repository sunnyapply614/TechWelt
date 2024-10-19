const express = require("express");
const { verify } = require("jsonwebtoken");
const router = express.Router();

module.exports = () => {
  const auth = require("../controllers/users");


  
  router.post("/login", login);
  router.post("/signup", signup);
  router.post("/validateUserName", validateUserName);
  router.post("/reset", reset);
  router.get("/verify/:id/:token", verifyEmail);
  router.get("/verify/:id/:token/:newEmail", verifyChangeEmail);
  router.post("/userIdList", getUserIdList);
  router.post("/resendEmail", resendEmailbyEmail);
  router.post("/resendEmailbyUserId", resendEmailbyUserid);
  return router;
};
