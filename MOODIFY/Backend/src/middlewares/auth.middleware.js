const blacklistModel = require("../models/blacklist.modal");
const userModel = require("../models/user.model");
const redis = require("../config/cache")
const jwt = require("jsonwebtoken");

async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not provided",
    });
  }

  const isTokenBlacklinsted = await redis.get(token)

  if(isTokenBlacklinsted){
    return res.status(401).json({
      message:"invalid token"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
        message:"Invalid token"
    })
  }
}


module.exports = {authUser}