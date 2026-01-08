import React, { useContext, useEffect, useState } from "react";
import { login, register } from "../api/auth";
import { MessageCircle, Send, LogOut, Users } from 'lucide-react';


const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUser, setIsUser] = useState(false);

  const registerUser = async (e) => {
    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      alert("Please fill the details");
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
    if (email.trim() === "" || password.trim() === "") {
      alert("Please fill the details");
    }
    e.preventDefault();
    try {
      const response = await login(email, password);
      localStorage.setItem("user", response.user);
      // window.location.reload();
    } catch (e) {
      console.error("Error: ", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <MessageCircle className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isUser ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {isUser ? "Sign in to continue chatting" : "Join our chat community"}
        </p>

        <div className="space-y-4">
          {!isUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              onKeyPress={(e) => e.key === "Enter" && registerUser(e)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="button"
            onClick={loginUser}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            {isUser ? "Login" : "Register"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isUser ? "Don't have an account? " : "Already have an account? "}
            <span
              className="text-indigo-600 font-semibold cursor-pointer hover:text-indigo-700"
              onClick={() => setIsUser(!isUser)}
            >
              {isUser ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
