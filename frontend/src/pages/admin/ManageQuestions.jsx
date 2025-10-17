import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({
    text: "",
    category: "",
    options: [],
    correctAnswerId: "",
    correctAnswerText: "",
  });

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/question/get-questions",
        { withCredentials: true }
      );
      setQuestions(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch questions");
    }
  };

  // Start editing
  const handleEdit = (q) => {
    setEditingId(q._id);

    // Find correct option text by _id
    const correctOption = q.options.find(
      (opt) => opt._id.toString() === q.correctAnswer
    );

    setEditedQuestion({
      text: q.text,
      category: q.category,
      options: q.options.map((opt) => ({ ...opt })), // clone options
      correctAnswerId: q.correctAnswer,
      correctAnswerText: correctOption?.text || "",
    });
  };

  // Update option text while editing
  const handleOptionChange = (index, value) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index].text = value;
    setEditedQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  // Save edited question
  const handleSave = async (id) => {
    try {
      // Find option whose text matches correctAnswerText
      const selectedOption = editedQuestion.options.find(
        (opt) =>
          opt.text.trim().toLowerCase() ===
          editedQuestion.correctAnswerText.trim().toLowerCase()
      );

      const updatedData = {
        text: editedQuestion.text,
        category: editedQuestion.category,
        options: editedQuestion.options,
        correctAnswer:
          selectedOption?._id.toString() || editedQuestion.correctAnswerId,
      };

      await axios.put(
        `http://localhost:3000/api/question/update/${id}`,
        updatedData,
        { withCredentials: true }
      );

      toast.success("✅ Question updated");
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update question");
    }
  };

  // Delete question
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/question/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("🗑️ Question deleted");
      fetchQuestions();
    } catch (err) {
      console.error(err);
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
                <th className="p-3 text-left">Options</th>
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
                  {/* Question */}
                  <td className="p-3">
                    {editingId === q._id ? (
                      <input
                        type="text"
                        value={editedQuestion.text}
                        onChange={(e) =>
                          setEditedQuestion((prev) => ({
                            ...prev,
                            text: e.target.value,
                          }))
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      q.text
                    )}
                  </td>

                  {/* Category */}
                  <td className="p-3">
                    {editingId === q._id ? (
                      <input
                        type="text"
                        value={editedQuestion.category}
                        onChange={(e) =>
                          setEditedQuestion((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      q.category
                    )}
                  </td>

                  {/* Options */}
                  <td className="p-3">
                    {editingId === q._id
                      ? editedQuestion.options.map((opt, idx) => (
                          <input
                            key={opt._id}
                            type="text"
                            value={opt.text}
                            onChange={(e) =>
                              handleOptionChange(idx, e.target.value)
                            }
                            className="border p-1 w-full rounded mb-1"
                          />
                        ))
                      : q.options.map((opt) => (
                          <div key={opt._id}>{opt.text}</div>
                        ))}
                  </td>
                  {/* Correct Answer */}
                  <td className="p-3">
                    {editingId === q._id ? (
                      <input
                        type="text"
                        value={editedQuestion.correctAnswerText}
                        onChange={(e) =>
                          setEditedQuestion((prev) => ({
                            ...prev,
                            correctAnswerText: e.target.value,
                          }))
                        }
                        className="border p-1 w-full rounded"
                      />
                    ) : (
                      q.options.find(
                        (opt) => opt?._id?.toString() === q.correctAnswer
                      )?.text || ""
                    )}
                  </td>

                  {/* Actions */}
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
