// InstituteRegister.js
import { useState } from "react";
import { API } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

// Import components
import BasicInfoStep from "../instituteRegistration/BasicInfoStep";
import InstituteTypeStep from "../instituteRegistration/InstituteTypeStep";
import ContactInfoStep from "../instituteRegistration/ContactInfoStep";
import SchoolFields from "../instituteRegistration/SchoolFields";
import CollegeFields from "../instituteRegistration/CollegeFields";
import UniversityFields from "../instituteRegistration/UniversityFields";
import PrincipalAcademicStep from "../instituteRegistration/PrincipalAcademicStep";

// Define initial form state outside component to ensure it's always available
const initialFormState = {
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
  customCourse: "",
  customFaculty: "",
  customProgram: "",
  customInfrastructure: "",
  customResearchCenter: ""
};

export default function InstituteRegister() {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation function
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!form.instituteName?.trim()) newErrors.instituteName = "Institute name is required";
      if (!form.instituteCode?.trim()) newErrors.instituteCode = "Institute code is required";
      if (!form.email?.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm password";
      else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    }

    if (currentStep === 2) {
      if (!form.instituteType) newErrors.instituteType = "Please select institute type";
    }

    if (currentStep === 3) {
      if (!form.address?.trim()) newErrors.address = "Address is required";
      if (!form.city?.trim()) newErrors.city = "City is required";
      if (!form.state?.trim()) newErrors.state = "State is required";
      if (!form.country?.trim()) newErrors.country = "Country is required";
      if (!form.pincode?.trim()) newErrors.pincode = "Pincode is required";
      if (!form.phone?.trim()) newErrors.phone = "Phone number is required";

      // Institute type specific validations
      if (form.instituteType === "school") {
        if (!form.schoolLevel) newErrors.schoolLevel = "School level is required";
        if (!form.board) newErrors.board = "Education board is required";
        if (form.grades?.length === 0) newErrors.grades = "Please select at least one grade";
      }

      if (form.instituteType === "college") {
        if (form.departments?.length === 0) newErrors.departments = "Please add at least one department";
      }

      if (form.instituteType === "university") {
        if (form.faculties?.length === 0) newErrors.faculties = "Please add at least one faculty";
      }
    }

    if (currentStep === 4) {
      if (!form.principalName?.trim()) newErrors.principalName = "Principal name is required";
      if (form.workingDays?.length === 0) newErrors.workingDays = "Please select working days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      alert("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      // In your handleSubmit function in InstituteRegister.js
const payload = {
  // Basic Info
  instituteName: form.instituteName.trim(),
  instituteCode: form.instituteCode.trim(),
  email: form.email.trim(),
  password: form.password,
  instituteType: form.instituteType,
  accreditation: form.accreditation?.trim() || "",
  affiliation: form.affiliation?.trim() || "",
  
  // Contact Info
  address: form.address.trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  country: form.country.trim(),
  pincode: form.pincode.trim(),
  phone: form.phone.trim(),
  website: form.website?.trim() || "",
  alternatePhone: form.alternatePhone?.trim() || "",
  
  // Institute Details
  totalStudents: form.totalStudents ? parseInt(form.totalStudents) : 0,
  totalStaff: form.totalStaff ? parseInt(form.totalStaff) : 0,
  totalFaculty: form.totalFaculty ? parseInt(form.totalFaculty) : 0,
  establishedYear: form.establishedYear ? parseInt(form.establishedYear) : null,
  campusArea: form.campusArea?.trim() || "",
  infrastructure: form.infrastructure || [],
  
  // Principal Details
  principalName: form.principalName.trim(),
  principalEmail: form.principalEmail?.trim() || "",
  principalPhone: form.principalPhone?.trim() || "",
  principalQualification: form.principalQualification?.trim() || "",
  principalExperience: form.principalExperience?.trim() || "",
  
  // Academic Details - Send as array
  academicSession: form.academicSession || "",
  workingDays: form.workingDays || [],

  // Type-specific data
  ...(form.instituteType === "school" && {
    schoolLevel: form.schoolLevel,
    grades: form.grades || [],
    board: form.board
  }),
  ...(form.instituteType === "college" && {
    departments: form.departments || [],
    courses: form.courses || [],
    universityAffiliated: form.universityAffiliated?.trim() || ""
  }),
  ...(form.instituteType === "university" && {
    faculties: (form.faculties || []).map(faculty => ({
      name: faculty.name,
      departments: faculty.departments || []
    })),
    programs: form.programs || [],
    researchCenters: form.researchCenters || []
  })
};

      console.log("📤 Sending registration payload:", payload);
      const response = await API.post("/auth/institute-register", payload);
      
      console.log("✅ Registration successful:", response.data);
      alert("Institute registered successfully! You can now login.");
      navigate("/login");
      
    } catch (err) {
      console.error("❌ Registration error:", err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        alert(`Registration failed: ${errorData.message || "Unknown error"}`);
      } else if (err.request) {
        alert("Network error! Please check your connection and try again.");
      } else {
        alert("An unexpected error occurred! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      alert("Please fix the errors before proceeding");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  const renderInstituteSpecificFields = () => {
    switch (form.instituteType) {
      case "school":
        return <SchoolFields form={form} setForm={setForm} errors={errors} />;
      case "college":
        return <CollegeFields form={form} setForm={setForm} errors={errors} />;
      case "university":
        return <UniversityFields form={form} setForm={setForm} errors={errors} />;
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    // Ensure form is always defined
    const currentForm = form || initialFormState;
    
    switch (step) {
      case 1:
        return <BasicInfoStep form={currentForm} setForm={setForm} errors={errors} />;
      case 2:
        return <InstituteTypeStep form={currentForm} setForm={setForm} errors={errors} />;
      case 3:
        return (
          <ContactInfoStep 
            form={currentForm} 
            setForm={setForm} 
            errors={errors}
            renderInstituteSpecificFields={renderInstituteSpecificFields}
          />
        );
      case 4:
        return <PrincipalAcademicStep form={currentForm} setForm={setForm} errors={errors} />;
      default:
        return <div>Invalid step</div>;
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
            {renderStepContent()}
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
                className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering Institute...
                  </>
                ) : (
                  "Complete Registration"
                )}
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