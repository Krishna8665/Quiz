import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});

  // ✅ Fetch admin's questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/question/my-questions",
        { withCredentials: true }
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to fetch questions");
    }
  };

  // ✅ Start editing
  const handleEdit = (q) => {
    setEditingId(q._id);
    setEditedQuestion({ ...q });
  };

  // ✅ Save edited question
  const handleSave = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/question/update/${id}`,
        editedQuestion,
        { withCredentials: true }
      );
      toast.success("✅ Question updated");
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      console.error("Error updating question:", err);
      toast.error("Failed to update question");
    }
  };

  // ✅ Delete question
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/question/delete/${id}`,
        { withCredentials: true }
      );
      toast.success("🗑️ Question deleted");
      fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Failed to delete question");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <Toaster position="top-center" />
      <h2 className="text-3xl font-bold mb-6 text-center">Manage Questions</h2>

      {questions.length === 0 ? (
        <p className="text-center text-gray-500">No questions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 text-left">Question</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Correct Answer</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr
                  key={q._id}
                  className="border-t border-gray-300 hover:bg-gray-100"
                >
                  <td className="p-3">
                    {editingId === q._id ? (
                      <input
                        type="text"
                        value={editedQuestion.text}
                        onChange={(e) =>
                          setEditedQuestion({
                            ...editedQuestion,
                            text: e.target.value,
                          })
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      q.text
                    )}
                  </td>

                  <td className="p-3">
                    {editingId === q._id ? (
                      <input
                        type="text"
                        value={editedQuestion.category}
                        onChange={(e) =>
                          setEditedQuestion({
                            ...editedQuestion,
                            category: e.target.value,
                          })
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      q.category
                    )}
                  </td>

                  <td className="p-3">
                    {editingId === q._id ? (
                      <input
                        type="text"
                        value={editedQuestion.correctAnswer}
                        onChange={(e) =>
                          setEditedQuestion({
                            ...editedQuestion,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      q.correctAnswer
                    )}
                  </td>

                  <td className="p-3 text-center space-x-2">
                    {editingId === q._id ? (
                      <>
                        <button
                          onClick={() => handleSave(q._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(q)}
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
