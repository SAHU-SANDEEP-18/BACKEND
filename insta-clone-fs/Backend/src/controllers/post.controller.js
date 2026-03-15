const ImageKit = require("@imagekit/nodejs");
const postModel = require("../models/post.model");
const jwt = require("jsonwebtoken");
const likeModel = require("../models/like.model");

// const imageKit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy",
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
// });

async function createPostController(req, res) {
  // const file = await imageKit.upload({
  //   file: req.file.buffer,
  //   fileName: "Test",
  //   folder: "insta-clone",
  // });

  const post = await postModel.create({
    caption: req.body.caption,
    imgUrl: "dummy_url", // file.url,
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

async function likePostController(req, res) {
  const username = req.user.username;
  const postId = req.params.postId;

  const post = await postModel.findById(postId);

  if (!post) {
    return res.status(404).json({
      message: "Post not found.",
    });
  }

  const like = await likeModel.create({
    post: postId,
    user: username,
  });

  res.status(200).json({
    message: "Post liked successfully.",
    like,
  });
}

async function unlikePostController(req,res){
  const postId = req.params.postId
  const username = req.user.username

  const isLiked = await likeModel.findOne({
    post: postId,
    user:username
  })

  if(!isLiked){
    return res.status(400).json({
      message:"Post didn't like"
    })
  }

  await likeModel.findOneAndDelete({_id:isLiked._id})
  return res.status(200).json({
    message:"post unliked successfully"
  })
}

async function getFeedController(req, res) {
  const user = req.user;

  const posts = await Promise.all(
    (await postModel.find().populate("user").lean()).map(async (post) => {
      const isLiked = await likeModel.findOne({
        user: user.username,
        post: post._id,
      });
      post.isLiked = isLiked;

      return post;
    }),
  );

  res.status(200).json({
    message: "posts fetched successfully",
    posts,
  });
}

module.exports = {
  createPostController,
  getPostController,
  getPostDetails,
  likePostController,
  getFeedController,
  unlikePostController
};
