const express = require("express");
const { verify } = require("jsonwebtoken");
const router = express.Router();

module.exports = () => {
  const auth = require("../controllers/users");

  const {
    signup,
    login,
    verifyEmail,
    verifyChangeEmail,
    reset,
    getUserIdList,
    resendEmailbyUserid,
    resendEmailbyEmail,
    validateUserName,
  } = auth();
  

  router.get("/verify/:id/:token/:newEmail", verifyChangeEmail);
  router.post("/userIdList", getUserIdList);
  router.post("/resendEmail", resendEmailbyEmail);
  router.post("/resendEmailbyUserId", resendEmailbyUserid);
  return router;
};
