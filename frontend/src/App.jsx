import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { logout } from "./api/auth";

function App() {
  const logoutUser = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (e) {
      alert("Failed to logout");
    }
  };

  if(localStorage.getItem("accessToken") === null){
    return <Login/>;
  }

  return (
      <>
        <Chat />
      </>
  );
}

export default App;
