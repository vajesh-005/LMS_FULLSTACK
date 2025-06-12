import {jwtDecode} from "jwt-decode";

export const Token = () => {
  const token = localStorage.getItem("token");
  try {
    const decode = token ? jwtDecode(token) : null;
    console.log(decode)
    return { decode, token };
  } catch (err) {
    console.log("Invalid token:", err);
    return { decode: null, token: null };
  }
};
    