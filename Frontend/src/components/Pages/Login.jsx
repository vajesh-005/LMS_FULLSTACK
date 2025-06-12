import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/login.css";
import { useToaster, Message, Button } from "rsuite";
import Background from "../../assets/Background_edited.jpg";
import { jwtDecode } from "jwt-decode";
function Login() {
  const navigate = useNavigate();

  const toaster = useToaster();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const isFormValid = () => {
    return formData.email.trim() !== "" && formData.password.trim() !== "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!isFormValid()) {
      toaster.push(
        <Message type="warning" closable duration={3000}>
          Please fill out all fields before submitting.
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch(`http://localhost:1110/login`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toaster.push(
          <Message type="success" closable duration={3000}>
            Successfully logged in.
          </Message>,
          { placement: "topEnd" }
        );
  
        const token = data.token;
        localStorage.setItem("token", token);
  
        const decode = jwtDecode(token);
        const { role } = decode;
  
        setTimeout(() => {
          if (role === "ADMIN") {
            navigate("/admin_dashboard");
          }  else {
            navigate("/dashboard");
          }
        }, 3000);
  
        setFormData({ email: "", password: "" });
  
      } else {
        toaster.push(
          <Message type="error" closable duration={3000}>
            {data.message || "Failed to login."}
          </Message>,
          { placement: "topEnd" }
        );
      }
  
    } catch (error) {
      toaster.push(
        <Message type="error" closable duration={3000}>
          {error.message}
        </Message>,
        { placement: "topEnd" }
      );
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }
  };
  
  return (
    <div
      className="login-form"
      style={{ backgroundImage: `url(${Background})` }}
    >
      <form method="POST" onSubmit={handleSubmit} className="login-form-div">
        <p className="login-title">LOGIN</p>
        <div className="email">
          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email..."
          />
        </div>
        <div className="password">
          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password..."
          />
        </div>
        <div className="button-div">
          <button disabled={isSubmitting} className="button">
            {isSubmitting ? "Logging..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
