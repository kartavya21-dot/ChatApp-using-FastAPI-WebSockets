import React, { useState } from "react";
import { login, register } from "../api/auth";
import { MessageCircle, Loader2 } from 'lucide-react'; // Added Loader2 for the spinner

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const registerUser = async (e) => {
    e.preventDefault();
    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      return alert("Please fill the details");
    }
    
    setIsLoading(true);
    try {
      await register(name, email, password);
      setIsUser(true);
      alert("Registration successful! Please login.");
    } catch (e) {
      console.error("Error: ", e);
      alert(e?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      return alert("Please fill the details");
    }

    setIsLoading(true);
    try {
      const response = await login(email, password);
      localStorage.setItem("user", response.user);
      window.location.reload();
    } catch (e) {
      console.error("Error: ", e);
      alert(e?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isUser ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {isUser ? "Sign in to continue chatting" : "Join our chat community"}
        </p>

        <form onSubmit={isUser ? loginUser : registerUser} className="space-y-4">
          {!isUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                value={name}
                required
                disabled={isLoading}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              required
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              required
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isUser ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              isUser ? "Login" : "Register"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isUser ? "Don't have an account? " : "Already have an account? "}
            <button
              disabled={isLoading}
              className="text-indigo-600 font-semibold cursor-pointer hover:text-indigo-700 disabled:opacity-50"
              onClick={() => setIsUser(!isUser)}
            >
              {isUser ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;