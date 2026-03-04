const express = require("express")
const userRoutes = express.Router()
const userController = require("../controllers/user.controller")
const { identifyUser } = require("../middlewares/auth.middleware")

userRoutes.post("/follow/:username", identifyUser, userController.followUserController)
userRoutes.post("/unfollow/:username", identifyUser, userController.unFollowUserController)


module.exports = userRoutes