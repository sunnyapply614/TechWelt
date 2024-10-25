module.exports = (router) => {
  const users = require("../controllers/users")
  const {
    getUsers, addUser, updateUser, removeUser, activateUser, getUser, getGoogleAPIKey,changeEmail,updateAvatar
  } = users()



  return router
}
