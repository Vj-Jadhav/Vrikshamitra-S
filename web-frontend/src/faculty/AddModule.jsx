import React, { useState } from "react";
import axios from "axios";

const AddModule = () => {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    icon: "",
    description: "",
    videoUrl: "",
    ecoPoint: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const detectModuleType = () => {
    if (formData.videoUrl) return "Video";
    if (formData.description && formData.description.length > 150) return "Reading";
    return "Quiz"; // fallback type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const moduleType = detectModuleType();
      const payload = { ...formData, type: moduleType };

      await axios.post("http://localhost:5000/api/modules/add", payload);
      setMessage(`✅ ${moduleType} module added successfully!`);

      setFormData({
        title: "",
        duration: "",
        icon: "",
        description: "",
        videoUrl: "",
        ecoPoint: 0,
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
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          placeholder="Duration (e.g., 15 min)"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          placeholder="Icon (emoji or name)"
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
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          placeholder="Video URL"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="ecoPoint"
          value={formData.ecoPoint}
          onChange={handleChange}
          placeholder="Eco Points"
          className="w-full p-2 border rounded"
        />

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
