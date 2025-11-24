import { useState } from "react";
import { API } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  School, 
  MapPin, 
  Phone, 
  Globe, 
  Users, 
  Building,
  BookOpen,
  GraduationCap,
  Layers,
  Check,
  IdCard,
  Calendar,
  Award,
  Shield,
  FileText,
  Landmark,
  Briefcase,
  Target,
  BarChart3,
  Clock,
  Heart
} from "lucide-react";

export default function InstituteRegister() {
  const [form, setForm] = useState({
    // Basic Institute Info
    instituteName: "",
    instituteCode: "",
    email: "",
    password: "",
    confirmPassword: "",
    instituteType: "",
    accreditation: "",
    affiliation: "",
    
    // Contact Information
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    phone: "",
    website: "",
    alternatePhone: "",
    
    // Institute Details
    totalStudents: "",
    totalStaff: "",
    totalFaculty: "",
    establishedYear: "",
    campusArea: "",
    infrastructure: [],
    
    // Principal/Head Details
    principalName: "",
    principalEmail: "",
    principalPhone: "",
    principalQualification: "",
    principalExperience: "",
    
    // Academic Details
    academicSession: "",
    workingDays: [],
    
    // School specific
    schoolLevel: "",
    grades: [],
    board: "",
    
    // College specific
    departments: [],
    courses: [],
    universityAffiliated: "",
    
    // University specific
    faculties: [],
    programs: [],
    researchCenters: [],
    
    // Custom fields
    customDepartment: "",
    customFaculty: "",
    customProgram: "",
    customInfrastructure: "",
    customResearchCenter: ""
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showCustomInput, setShowCustomInput] = useState({ 
    department: false, 
    faculty: false, 
    program: false,
    infrastructure: false,
    researchCenter: false
  });
  const navigate = useNavigate();

  const instituteTypes = [
    { value: "school", label: "School", description: "Primary/Secondary Education", icon: School },
    { value: "college", label: "College", description: "Undergraduate Education", icon: GraduationCap },
    { value: "university", label: "University", description: "Postgraduate & Research", icon: Building }
  ];

  const schoolLevels = [
    "Primary School",
    "Middle School", 
    "High School",
    "Higher Secondary",
    "K-12",
    "International School",
    "Play School"
  ];

  const educationBoards = [
    "CBSE",
    "ICSE",
    "State Board",
    "IB (International Baccalaureate)",
    "IGCSE",
    "NIOS",
    "Other"
  ];

  const grades = [
    "Play Group", "Nursery", "LKG", "UKG", 
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", 
    "11th Grade", "12th Grade"
  ];

  const workingDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const academicSessions = [
    "January-December",
    "April-March", 
    "June-May",
    "August-July",
    "Other"
  ];

  const commonDepartments = [
    "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "History", "Economics", "Commerce", "Arts",
    "Engineering", "Medical", "Law", "Management", "Architecture",
    "Pharmacy", "Agriculture", "Education", "Social Work"
  ];

  const commonFaculties = [
    "Faculty of Science",
    "Faculty of Arts",
    "Faculty of Engineering",
    "Faculty of Medicine", 
    "Faculty of Law",
    "Faculty of Business",
    "Faculty of Social Sciences",
    "Faculty of Education",
    "Faculty of Technology",
    "Faculty of Humanities"
  ];

  const commonPrograms = [
    "Bachelor's Degree",
    "Master's Degree", 
    "PhD/Doctorate",
    "Diploma",
    "Certificate Program",
    "Executive Education",
    "Distance Education",
    "Part-time Program"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    // Comprehensive validation
    if (form.instituteType === "school" && (!form.schoolLevel || form.grades.length === 0 || !form.board)) {
      alert("Please fill all school-specific required fields");
      return;
    }

    if (form.instituteType === "college" && form.departments.length === 0) {
      alert("Please add at least one department");
      return;
    }

    if (form.instituteType === "university" && (form.faculties.length === 0 || form.programs.length === 0)) {
      alert("Please add at least one faculty and one program");
      return;
    }

    if (step === 4) {
      if (!form.principalName) {
        alert("Please fill principal name");
        return;
      }
      if (form.password !== form.confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
    } else {
      nextStep();
      return;
    }


    setLoading(true);
    try {
      const payload = {
        // Basic Info
        instituteName: form.instituteName,
        instituteCode: form.instituteCode,
        email: form.email,
        password: form.password,
        instituteType: form.instituteType,
        accreditation: form.accreditation,
        affiliation: form.affiliation,
        
        // Contact Info
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        phone: form.phone,
        website: form.website,
        alternatePhone: form.alternatePhone,
        
        // Institute Details
        totalStudents: form.totalStudents,
        totalStaff: form.totalStaff,
        totalFaculty: form.totalFaculty,
        establishedYear: form.establishedYear,
        campusArea: form.campusArea,
        infrastructure: form.infrastructure,
        
        // Principal Details
        principalName: form.principalName,
        principalEmail: form.principalEmail,
        principalPhone: form.principalPhone,
        principalQualification: form.principalQualification,
        principalExperience: form.principalExperience,
        
        // Academic Details
        academicSession: form.academicSession,
        workingDays: form.workingDays,

        // Type-specific data
        ...(form.instituteType === "school" && {
          schoolLevel: form.schoolLevel,
          grades: form.grades,
          board: form.board
        }),
        ...(form.instituteType === "college" && {
          departments: form.departments,
          courses: form.courses,
          universityAffiliated: form.universityAffiliated
        }),
        ...(form.instituteType === "university" && {
          faculties: form.faculties,
          programs: form.programs,
          researchCenters: form.researchCenters
        })
      };

      console.log("Sending payload:", payload); 
      await API.post("/auth/institute-register", payload);
      alert("Institute registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  // Toggle functions
  const toggleGrade = (grade) => {
    setForm(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade]
    }));
  };

  const toggleWorkingDay = (day) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  // College functions
  const addDepartment = (dept) => {
    if (!form.departments.includes(dept)) {
      setForm({ ...form, departments: [...form.departments, dept] });
    }
  };

  const removeDepartment = (deptToRemove) => {
    setForm({
      ...form,
      departments: form.departments.filter(dept => dept !== deptToRemove)
    });
  };

  const addCustomDepartment = () => {
    if (form.customDepartment.trim() && !form.departments.includes(form.customDepartment.trim())) {
      setForm({
        ...form,
        departments: [...form.departments, form.customDepartment.trim()],
        customDepartment: ""
      });
      setShowCustomInput({ ...showCustomInput, department: false });
    }
  };

  // University functions
  const addFaculty = (faculty) => {
    if (!form.faculties.includes(faculty)) {
      setForm({ ...form, faculties: [...form.faculties, faculty] });
    }
  };

  const removeFaculty = (facultyToRemove) => {
    setForm({
      ...form,
      faculties: form.faculties.filter(faculty => faculty !== facultyToRemove)
    });
  };

  const addCustomFaculty = () => {
    if (form.customFaculty.trim() && !form.faculties.includes(form.customFaculty.trim())) {
      setForm({
        ...form,
        faculties: [...form.faculties, form.customFaculty.trim()],
        customFaculty: ""
      });
      setShowCustomInput({ ...showCustomInput, faculty: false });
    }
  };

  const addProgram = (program) => {
    if (!form.programs.includes(program)) {
      setForm({ ...form, programs: [...form.programs, program] });
    }
  };

  const removeProgram = (programToRemove) => {
    setForm({
      ...form,
      programs: form.programs.filter(program => program !== programToRemove)
    });
  };

  const addCustomProgram = () => {
    if (form.customProgram.trim() && !form.programs.includes(form.customProgram.trim())) {
      setForm({
        ...form,
        programs: [...form.programs, form.customProgram.trim()],
        customProgram: ""
      });
      setShowCustomInput({ ...showCustomInput, program: false });
    }
  };

  const addResearchCenter = () => {
    if (form.customResearchCenter.trim() && !form.researchCenters.includes(form.customResearchCenter.trim())) {
      setForm({
        ...form,
        researchCenters: [...form.researchCenters, form.customResearchCenter.trim()],
        customResearchCenter: ""
      });
    }
  };

  const removeResearchCenter = (centerToRemove) => {
    setForm({
      ...form,
      researchCenters: form.researchCenters.filter(center => center !== centerToRemove)
    });
  };


  const nextStep = () => {
    if (step === 1 && (!form.instituteName || !form.email || !form.password || !form.confirmPassword)) {
      alert("Please fill all basic details");
      return;
    }
    if (step === 2 && !form.instituteType) {
      alert("Please select institute type");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const renderInstituteSpecificFields = () => {
    switch (form.instituteType) {
      case "school":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  School Level <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.schoolLevel}
                  onChange={(e) => setForm({ ...form, schoolLevel: e.target.value })}
                  required
                >
                  <option value="">Select school level</option>
                  {schoolLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Education Board <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.board}
                  onChange={(e) => setForm({ ...form, board: e.target.value })}
                  required
                >
                  <option value="">Select education board</option>
                  {educationBoards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Grades Offered <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                {grades.map(grade => (
                  <label key={grade} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.grades.includes(grade)}
                      onChange={() => toggleGrade(grade)}
                      className="rounded text-blue-600 focus:ring-blue-400"
                    />
                    <span className="text-sm">{grade}</span>
                  </label>
                ))}
              </div>
              {form.grades.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Selected grades:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.grades.map(grade => (
                      <span
                        key={grade}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {grade}
                        <button
                          type="button"
                          onClick={() => toggleGrade(grade)}
                          className="ml-2 hover:text-green-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "college":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                University Affiliation
              </label>
              <input
                type="text"
                placeholder="Name of affiliated university"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.universityAffiliated}
                onChange={(e) => setForm({ ...form, universityAffiliated: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Departments <span className="text-red-500">*</span>
              </label>
              
              {form.departments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.departments.map((dept) => (
                    <span
                      key={dept}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {dept}
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="ml-2 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setShowCustomInput({ ...showCustomInput, department: true });
                    } else if (e.target.value) {
                      addDepartment(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Select common departments...</option>
                  {commonDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  <option value="custom">+ Add Custom Department</option>
                </select>

                <AnimatePresence>
                  {showCustomInput.department && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Enter department name"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.customDepartment}
                        onChange={(e) => setForm({ ...form, customDepartment: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={addCustomDepartment}
                        className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );

      case "university":
        return (
          <div className="space-y-6">
            {/* Faculties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Faculties <span className="text-red-500">*</span>
              </label>
              
              {form.faculties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.faculties.map((faculty) => (
                    <span
                      key={faculty}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {faculty}
                      <button
                        type="button"
                        onClick={() => removeFaculty(faculty)}
                        className="ml-2 hover:text-purple-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setShowCustomInput({ ...showCustomInput, faculty: true });
                    } else if (e.target.value) {
                      addFaculty(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Select common faculties...</option>
                  {commonFaculties.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                  <option value="custom">+ Add Custom Faculty</option>
                </select>

                <AnimatePresence>
                  {showCustomInput.faculty && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Enter faculty name"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.customFaculty}
                        onChange={(e) => setForm({ ...form, customFaculty: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={addCustomFaculty}
                        className="px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Programs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Programs Offered <span className="text-red-500">*</span>
              </label>
              
              {form.programs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.programs.map((program) => (
                    <span
                      key={program}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {program}
                      <button
                        type="button"
                        onClick={() => removeProgram(program)}
                        className="ml-2 hover:text-orange-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setShowCustomInput({ ...showCustomInput, program: true });
                    } else if (e.target.value) {
                      addProgram(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Select common programs...</option>
                  {commonPrograms.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                  <option value="custom">+ Add Custom Program</option>
                </select>

                <AnimatePresence>
                  {showCustomInput.program && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Enter program name"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.customProgram}
                        onChange={(e) => setForm({ ...form, customProgram: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={addCustomProgram}
                        className="px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Add
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Research Centers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Research Centers
              </label>
              
              {form.researchCenters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.researchCenters.map((center) => (
                    <span
                      key={center}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      {center}
                      <button
                        type="button"
                        onClick={() => removeResearchCenter(center)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter research center name"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={form.customResearchCenter}
                  onChange={(e) => setForm({ ...form, customResearchCenter: e.target.value })}
                />
                <button
                  type="button"
                  onClick={addResearchCenter}
                  className="px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 py-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-4xl mx-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">EcoQuest</h1>
          <p className="text-gray-600 text-lg">
            Register your institute and join the green revolution 🌿
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step >= stepNum
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {step > stepNum ? <Check size={20} /> : stepNum}
                </div>
                <span className="text-xs mt-1 text-gray-600">
                  {stepNum === 1 && "Basic Info"}
                  {stepNum === 2 && "Institute Type"}
                  {stepNum === 3 && "Institute Details"}
                  {stepNum === 4 && "Principal & Academic"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-blue-800 mb-6">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 text-blue-600" size={20} />
                    <input
                      type="text"
                      placeholder="Institute Name *"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.instituteName}
                      onChange={(e) => setForm({ ...form, instituteName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="relative">
                    <IdCard className="absolute left-3 top-2.5 text-blue-600" size={20} />
                    <input
                      type="text"
                      placeholder="Institute Code *"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.instituteCode}
                      onChange={(e) => setForm({ ...form, instituteCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-blue-600" size={20} />
                  <input
                    type="email"
                    placeholder="Official Email *"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-blue-600" size={20} />
                    <input
                      type="password"
                      placeholder="Password *"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-blue-600" size={20} />
                    <input
                      type="password"
                      placeholder="Confirm Password *"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Institute Type */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h2 className="text-2xl font-bold text-blue-800 mb-6">Select Institute Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {instituteTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <motion.div
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          form.instituteType === type.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                        onClick={() => setForm({ ...form, instituteType: type.value })}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent size={24} className="text-blue-600" />
                          <div>
                            <div className="font-semibold text-gray-800">{type.label}</div>
                            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Institute Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-blue-800 mb-6">
                  Institute Details
                </h2>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="mr-2 text-blue-600" size={20} />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="text"
                        placeholder="Address *"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="City *"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />

                    <input
                      type="text"
                      placeholder="State *"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      required
                    />

                    <input
                      type="text"
                      placeholder="Country *"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      required
                    />

                    <input
                      type="text"
                      placeholder="Pincode *"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      required
                    />

                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="url"
                        placeholder="Website"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="tel"
                        placeholder="Alternate Phone"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.alternatePhone}
                        onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Institute Type Specific Fields */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <School className="mr-2 text-blue-600" size={20} />
                    {form.instituteType ? `${form.instituteType.charAt(0).toUpperCase() + form.instituteType.slice(1)} Specific Details` : "Institute Specific Details"}
                  </h3>
                  {renderInstituteSpecificFields()}
                </div>
              </motion.div>
            )}

            {/* Step 4: Principal & Academic Details */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-blue-800 mb-6">Principal & Academic Details</h2>

                {/* Principal Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="mr-2 text-blue-600" size={20} />
                    Principal/Head Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="text"
                        placeholder="Principal Name *"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.principalName}
                        onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="email"
                        placeholder="Principal Email"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.principalEmail}
                        onChange={(e) => setForm({ ...form, principalEmail: e.target.value })}
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <input
                        type="tel"
                        placeholder="Principal Phone"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.principalPhone}
                        onChange={(e) => setForm({ ...form, principalPhone: e.target.value })}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Qualification"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.principalQualification}
                      onChange={(e) => setForm({ ...form, principalQualification: e.target.value })}
                    />

                    <input
                      type="text"
                      placeholder="Experience (years)"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={form.principalExperience}
                      onChange={(e) => setForm({ ...form, principalExperience: e.target.value })}
                    />
                  </div>
                </div>

                {/* Academic Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="mr-2 text-blue-600" size={20} />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <select
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.academicSession}
                        onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                      >
                        <option value="">Academic Session</option>
                        {academicSessions.map(session => (
                          <option key={session} value={session}>{session}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 text-blue-600" size={20} />
                      <div className="p-3 border border-gray-300 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2 ml-7">
                          Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {workingDays.map(day => (
                            <label key={day} className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={form.workingDays.includes(day)}
                                onChange={() => toggleWorkingDay(day)}
                                className="rounded text-blue-600 focus:ring-blue-400"
                              />
                              <span className="text-sm">{day.substring(0, 3)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="mr-2 text-blue-600" size={20} />
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Affiliation Details
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Affiliated to XYZ University"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={form.affiliation}
                        onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 2 && !form.instituteType}
                className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Registering Institute..." : "Complete Registration"}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-700 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>
    </div>
  );
}