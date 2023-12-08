import "./App.css";
import React from "react";
import { createContext, useReducer } from "react";
import { report, reportReducer } from "./reducer/UseReducer";
import MainButton from "./components/Button/Button";
import Header from "./components/Header/Header";
import MiddleText from "./components/Middle-Text/MiddleText";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import QuestionScreen from "./views/QuestionScreen";

export const UserContext = createContext();

function App() {
  const [state, dispatch] = useReducer(reportReducer, report);
  return (
    <Router>
      <UserContext.Provider value={{ state, dispatch }}>
        <Routes>
          <Route path="/" element={<QuestionScreen />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
