import { Route, Routes } from "react-router-dom";
import "./App.css";
import QuizApp from "./components/Fetch";
import AuthForm from "./components/Login";
import TeamManager from "./components/Team";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/team" element={<TeamManager />} />
        <Route path="/quiz" element={<QuizApp />} />
      </Routes>
    </>
  );
}

export default App;
