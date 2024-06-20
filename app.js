const ConnectDatabase = require('./config/database');
const config = require('./config');
require('dotenv').config();
// const setupCronJobMap = require('./src/services/cronManager');
const path = require('path');

module.exports = async () => {
  const authMiddleware = require("./src/middleware/auth")
  const express = require("express")
  const cors = require("cors")
  const helmet = require("helmet")
  const morgan = require("morgan")
  const app = express()
  const router = express.Router()
  
  app.use(helmet())
  app.use(cors())
  app.use(morgan("dev"))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  ConnectDatabase(config.mongoURI)
  // setupCronJobMap()

  app.use('/backend/uploads/avatars', express.static(path.join(__dirname, '/uploads/avatars')));

  const auth = require("./src/routes/auth")(router)
  app.use("/backend/auth", auth)

  const privateRoutes = require('./src/routes')(router)
  app.use("/backend/api", authMiddleware, privateRoutes)

  app.get("/backend/ping", async (req, res) => {
    res.send("pong")
  })

  return app
}
