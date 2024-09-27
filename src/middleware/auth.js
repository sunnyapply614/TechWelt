const verifyToken = (req, res, next) => {
  const jwt = require("jsonwebtoken")
  const token = req.body.token || req.query.token || req.headers["x-access-token"]
  const { TOKEN_SECRET } = process.env
  
  if (!token) {
    return res.status(403).send("A token is required for authentication")
  }

  return next()
}

module.exports = verifyToken
