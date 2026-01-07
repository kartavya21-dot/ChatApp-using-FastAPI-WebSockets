import { useEffect, useRef, useState } from "react";
import "./App.css";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { logout } from "./api/auth";

const be = "localhost:8000";

function App() {
  const logoutUser = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (e) {
      alert("Failed to logout");
    }
  };

  if (localStorage.getItem("accessToken") === null) {
    return <Login />;
  }

  return (
    <>
      <button
        type="button"
        className="p-5 text-lg border-red-500 border-solid border-2 rounded-md cursor-pointer"
        onClick={logoutUser}
      >
        Logout
      </button>
      <Chat />
    </>
  );
}

export default App;
