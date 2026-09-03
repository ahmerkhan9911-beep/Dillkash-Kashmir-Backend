import { body } from "express-validator";

export const signupValidation = [
  body("full_name")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^(\+?92|0)?\d{10,11}$/).withMessage("Enter a valid Pakistani phone number"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirm_password")
    .notEmpty().withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

export const packageValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Package title is required")
    .isLength({ max: 200 }).withMessage("Title too long"),
  body("short_description")
    .trim()
    .notEmpty().withMessage("Short description is required"),
  body("duration_days")
    .isInt({ min: 1, max: 30 }).withMessage("Duration must be 1-30 days"),
  body("price")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
];

export const destinationValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Destination name is required")
    .isLength({ max: 200 }).withMessage("Name too long"),
  body("cover_image")
    .trim()
    .notEmpty().withMessage("Cover image is required"),
];

