const express = require("express");
const router = express.Router();

module.exports = () => {
  
  const vehiclesRoutes = require("./vehicles")(router)
  const teltonikaRoutes = require("./teltonika")(router)
  const usersRoutes = require("./users")(router)
  const commonRoutes = require("./common")(router)
  const alertRoutes = require("./alerts")(router)



  return router;
};
