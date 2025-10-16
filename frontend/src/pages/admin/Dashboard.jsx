import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, HelpCircle } from "lucide-react"; // icons

export default function Dashboard() {
  const navigate = useNavigate();

  const bentoItems = [
    {
      title: "Manage Quiz Masters",
      description:
        "Add, edit, or remove quiz masters who can create and manage quizzes.",
      icon: <Users size={40} className="text-blue-500" />,
      color: "bg-black-100 text-black-700 dark:bg-blue-900/30",
      onClick: () => navigate("/admin/manage-quiz-masters"),
    },
    {
      title: "Manage Questions",
      description: "Create, update, and organize questions for quizzes.",
      icon: <HelpCircle size={40} className="text-green-500" />,
      color: "bg-green-100 dark:bg-green-900/30",
      onClick: () => navigate("/admin/manage-questions"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black-200 dark:bg-gray-900 px-6 py-12">
      <h1 className="text-3xl font-bold mb-10 text-gray-900 dark:text-black text-center">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl w-full col-black">
        {bentoItems.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className={`cursor-pointer ${item.color} p-10 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center text-center`}
          >
            <div className="mb-4">{item.icon}</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
              {item.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-xs">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
