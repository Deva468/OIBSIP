import jwt from "jsonwebtoken";
import env from "../config/env.js";

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      // Pinning the signing algorithm (rather than letting the
      // library pick a default) closes the classic JWT "algorithm
      // confusion" hole, where a token crafted with alg:"none" or a
      // different algorithm than the server expects could otherwise
      // slip past verification.
      algorithm: "HS256",
    }
  );
};

export default generateToken;