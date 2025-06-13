const userModel = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");

exports.loginUser = async (request, h) => {
  const { email, password } = request.payload;

  try {
    const user = await userModel.getUserWithEmail(email);
    if (!user) return h.response({ message: "User not found" }).code(404);

    const isValid = await bcrypt.compare(password.trim(), user.password);
    if (!isValid)
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
