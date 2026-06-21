import jwt from "jsonwebtoken";

export function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "unauthorized",
      success: true,
      err: "no token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      message: "unauthorized",
      success: true,
      err: "Invalid token",
    });
  }
}
