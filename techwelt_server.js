; (async () => {
  // const { PrismaClient } = require("@prisma/client")
  // const client = new PrismaClient()

  const makeApp = require("./app")
  const app = await makeApp()
  app.listen(process.env.PORT, () => {
    console.log("Techwelt server runs at Port:", process.env.PORT)
  })
})()
