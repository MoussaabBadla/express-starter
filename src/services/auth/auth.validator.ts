import { body } from "express-validator";

export const loginValidators = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const registerValidators = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character"),
  body("firstName")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .trim()
    .escape(),
  body("lastName")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .trim()
    .escape(),
];
