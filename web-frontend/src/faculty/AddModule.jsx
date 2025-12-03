import React, { useState } from "react";
import axios from "axios";

const AddModule = () => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    subtitle: "",
    category: "",
    duration: "",
    points: "",
    totalLessons: "",
    difficulty: "",
    color: "",
    youtubeId: "",
    description: "",
    imageUrl: "",
    quiz: [],
  });

  const [quizItem, setQuizItem] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle non-quiz field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle quiz options
  const handleQuizChange = (e, index) => {
    const updatedOptions = [...quizItem.options];
    updatedOptions[index] = e.target.value;

    setQuizItem({
      ...quizItem,
      options: updatedOptions,
    });
  };

  // Add quiz item into array
  const addQuiz = () => {
    if (!quizItem.question.trim()) {
      alert("Quiz question cannot be empty");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      quiz: [...prev.quiz, quizItem],
    }));

    // Reset quiz item
    setQuizItem({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    });
  };

  // Submit module
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert "" to null (IMPORTANT FIX)
      const cleanedPayload = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === "" ? null : value,
        ])
      );

      await axios.post("http://localhost:5000/api/modules/add", cleanedPayload);

      setMessage("✅ Module added successfully!");

      // Reset form
      setFormData({
        id: "",
        title: "",
        subtitle: "",
        category: "",
        duration: "",
        points: "",
        totalLessons: "",
        difficulty: "",
        color: "",
        youtubeId: "",
        description: "",
        imageUrl: "",
        quiz: [],
      });
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding module");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Learning Module</h2>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="id"
          value={formData.id}
          onChange={handleChange}
          placeholder="Module ID"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleChange}
          placeholder="Subtitle"
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="Duration (e.g. 15 min)"
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          placeholder="Points"
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="totalLessons"
          value={formData.totalLessons}
          onChange={handleChange}
          placeholder="Total Lessons"
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          placeholder="Difficulty (Easy / Medium / Hard)"
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="Theme Color (e.g. #34eb5b)"
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="youtubeId"
          value={formData.youtubeId}
          onChange={handleChange}
          placeholder="YouTube Video ID"
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full p-2 border rounded"
        />

        {/* Quiz Section */}
        <div className="p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Add Quiz Question</h3>

          <input
            type="text"
            value={quizItem.question}
            onChange={(e) =>
              setQuizItem({ ...quizItem, question: e.target.value })
            }
            placeholder="Question"
            className="w-full p-2 border rounded mb-2"
          />

          {quizItem.options.map((opt, index) => (
            <input
              key={index}
              type="text"
              value={opt}
              onChange={(e) => handleQuizChange(e, index)}
              placeholder={`Option ${index + 1}`}
              className="w-full p-2 border rounded mb-2"
            />
          ))}

          <input
            type="number"
            value={quizItem.correctAnswer}
            onChange={(e) =>
              setQuizItem({
                ...quizItem,
                correctAnswer: Number(e.target.value),
              })
            }
            placeholder="Correct Answer Index (0-3)"
            className="w-full p-2 border rounded mb-2"
          />

          <textarea
            value={quizItem.explanation}
            onChange={(e) =>
              setQuizItem({ ...quizItem, explanation: e.target.value })
            }
            placeholder="Explanation (optional)"
            className="w-full p-2 border rounded mb-2"
          />

          <button
            type="button"
            onClick={addQuiz}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Add Quiz
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          {loading ? "Adding..." : "Add Module"}
        </button>
      </form>
    </div>
  );
};

export default AddModule;
