import React, { useState, useEffect } from "react";
import axios from "axios";

const AddModule = () => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    subtitle: "",
    category: "climate",
    duration: "",
    points: "",
    totalLessons: "",
    difficulty: "Beginner",
    color: "#34eb5b",
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

  // Styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      maxWidth: "1000px",
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
      gap: "25px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
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
      minHeight: "100px",
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
      background: "#f8f9fa",
      borderRadius: "15px",
      padding: "25px",
      border: "2px solid #e9ecef",
    },
    quizTitle: {
      fontSize: "1.3rem",
      color: "#495057",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    quizList: {
      marginBottom: "25px",
      maxHeight: "200px",
      overflowY: "auto",
    },
    quizItem: {
      background: "white",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "10px",
      border: "1px solid #dee2e6",
    },
    quizItemHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    quizQuestionPreview: {
      color: "#333",
      fontWeight: "500",
    },
    removeQuizBtn: {
      background: "#dc3545",
      color: "white",
      border: "none",
      padding: "5px 15px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "0.85rem",
      transition: "background 0.3s",
    },
    quizForm: {
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #dee2e6",
    },
    quizFormTitle: {
      color: "#495057",
      marginBottom: "20px",
      fontSize: "1.1rem",
    },
    optionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "15px",
      marginBottom: "20px",
    },
    addQuizBtn: {
      background: "#28a745",
      color: "white",
      border: "none",
      padding: "12px 25px",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background 0.3s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      width: "100%",
      fontSize: "1rem",
    },
    submitBtn: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      padding: "16px 30px",
      borderRadius: "10px",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "transform 0.3s, box-shadow 0.3s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
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
    // Animation keyframes
    keyframes: `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
    // Focus styles
    focusStyle: {
      outline: "none",
      borderColor: "#667eea",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
  };

  // Add hover effects for buttons
  const buttonHoverStyle = {
    backgroundColor: "#218838",
  };

  const submitBtnHoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(102, 126, 234, 0.3)",
  };

  // Fetch existing module IDs to prevent duplicates
  useEffect(() => {
    const fetchExistingModules = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/learningmodules");
        const ids = response.data.map(module => module.id);
        setExistingIds(ids);
      } catch (error) {
        console.error("Error fetching existing modules:", error);
      }
    };
    fetchExistingModules();
  }, []);

  // Handle non-quiz field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
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
      setMessage({ type: "error", text: "Quiz question cannot be empty" });
      return;
    }

    // Check if all options are filled
    if (quizItem.options.some(opt => !opt.trim())) {
      setMessage({ type: "error", text: "Please fill all 4 options" });
      return;
    }

    // Validate correct answer index
    if (quizItem.correctAnswer < 0 || quizItem.correctAnswer > 3) {
      setMessage({ type: "error", text: "Correct answer must be between 0 and 3" });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      quiz: [...prev.quiz, { ...quizItem }],
    }));

    // Reset quiz item
    setQuizItem({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
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

    if (!formData.category) {
      setMessage({ type: "error", text: "Category is required" });
      return false;
    }

    if (!formData.youtubeId && !formData.description) {
      setMessage({ type: "error", text: "Please provide either a YouTube ID or Description" });
      return false;
    }

    return true;
  };

  // Submit module
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare payload with proper data types
      const payload = {
        ...formData,
        id: Number(formData.id),
        points: Number(formData.points) || 0,
        totalLessons: Number(formData.totalLessons) || 0,
        // Ensure quiz correctAnswer is number
        quiz: formData.quiz.map(q => ({
          ...q,
          correctAnswer: Number(q.correctAnswer)
        }))
      };

      const response = await axios.post(
        "http://localhost:5000/api/learningmodules/add", 
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

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
        duration: "",
        points: "",
        totalLessons: "",
        difficulty: "Beginner",
        color: "#34eb5b",
        youtubeId: "",
        description: "",
        imageUrl: "",
        quiz: [],
      });

      // Update existing IDs
      setExistingIds([...existingIds, Number(formData.id)]);

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);

    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      
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

  // Handle color input with preview
  const handleColorChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, color: value }));
  };

  // Handle input focus
  const handleFocus = (e) => {
    e.target.style.outline = "none";
    e.target.style.borderColor = "#667eea";
    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
  };

  // Handle input blur
  const handleBlur = (e) => {
    e.target.style.borderColor = "#e0e0e0";
    e.target.style.boxShadow = "none";
  };

  // Handle button hover
  const handleButtonMouseEnter = (e) => {
    if (e.target.type === "button") {
      if (e.target.classList.contains("add-quiz-btn")) {
        e.target.style.backgroundColor = "#218838";
      } else if (e.target.classList.contains("submit-btn")) {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 10px 20px rgba(102, 126, 234, 0.3)";
      }
    }
  };

  // Handle button mouse leave
  const handleButtonMouseLeave = (e) => {
    if (e.target.type === "button") {
      if (e.target.classList.contains("add-quiz-btn")) {
        e.target.style.backgroundColor = "#28a745";
      } else if (e.target.classList.contains("submit-btn")) {
        e.target.style.transform = "none";
        e.target.style.boxShadow = "none";
      }
    }
  };

  return (
    <div style={styles.container}>
      <style>{styles.keyframes}</style>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Learning Module</h2>
        
        {message.text && (
          <div style={message.type === "success" ? styles.message.success : styles.message.error}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Module ID */}
            <div style={styles.formGroup}>
              <label htmlFor="id" style={styles.label}>Module ID *</label>
              <input
                type="number"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter unique module ID"
                style={styles.input}
                required
                min="1"
              />
              {existingIds.includes(Number(formData.id)) && formData.id && (
                <small style={styles.errorText}>⚠️ This ID already exists</small>
              )}
            </div>

            {/* Title */}
            <div style={styles.formGroup}>
              <label htmlFor="title" style={styles.label}>Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Module title"
                style={styles.input}
                required
              />
            </div>

            {/* Subtitle */}
            <div style={styles.formGroup}>
              <label htmlFor="subtitle" style={styles.label}>Subtitle</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Brief subtitle"
                style={styles.input}
              />
            </div>

            {/* Category */}
            <div style={styles.formGroup}>
              <label htmlFor="category" style={styles.label}>Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.select}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div style={styles.formGroup}>
              <label htmlFor="duration" style={styles.label}>Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="e.g., 15 min"
                style={styles.input}
              />
            </div>

            {/* Points */}
            <div style={styles.formGroup}>
              <label htmlFor="points" style={styles.label}>Points</label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Points awarded"
                style={styles.input}
                min="0"
              />
            </div>

            {/* Total Lessons */}
            <div style={styles.formGroup}>
              <label htmlFor="totalLessons" style={styles.label}>Total Lessons</label>
              <input
                type="number"
                id="totalLessons"
                name="totalLessons"
                value={formData.totalLessons}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Number of lessons"
                style={styles.input}
                min="0"
              />
            </div>

            {/* Difficulty */}
            <div style={styles.formGroup}>
              <label htmlFor="difficulty" style={styles.label}>Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.select}
              >
                {difficultyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Color with preview */}
            <div style={styles.formGroup}>
              <label htmlFor="color" style={styles.label}>Theme Color</label>
              <div style={styles.colorContainer}>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleColorChange}
                  style={styles.colorPicker}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={handleColorChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="#34eb5b"
                  style={styles.colorTextInput}
                />
                <div 
                  style={{...styles.colorPreview, backgroundColor: formData.color}}
                />
              </div>
            </div>

            {/* YouTube ID */}
            <div style={styles.formGroup}>
              <label htmlFor="youtubeId" style={styles.label}>YouTube Video ID</label>
              <input
                type="text"
                id="youtubeId"
                name="youtubeId"
                value={formData.youtubeId}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="YouTube video ID (after v=)"
                style={styles.input}
              />
              {formData.youtubeId && (
                <small style={styles.helpText}>
                  Example: For https://youtube.com/watch?v=abc123, enter "abc123"
                </small>
              )}
            </div>

            {/* Image URL */}
            <div style={styles.formGroup}>
              <label htmlFor="imageUrl" style={styles.label}>Image URL</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="https://example.com/image.jpg"
                style={styles.input}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{...styles.formGroup, gridColumn: "1 / -1"}}>
            <label htmlFor="description" style={styles.label}>Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Detailed description of the module..."
              style={styles.textarea}
              rows="4"
              required={!formData.youtubeId}
            />
          </div>

          {/* Quiz Section */}
          <div style={styles.quizSection}>
            <h3 style={styles.quizTitle}>Add Quiz Questions ({formData.quiz.length} added)</h3>
            
            {/* Display added quizzes */}
            {formData.quiz.length > 0 && (
              <div style={styles.quizList}>
                {formData.quiz.map((q, index) => (
                  <div key={index} style={styles.quizItem}>
                    <div style={styles.quizItemHeader}>
                      <span style={styles.quizQuestionPreview}>
                        Q{index + 1}: {q.question.substring(0, 50)}...
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuiz(index)}
                        style={styles.removeQuizBtn}
                        onMouseEnter={handleButtonMouseEnter}
                        onMouseLeave={handleButtonMouseLeave}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new quiz form */}
            <div style={styles.quizForm}>
              <h4 style={styles.quizFormTitle}>Add New Question</h4>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Question *</label>
                <input
                  type="text"
                  value={quizItem.question}
                  onChange={(e) =>
                    setQuizItem({ ...quizItem, question: e.target.value })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={`Option ${index + 1}`}
                      style={styles.input}
                    />
                  </div>
                ))}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Correct Answer Index *</label>
                <select
                  value={quizItem.correctAnswer}
                  onChange={(e) =>
                    setQuizItem({
                      ...quizItem,
                      correctAnswer: Number(e.target.value),
                    })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={styles.select}
                >
                  <option value="0">Option 1</option>
                  <option value="1">Option 2</option>
                  <option value="2">Option 3</option>
                  <option value="3">Option 4</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Explanation</label>
                <textarea
                  value={quizItem.explanation}
                  onChange={(e) =>
                    setQuizItem({ ...quizItem, explanation: e.target.value })
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Explanation for the correct answer"
                  style={{...styles.textarea, minHeight: "80px"}}
                  rows="2"
                />
              </div>

              <button
                type="button"
                onClick={addQuiz}
                className="add-quiz-btn"
                style={styles.addQuizBtn}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                + Add This Question
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              ...styles.submitBtn,
              opacity: loading ? "0.7" : "1",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
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

      {/* Responsive styles via media query */}
      <style>{`
        @media (max-width: 768px) {
          .add-module-card {
            padding: 20px;
            margin: 10px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .options-grid {
            grid-template-columns: 1fr;
          }
          
          .color-input-container {
            flex-wrap: wrap;
          }
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        
        .add-quiz-btn:hover {
          background-color: #218838 !important;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3) !important;
        }
        
        .remove-quiz-btn:hover {
          background-color: #c82333 !important;
        }
      `}</style>
    </div>
  );
};

export default AddModule;