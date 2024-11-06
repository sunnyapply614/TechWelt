module.exports = (router) => {
    const company = require("../controllers/companies")
    const {
       addCompany
    } = company()
    router.post("/addCompany", addCompany)

    return router
  }
