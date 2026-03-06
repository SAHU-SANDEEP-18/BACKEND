const { ImageKit } = require("@imagekit/nodejs/client.js");
const postModel = require("../models/post.model");
const { toFile } = require("@imagekit/nodejs");
const jwt = require("jsonwebtoken");
const likeModel = require("../models/like.model")

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function createPostController(req, res) {


  const file = await imageKit.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "Test",
    folder: "insta-clone",
  });

  const post = await postModel.create({
    caption: req.body.caption,
    imgUrl: file.url,
    user: req.user.id,
  });

  res.status(201).json({
    message: "Post Created Successfully",
    post,
  });
}

async function getPostController(req, res) {

  const userId = req.user.id;

  const posts = await postModel.find({
    user: userId,
  });

  res.status(200).json({
    message: "Posts fetched successfully",
    posts,
  });
}

async function getPostDetails(req, res) {

  const userId = req.user.id;
  const postId = req.params.postId;

  const post = await postModel.findById(postId);

  if (!post) {
    res.status(404).json({
      message: "post not found",
    });
  }

  const inValidUser = post.user.toString() === userId;

  if (!inValidUser) {
    res.status(403).json({
      message: "Unauthorized user",
    });
  }

  return res.status(200).json({
    message: "Post details fetched successfully",
    post,
  });
}

async function likePostController(req,res) {
  const username = req.user.username
  const postId = req.params.postId

  const post = await postModel.findById(postId) 

  if(!post){
    return res.status(404).json({
      message:"Post not found."
    })
  }

  const like = await likeModel.create({
    post:postId,
    user:username
  })

  res.status(200).json({
    message:"Post liked successfully.",
    like
  })
}

async function getFeedController(req,res) {
  const posts = await postModel.find().populate("user")

  res.status(200).json({
    message:"posts fetched successfully",
    posts
  })
}

module.exports = {
  createPostController,
  getPostController,
  getPostDetails,
  likePostController,
  getFeedController
};
