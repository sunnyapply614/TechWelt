
module.exports = (router) => {
  const alerts = require("../controllers/alerts")
  const {
    showAlertList,
  } = alerts()

  router.post("/list", showAlertList)    //get Alert list normal
  
  return router
}