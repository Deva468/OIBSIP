import ApiError from "../utils/ApiError.js";

const validateRequest = (validator) => {
  return (req, res, next) => {
    try {
      const validationMessage =
        validator(req.body);

      if (validationMessage) {
        throw new ApiError(
          400,
          validationMessage
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;