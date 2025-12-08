import React, { useState, useEffect } from "react";
import axios from "axios";
// Remove this line: import "./AddModule.css";

const AddModule = () => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    subtitle: "",
    category: "climate",
    duration: "10 min",
    points: "10",
    totalLessons: "1",
    difficulty: "Beginner",
    color: "#34eb5b",
    youtubeId: "",
    description: "",
    imageUrl: "",
    tags: "",
    isActive: true,
    quiz: [],
  });

  const [quizItem, setQuizItem] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    points: 1
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [categories] = useState([
    "climate",
    "biodiversity", 
    "pollution",
    "conservation",
    "sustainability",
    "water",
    "forest",
    "wildlife"
  ]);
  const [difficultyLevels] = useState(["Beginner", "Intermediate", "Advanced"]);
  const [existingIds, setExistingIds] = useState([]);

  // Inline styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      maxWidth: "1200px",
      margin: "0 auto",
      background: "white",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#333",
      textAlign: "center",
      marginBottom: "30px",
      paddingBottom: "20px",
      borderBottom: "2px solid #f0f0f0",
    },
    message: {
      success: {
        backgroundColor: "#d4edda",
        color: "#155724",
        border: "1px solid #c3e6cb",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
        fontWeight: "500",
        textAlign: "center",
      },
      error: {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
        fontWeight: "500",
        textAlign: "center",
      },
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "30px",
    },
    formSection: {
      background: "#f8f9fa",
      borderRadius: "15px",
      padding: "25px",
      border: "1px solid #e9ecef",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    optionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "15px",
      marginBottom: "20px",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontWeight: "600",
      color: "#555",
      fontSize: "0.9rem",
    },
    input: {
      padding: "12px 15px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      width: "100%",
      boxSizing: "border-box",
    },
    textarea: {
      padding: "12px 15px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      width: "100%",
      boxSizing: "border-box",
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "inherit",
    },
    select: {
      padding: "12px 15px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      width: "100%",
      boxSizing: "border-box",
      backgroundColor: "white",
    },
    colorContainer: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },
    colorPicker: {
      width: "50px",
      height: "40px",
      padding: "0",
      border: "none",
      background: "transparent",
      cursor: "pointer",
    },
    colorTextInput: {
      flex: "1",
      padding: "10px",
      border: "2px solid #e0e0e0",
      borderRadius: "8px",
      fontSize: "1rem",
    },
    colorPreview: {
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      border: "2px solid #e0e0e0",
    },
    errorText: {
      color: "#dc3545",
      fontSize: "0.8rem",
      marginTop: "5px",
    },
    helpText: {
      color: "#6c757d",
      fontSize: "0.8rem",
      marginTop: "5px",
    },
    quizSection: {
      background: "#fff",
      borderRadius: "15px",
      padding: "25px",
      border: "2px solid #e9ecef",
    },
    quizList: {
      marginBottom: "25px",
      maxHeight: "200px",
      overflowY: "auto",
    },
    quizItem: {
      background: "#f8f9fa",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "10px",
      border: "1px solid #dee2e6",
    },
    quizItemHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    },
    quizQuestionPreview: {
      color: "#333",
      fontWeight: "500",
      flex: "1",
    },
    quizItemDetails: {
      fontSize: "0.85rem",
      color: "#666",
    },
    btn: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "1rem",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    btnSm: {
      padding: "5px 15px",
      fontSize: "0.85rem",
    },
    btnDanger: {
      background: "#dc3545",
      color: "white",
    },
    btnSuccess: {
      background: "#28a745",
      color: "white",
      width: "100%",
      padding: "12px",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "16px 30px",
      fontSize: "1.1rem",
      marginTop: "20px",
      width: "100%",
    },
    spinner: {
      width: "20px",
      height: "20px",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      animation: "spin 1s ease-in-out infinite",
    },
  };

  // Fetch existing module IDs
  useEffect(() => {
    fetchExistingModules();
  }, []);

  const fetchExistingModules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/learningmodules");
      if (response.data.success) {
        const ids = response.data.data.map(module => module.id);
        setExistingIds(ids);
      }
    } catch (error) {
      console.error("Error fetching existing modules:", error);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: "", text: "" });
  };

  // Handle quiz options changes
  const handleQuizChange = (e, index) => {
    const updatedOptions = [...quizItem.options];
    updatedOptions[index] = e.target.value;
    setQuizItem({
      ...quizItem,
      options: updatedOptions,
    });
  };

  // Add quiz item
  const addQuiz = () => {
    if (!quizItem.question.trim()) {
      setMessage({ type: "error", text: "Quiz question cannot be empty" });
      return;
    }

    if (quizItem.options.some(opt => !opt.trim())) {
      setMessage({ type: "error", text: "Please fill all 4 options" });
      return;
    }

    if (quizItem.correctAnswer < 0 || quizItem.correctAnswer > 3) {
      setMessage({ type: "error", text: "Correct answer must be between 0 and 3" });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      quiz: [...prev.quiz, { ...quizItem }],
    }));

    setQuizItem({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 1
    });

    setMessage({ type: "success", text: "Quiz question added successfully!" });
  };

  // Remove quiz question
  const removeQuiz = (index) => {
    setFormData((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.id || formData.id <= 0) {
      setMessage({ type: "error", text: "Please enter a valid module ID" });
      return false;
    }

    if (existingIds.includes(Number(formData.id))) {
      setMessage({ type: "error", text: "Module ID already exists. Please use a different ID." });
      return false;
    }

    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return false;
    }

    if (!formData.description.trim()) {
      setMessage({ type: "error", text: "Description is required" });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare payload
      const payload = {
        ...formData,
        id: Number(formData.id),
        points: Number(formData.points) || 0,
        totalLessons: Number(formData.totalLessons) || 1,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        quiz: formData.quiz.map(q => ({
          ...q,
          correctAnswer: Number(q.correctAnswer),
          points: Number(q.points) || 1
        }))
      };

      const response = await axios.post(
        "http://localhost:5000/api/learningmodules", 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ 
          type: "success", 
          text: "✅ Module added successfully!" 
        });

        // Reset form
        setFormData({
          id: "",
          title: "",
          subtitle: "",
          category: "climate",
          duration: "10 min",
          points: "10",
          totalLessons: "1",
          difficulty: "Beginner",
          color: "#34eb5b",
          youtubeId: "",
          description: "",
          imageUrl: "",
          tags: "",
          isActive: true,
          quiz: [],
        });

        // Update existing IDs
        setExistingIds([...existingIds, Number(formData.id)]);

        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 5000);
      } else {
        setMessage({ 
          type: "error", 
          text: response.data.message || "Failed to add module"
        });
      }
    } catch (err) {
      console.error("Error adding module:", err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "❌ Error adding module";
      
      setMessage({ 
        type: "error", 
        text: errorMessage 
      });
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        
        .btn-danger:hover {
          background-color: #c82333 !important;
        }
        
        .btn-success:hover {
          background-color: #218838 !important;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3) !important;
        }
        
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          
          .options-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Learning Module</h2>
        
        {message.text && (
          <div style={message.type === "success" ? styles.message.success : styles.message.error}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Basic Information Section */}
          <div style={styles.formSection}>
            <h3>Basic Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="id" style={styles.label}>Module ID *</label>
                <input
                  type="number"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="Enter unique module ID"
                  required
                  min="1"
                  style={styles.input}
                />
                {existingIds.includes(Number(formData.id)) && formData.id && (
                  <small style={styles.errorText}>⚠️ This ID already exists</small>
                )}
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="title" style={styles.label}>Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Module title"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="subtitle" style={styles.label}>Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Brief subtitle"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="category" style={styles.label}>Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="duration" style={styles.label}>Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 15 min"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="points" style={styles.label}>Points</label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  placeholder="Points awarded"
                  min="0"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="totalLessons" style={styles.label}>Total Lessons</label>
                <input
                  type="number"
                  id="totalLessons"
                  name="totalLessons"
                  value={formData.totalLessons}
                  onChange={handleChange}
                  placeholder="Number of lessons"
                  min="1"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="difficulty" style={styles.label}>Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="tags" style={styles.label}>Tags (comma separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., climate-change, sustainability, water-conservation"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div style={styles.formSection}>
            <h3>Media & Appearance</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="color" style={styles.label}>Theme Color</label>
                <div style={styles.colorContainer}>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    style={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="#34eb5b"
                    style={styles.colorTextInput}
                  />
                  <div 
                    style={{...styles.colorPreview, backgroundColor: formData.color}}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="youtubeId" style={styles.label}>YouTube Video ID</label>
                <input
                  type="text"
                  id="youtubeId"
                  name="youtubeId"
                  value={formData.youtubeId}
                  onChange={handleChange}
                  placeholder="YouTube video ID (after v=)"
                  style={styles.input}
                />
                <small style={styles.helpText}>
                  Example: For https://youtube.com/watch?v=abc123, enter "abc123"
                </small>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="imageUrl" style={styles.label}>Image URL</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div style={styles.formSection}>
            <div style={{...styles.formGroup, ...styles.fullWidth}}>
              <label htmlFor="description" style={styles.label}>Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the module..."
                rows="6"
                required
                style={styles.textarea}
              />
            </div>
          </div>

          {/* Quiz Section */}
          <div style={{...styles.formSection, ...styles.quizSection}}>
            <h3>Quiz Questions ({formData.quiz.length} added)</h3>
            
            {/* Display added quizzes */}
            {formData.quiz.length > 0 && (
              <div style={styles.quizList}>
                {formData.quiz.map((q, index) => (
                  <div key={index} style={styles.quizItem}>
                    <div style={styles.quizItemHeader}>
                      <span style={styles.quizQuestionPreview}>
                        Q{index + 1}: {q.question.substring(0, 60)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuiz(index)}
                        style={{...styles.btn, ...styles.btnSm, ...styles.btnDanger}}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={styles.quizItemDetails}>
                      <small>Correct: Option {q.correctAnswer + 1} | Points: {q.points}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new quiz form */}
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", border: "1px solid #dee2e6" }}>
              <h4>Add New Question</h4>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Question *</label>
                <input
                  type="text"
                  value={quizItem.question}
                  onChange={(e) =>
                    setQuizItem({ ...quizItem, question: e.target.value })
                  }
                  placeholder="Enter question text"
                  style={styles.input}
                />
              </div>

              <div style={styles.optionsGrid}>
                {quizItem.options.map((opt, index) => (
                  <div key={index} style={styles.formGroup}>
                    <label style={styles.label}>Option {index + 1} *</label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleQuizChange(e, index)}
                      placeholder={`Option ${index + 1}`}
                      style={styles.input}
                    />
                  </div>
                ))}
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Correct Answer *</label>
                  <select
                    value={quizItem.correctAnswer}
                    onChange={(e) =>
                      setQuizItem({
                        ...quizItem,
                        correctAnswer: Number(e.target.value),
                      })
                    }
                    style={styles.select}
                  >
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Points for this question</label>
                  <input
                    type="number"
                    value={quizItem.points}
                    onChange={(e) =>
                      setQuizItem({
                        ...quizItem,
                        points: Number(e.target.value),
                      })
                    }
                    min="1"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Explanation</label>
                <textarea
                  value={quizItem.explanation}
                  onChange={(e) =>
                    setQuizItem({ ...quizItem, explanation: e.target.value })
                  }
                  placeholder="Explanation for the correct answer"
                  rows="3"
                  style={styles.textarea}
                />
              </div>

              <button
                type="button"
                onClick={addQuiz}
                style={{...styles.btn, ...styles.btnSuccess}}
              >
                + Add This Question
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              ...styles.btnPrimary,
              opacity: loading ? "0.7" : "1",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Adding Module...
              </>
            ) : (
              "Add Learning Module"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddModule;