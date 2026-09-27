const sanitize = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .trim();
  };

  const sanitizeObject = (object) => {
    if (!object || typeof object !== "object") {
      return object;
    }

    for (const key of Object.keys(object)) {
      if (typeof object[key] === "string") {
        object[key] = sanitizeValue(object[key]);
      }
    }

    return object;
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  if (req.query) {
    sanitizeObject(req.query);
  }

  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

export default sanitize;