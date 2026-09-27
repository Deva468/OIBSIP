import mongoose from "mongoose";

const addressSchema =
  new mongoose.Schema(
    {
      label: {
        type: String,
        trim: true,
        default: "Home",
      },

      fullName: {
        type: String,
        trim: true,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },

      addressLine: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },

      isDefault: {
        type: Boolean,
        default: false,
      },
    },
    {
      _id: true,
    }
  );

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          "Name is required",
        ],
        trim: true,
        minlength: 2,
        maxlength: 50,
      },

      email: {
        type: String,
        required: [
          true,
          "Email is required",
        ],
        unique: true,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
        default: "",
        validate: {
          validator: (
            value
          ) =>
            value === "" ||
            /^\d{10}$/.test(
              value
            ),
          message:
            "Phone number must contain exactly 10 digits.",
        },
      },

      password: {
        type: String,
        required: [
          true,
          "Password is required",
        ],
        minlength: 8,
        select: false,
      },

      role: {
        type: String,
        enum: [
          "user",
          "admin",
        ],
        default: "user",
      },

      isEmailVerified: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      preferences: {
        orderNotifications: {
          type: Boolean,
          default: true,
        },

        offersNotifications: {
          type: Boolean,
          default: true,
        },

        emailNotifications: {
          type: Boolean,
          default: true,
        },
      },

      privacy: {
        profileVisible: {
          type: Boolean,
          default: true,
        },

        analyticsEnabled: {
          type: Boolean,
          default: true,
        },
      },

      addresses: {
        type: [
          addressSchema,
        ],
        default: [],
      },

      favorites: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PizzaTemplate",
          },
        ],
        default: [],
      },

      emailVerificationToken: {
        type: String,
        default: null,
      },

      emailVerificationExpires: {
        type: Date,
        default: null,
      },

      passwordResetToken: {
        type: String,
        default: null,
      },

      passwordResetExpires: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const User =
  mongoose.model(
    "User",
    userSchema
  );

export default User;