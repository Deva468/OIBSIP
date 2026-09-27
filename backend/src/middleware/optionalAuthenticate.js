import jwt from "jsonwebtoken";

import env from "../config/env.js";

/*
-----------------------------------------------------------------------
optionalAuthenticate
-----------------------------------------------------------------------
Unlike `authenticate`, this middleware never blocks the request.
If a valid Bearer token is present, `req.user` is populated exactly
like the normal authenticate middleware so activity logging and
personalised responses can use it. If the token is missing, malformed
or expired, the request simply continues with `req.user` left
undefined so guests can still access the route.
-----------------------------------------------------------------------
*/

const optionalAuthenticate = (req, res, next) => {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return next();
    }

    const token =
      authorization.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    req.user = decoded;

    return next();
  } catch (error) {
    // Invalid/expired token on an optional route should not block
    // the request - just treat the caller as a guest.
    return next();
  }
};

export default optionalAuthenticate;
