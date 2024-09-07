const express = require("express");
const router = express.Router();

module.exports = () => {
  


  router.use("/vehicles", vehiclesRoutes);
  router.use("/teltonika", teltonikaRoutes);
  router.use("/users", usersRoutes);
  router.use("/common", commonRoutes);
  router.use("/alerts", alertRoutes);

  return router;
};
