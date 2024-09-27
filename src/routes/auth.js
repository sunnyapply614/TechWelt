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

  return router;
};
