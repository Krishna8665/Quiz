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
import Teams from "./pages/admin/Team";
import Rounds from "./pages/admin/Rounds";
import Create from "./pages/admin/Create";
import ManageQuestions from "./pages/admin/ManageQuestions";
import ManageQuizMasters from "./pages/admin/ManageQuizMasters";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AuthForm />} />
      <Route path="/team" element={<TeamManager />} />
      <Route path="/quiz" element={<QuizApp />} />
      <Route path="/team-list" element={<TeamGrid />} />
      <Route path="/category" element={<RoundGrid />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard nested routes */}
        <Route path="dashboard" element={<Dashboard />}>
          <Route path="manage-questions" element={<ManageQuestions />} />
          <Route path="manage-quizmasters" element={<ManageQuizMasters />} />
        </Route>

        <Route path="teams" element={<Teams />} />
        <Route path="questions" element={<Questions />} />
        <Route path="rounds" element={<Rounds />} />
        <Route path="create" element={<Create />} />
      </Route>
    </Routes>
  );
}

export default App;
