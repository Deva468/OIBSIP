import jwt from "jsonwebtoken";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// SECURITY FIX: previously this middleware did `req.user = decoded` and
// stopped there — meaning every request trusted whatever role was baked
// into the JWT at the moment of login. If an admin later changed a user's
// role in MongoDB (promote/demote), that change had NO EFFECT until the
// affected user logged out and back in, because the old token still carried
// the old role and nothing re-checked the database.
//
// This is also why the Navbar/API-permission mismatch can happen: a page
// might briefly show admin links (based on a fresh /auth/me DB lookup)
// while `authorize('admin')` on other routes still rejects the same user
// (because it was reading the role frozen inside the old token).
//
// Fix: verify the token as before, but then always re-fetch the user's
// CURRENT record from MongoDB and attach that role — never the token's.
const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Authentication token missing"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      // Only ever accept tokens signed with the exact algorithm our own
      // server uses — without this allowlist, jwt.verify() will trust
      // whatever algorithm the token itself claims to use, which is the
      // root cause of the well-known JWT "algorithm confusion" vulnerability.
      algorithms: ["HS256"],
    });
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }

  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(new ApiError(401, "Account no longer exists"));
  }

  // Keep the same shape (`userId`, `role`) the rest of the codebase already
  // expects on req.user — just backed by a live DB read instead of a
  // possibly-stale token payload.
  req.user = {
    userId: currentUser._id.toString(),
    role: currentUser.role,
    email: currentUser.email,
    name: currentUser.name,
  };

  next();
});

export default authenticate;
