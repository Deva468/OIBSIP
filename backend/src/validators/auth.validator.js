const isValidEmail = (
  email
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "")
      .trim()
      .toLowerCase()
  );
};

const normalizeEmail = (
  email
) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const isValidPhone = (
  phone
) => {
  if (
    phone === undefined ||
    phone === null ||
    phone === ""
  ) {
    return true;
  }

  return /^\d{10}$/.test(
    String(phone)
  );
};

const validateRegister = ({
  name,
  email,
  password,
  phone = "",
}) => {
  if (
    !name ||
    !String(name).trim()
  ) {
    return "Name is required.";
  }

  if (
    String(name)
      .trim()
      .length < 2
  ) {
    return "Name must contain at least 2 characters.";
  }

  if (
    !email ||
    !isValidEmail(email)
  ) {
    return "Enter a valid email address.";
  }

  if (
    !password ||
    String(password).length < 8
  ) {
    return "Password must contain at least 8 characters.";
  }

  if (
    !isValidPhone(phone)
  ) {
    return "Phone number must contain exactly 10 digits.";
  }

  return null;
};

const validateLogin = ({
  email,
  password,
}) => {
  if (
    !email ||
    !isValidEmail(email)
  ) {
    return "Enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  return null;
};

const validateProfileUpdate = ({
  name,
  phone = "",
}) => {
  if (
    name !== undefined &&
    String(name)
      .trim()
      .length < 2
  ) {
    return "Name must contain at least 2 characters.";
  }

  if (
    !isValidPhone(phone)
  ) {
    return "Phone number must contain exactly 10 digits.";
  }

  return null;
};

const validateChangePassword = ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    return "All password fields are required.";
  }

  if (
    String(newPassword).length <
    8
  ) {
    return "New password must contain at least 8 characters.";
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    return "New passwords do not match.";
  }

  return null;
};

const validateAddress = ({
  fullName,
  phone,
  addressLine,
  city,
  state,
  pincode,
}) => {
  if (
    !fullName ||
    !String(fullName).trim()
  ) {
    return "Address full name is required.";
  }

  if (
    !/^\d{10}$/.test(
      String(phone || "")
    )
  ) {
    return "Address phone must contain exactly 10 digits.";
  }

  if (
    !addressLine ||
    !String(addressLine).trim()
  ) {
    return "Address line is required.";
  }

  if (
    !city ||
    !String(city).trim()
  ) {
    return "City is required.";
  }

  if (
    !state ||
    !String(state).trim()
  ) {
    return "State is required.";
  }

  if (
    !/^\d{6}$/.test(
      String(pincode || "")
    )
  ) {
    return "Pincode must contain exactly 6 digits.";
  }

  return null;
};

export {
  isValidEmail,
  normalizeEmail,
  isValidPhone,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateAddress,
};