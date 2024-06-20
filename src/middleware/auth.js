

const verifyToken = (req, res, next) => {
  const jwt = require("jsonwebtoken")
  const token = req.body.token || req.query.token || req.headers["x-access-token"]
  const { TOKEN_SECRET } = process.env
  
  if (!token) {
    return res.status(403).send("A token is required for authentication")
  }
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET)
    console.log("token decoded:", decoded)
    req.user = decoded
  } catch (err) {
    console.log(err)
    return res.status(401).send("Invalid Token")
  }
  return next()
}

module.exports = verifyToken
