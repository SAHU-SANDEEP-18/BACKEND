import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

export async function register(req, res) {
  const { username, email, password } = req.body;
  const usUserAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (usUserAlreadyExists) {
    return res.status(400).json({
      message: "Username or email already exists",
      success: false,
      err: "user already exists",
    });
  }

  const user = await userModel.create({ username, email, password });

  await sendEmail({
    to: email,
    subject: "Welcome to our app!",
    html: `<h1>Welcome, ${username}!</h1><p>Thank you for registering with our app. We're excited to have you on board!</p>`,
    text: `Welcome, ${username}! Thank you for registering with our app. We're excited to have you on board!`,
  });

  res.status(201).json({
    message: "User registered successfully",
    success: true,
    user,
  });
}
