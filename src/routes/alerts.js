module.exports = (router) => {
  const alerts = require("../controllers/alerts")
  const {
    showAlertList,
  } = alerts()


  
  return router
}
