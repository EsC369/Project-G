const config = require("config");
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  // check for token:
  if(!token) 
    return res.status(401).json({msg: "Authorization Denied"})
  try {
    // Verify token:
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // Add user from payload:
    req.user = decoded;
    next();
    
  } catch(err) {
    res.status(400).json({ msg: "Token is not valid"});
  }
}

module.exports = auth;