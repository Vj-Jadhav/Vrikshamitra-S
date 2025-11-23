import React, { useEffect, useState } from "react";
import { API } from "../utils/api";

export default function LibraryContent() {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await API.get("/content");
        setContents(res.data);
      } catch (error) {
        console.error("Error fetching library:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📚 Study Materials Library
      </h2>

      {contents.length === 0 ? (
        <p className="text-gray-500 text-lg">No study materials uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {contents.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-green-50"
            >
              <h3 className="font-semibold text-xl text-gray-800 mb-2 hover:text-green-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm mb-2 line-clamp-3">
                {item.description}
              </p>
              <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide">
                Type: {item.category}
              </p>
              <a
                href={`http://localhost:5000${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors"
              >
                View / Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
