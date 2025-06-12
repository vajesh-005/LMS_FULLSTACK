const userModel = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");

exports.loginUser = async (request, h) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(1).required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  });

  const { error, value } = schema.validate(request.payload);
  if (error) {
    return h.response({ message: error.details[0].message }).code(400);
  }

  const { email, password } = value;

  try {
    const userResult = await userModel.getUserWithEmail(email);
    const user = userResult;
    console.log(user);
    if (!user) return h.response({ message: "User not found" }).code(404);

    const compare = await bcrypt.compare(password.trim(), user.password);
    if (!compare)
      return h.response({ message: "Password is incorrect!" }).code(401);

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return h.response({ token, role: user.role, user_id: user.id }).code(200);
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    return h.response({ message: "Internal server error" }).code(500);
  }
};

exports.addUser = async (request, h) => {
  const {
    name,
    email,
    password,
    emp_type_id,
    manager_id,
    contact_number,
  } = request.payload;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(
      name,
      email,
      hashed,
      emp_type_id,
      manager_id,
      contact_number
    );
    return h
      .response({ message: "User successfully created ", user })
      .code(201);
  } catch (error) {
    console.log("error occurred in authcontroller ", error.message);
    return h.response("Internal server error").code(500);
  }
};
