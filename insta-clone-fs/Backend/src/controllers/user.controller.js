const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");

async function followUserController(req, res) {
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

    if(followerUsername === followeeUsername){
        return res.status(400).json({
            message: "You cannot follow yourself",
        });
    }

    const isFolloweeExists = await userModel.findOne({ username: followeeUsername });

    if (!isFolloweeExists) {
        return res.status(404).json({
            message: "The user you are trying to follow does not exist",
        });
    }

    const alreadyFollowing = await followModel.findOne({
        follower: followerUsername,
        followee: followeeUsername,
    });

    if (alreadyFollowing) {
        return res.status(409).json({
            message: `You are already following ${followeeUsername}`,
        });
    }

  const followRecord = await followModel.create({
    follower: followerUsername,
    followee: followeeUsername,
  });

  res
    .status(201)
    .json({ message: `You are now following ${followeeUsername}`, follow: followRecord });
}

async function unFollowUserController(req,res){
    const followerUsername = req.user.username
    const followeeUsername = req.params.username

    const isUserFollowing = await followModel.findOne({
        follower:followerUsername,
        followee:followeeUsername
    })

    if(!isUserFollowing){
        return res.status(200).json({
            message:`You are not following ${followeeUsername}`
        })
    }

    await followModel.findByIdAndDelete(isUserFollowing._id)

    res.status(200).json({
        message:`You have unFollowed ${followeeUsername}`
    })
}

// return the follow status between the authenticated user and another user
async function getFollowStatus(req, res) {
    const followerUsername = req.user.username;
    const followeeUsername = req.params.username;

    const record = await followModel.findOne({
        follower: followerUsername,
        followee: followeeUsername,
    });

    if (!record) {
        // no relationship at all
        return res.status(200).json({ status: "none" });
    }

    res.status(200).json({ status: record.status, follow: record });
}

// list pending incoming follow requests for the authenticated user
async function getIncomingFollowRequests(req, res) {
    const username = req.user.username;

    const requests = await followModel.find({
        followee: username,
        status: "pending",
    });

    res.status(200).json({ requests });
}

// allow a user to accept or reject a pending follow request
async function respondFollowRequest(req, res) {
    const username = req.user.username; // the followee who is responding
    const { status } = req.body; // expected 'accepted' or 'rejected'
    const followerUsername = req.params.username; // who requested

    if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const request = await followModel.findOne({
        follower: followerUsername,
        followee: username,
        status: "pending",
    });

    if (!request) {
        return res.status(404).json({ message: "No pending follow request found" });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ message: `Request ${status}`, follow: request });
}

module.exports = {
  followUserController,
  unFollowUserController,
  getFollowStatus,
  getIncomingFollowRequests,
  respondFollowRequest,
};
