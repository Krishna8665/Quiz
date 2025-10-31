import { Route, Routes } from "react-router-dom";
import "./App.css";
//import QuizApp from "./components/Fetch";
import AuthForm from "./assets/pages/Login";
import TeamManager from "./assets/pages/Teams";
//import TeamGrid from "./assets/pages/TeamList";
//import RoundGrid from "./components/Category";
import AdminLayout from "./assets/pages/Sidebar";
import Dashboard from "./assets/pages/Dashboard";
import Questions from "./assets/pages/Questions";
import Teams from "./pages/admin/Team";
import Rounds from "./assets/pages/Rounds";
import Create from "./assets/pages/Create";
import ManageQuestions from "./assets/pages/dashboard/ManageQuestions";
import ManageQuizMasters from "./assets/pages/dashboard/ManageQuizMasters";


function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AuthForm />} />
      <Route path="/team" element={<TeamManager />} />
      {/* <Route path="/quiz" element={<QuizApp />} /> */}
      {/* <Route path="/team-list" element={<TeamGrid />} /> */}
      {/* <Route path="/category" element={<RoundGrid />} /> */}

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard nested routes */}
        <Route path="dashboard" element={<Dashboard />}>
          <Route path="manage-questions" element={<ManageQuestions />} />
          <Route path="manage-quizmasters" element={<ManageQuizMasters />} />
        </Route>
          <Route path="teams" element={<Teams/>} />

        <Route path="questions" element={<Questions />} />
        <Route path="rounds" element={<Rounds />} />
        <Route path="create" element={<Create />} />
      </Route>
    </Routes>
  );
}

export default App;
