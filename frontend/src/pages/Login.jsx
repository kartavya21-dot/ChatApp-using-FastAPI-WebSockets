import React, { useEffect, useState } from "react";
import { login, register } from "../api/auth";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUser, setIsUser] = useState(false);

  const registerUser = async (e) => {
    if(name.trim() === "" || email.trim() === "" || password.trim() === "") {
        alert("Please fill the details")
    }
    e.preventDefault();
    try {
        await register(name, email, password);
        setIsUser(true);
    } catch (e) {
        console.error("Error: ", e);
    }
};

const loginUser = async (e) => {
    if(email.trim() === "" || password.trim() === "") {
        alert("Please fill the details")
    }
    e.preventDefault();
    try {
        await login(email, password);
        window.location.reload();
    } catch (e) {
      console.error("Error: ", e);
    }
  };


  return isUser ? (
    <div>
      <input
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your Email..."
        />
      <input
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your Password..."
        />
      <button type="submit" onClick={loginUser}>
        Login
      </button>
      <p className="cursor-pointer" onClick={() => setIsUser(false)}>New user?</p>
    </div>
  ) : (
      <div>
      <input
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name..."
        />
      <input
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your Email..."
        />
      <input
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your Password..."
      />
      <button type="submit" onClick={registerUser}>
        Register
      </button>
      <p className="cursor-pointer" onClick={() => setIsUser(true)}>Already a user?</p>
    </div>
  );
};

export default Login;
