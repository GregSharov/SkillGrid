// import { useEffect, useState } from "react";
import "./App.css";
import AddNewUser from "./addNewUser.js";
import SignIn from ".//signIn.js";
import ShowData from "./showData.js";

function App() {
  return (
    <div>
      <AddNewUser />
      <SignIn />
      <ShowData />
    </div>
  );
}

export default App;
