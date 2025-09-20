import { Route, Routes } from "react-router-dom";
import "./App.css";
import QuizApp from "./components/Fetch";
import AuthForm from "./components/Login";
import TeamManager from "./components/Team";
import TeamGrid from "./components/TeamList";
import RoundGrid from "./components/Category";
import AdminLayout from "./components/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import Questions from "./pages/admin/Questions";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/team" element={<TeamManager />} />
        <Route path="/quiz" element={<QuizApp />} />
        <Route path="/team-list" element={<TeamGrid />} />
        <Route path="/category" element={<RoundGrid />} />
      </Routes>
      <Routes>
        {/* Admin Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />{" "}
          {/* Default page when /admin */}
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="teams" element={<Teams />} /> */}
          <Route path="questions" element={<Questions />} />
          {/* <Route path="rounds" element={<Rounds />} />
          <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
