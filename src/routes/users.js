module.exports = (router) => {
  const users = require("../controllers/users")


  router.post("/getGoogleAPIKey", getGoogleAPIKey)
  router.post("/getUser", getUser)
  router.get("/list", getUsers)
  router.post("/addUser", addUser)
  router.post("/updateUser", updateUser)
  router.post("/removeUser", removeUser)
  router.post("/activateUser", activateUser)
  router.post("/changeEmail", changeEmail)
  require('./companies')(router);

  return router
}
