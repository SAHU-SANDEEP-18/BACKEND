const express = require("express")
const userRoutes = express.Router()
const userController = require("../controllers/user.controller")
const { identifyUser } = require("../middlewares/auth.middleware")

userRoutes.post("/follow/:username", identifyUser, userController.followUserController)
userRoutes.post("/unfollow/:username", identifyUser, userController.unFollowUserController)

// check relationship status between current user and another
userRoutes.get("/follow/status/:username", identifyUser, userController.getFollowStatus)

// list pending requests for current user
userRoutes.get("/follow/requests", identifyUser, userController.getIncomingFollowRequests)

// respond to a follow request (accept/reject)
userRoutes.post("/follow/:username/respond", identifyUser, userController.respondFollowRequest)


module.exports = userRoutes