module.exports = (router) => {
  const users = require("../controllers/users")
  const {
    getUsers, addUser, updateUser, removeUser, activateUser, getUser, getGoogleAPIKey,changeEmail,updateAvatar
  } = users()

  router.post("/getGoogleAPIKey", getGoogleAPIKey)
  router.post("/getUser", getUser)
  router.get("/list", getUsers)
  router.post("/addUser", addUser)
  router.post("/updateUser", updateUser)
  router.post("/removeUser", removeUser)


  return router
}
