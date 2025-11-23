import React, { useState, useEffect } from "react";
import { API } from "../utils/api";

export default function UploadLibrary() {
  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PDF",
    uploadBy: "67234567890abcdef1234567", // Replace with real faculty user ID
  });
  const [file, setFile] = useState(null);

  const fetchContents = async () => {
    try {
      const res = await API.get("/content");
      setContents(res.data);
    } catch (err) {
      console.error("Error fetching content:", err);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const data = new FormData();
    data.append("file", file);
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));

    try {
      await API.post("/content", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setFormData({ title: "", description: "", category: "PDF", uploadBy: formData.uploadBy });
      setFile(null);
      fetchContents();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Error uploading file");
    }
  };

  // ✅ New delete function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await API.delete(`/content/${id}`);
      alert("File deleted successfully!");
      fetchContents();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting file");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📚 Upload Study Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded-lg"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded-lg"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <select
          className="w-full p-2 border rounded-lg"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option>PDF</option>
          <option>Word</option>
          <option>Image</option>
          <option>Text</option>
          <option>Other</option>
        </select>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 border rounded-lg"
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">
          Upload
        </button>
      </form>

      <h3 className="text-xl font-semibold mt-6">📂 Uploaded Files</h3>
      <ul className="mt-3 space-y-2">
        {contents.map((item) => (
          <li key={item._id} className="border p-2 rounded-lg flex justify-between items-center">
            <span>{item.title} ({item.category})</span>
            <div className="flex gap-4">
              <a
                href={`http://localhost:5000${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View
              </a>
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
