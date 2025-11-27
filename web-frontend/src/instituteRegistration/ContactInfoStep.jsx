// components/institute-registration/ContactInfoStep.js
import { motion } from "framer-motion";
import { MapPin, Phone, Globe, School } from "lucide-react";

export default function ContactInfoStep({ form = {}, setForm, errors = {}, renderInstituteSpecificFields }) {
  const safeForm = form || {};
  
  return (
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
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.address ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.address || ""}
              onChange={(e) => setForm({ ...safeForm, address: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="tel"
              placeholder="Phone Number *"
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phone ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
              value={safeForm.phone || ""}
              onChange={(e) => setForm({ ...safeForm, phone: e.target.value })}
              required
            />
          </div>

          <input
            type="text"
            placeholder="City *"
            className={`p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.city ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.city || ""}
            onChange={(e) => setForm({ ...safeForm, city: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="State *"
            className={`p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.state ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.state || ""}
            onChange={(e) => setForm({ ...safeForm, state: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Country *"
            className={`p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.country ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.country || ""}
            onChange={(e) => setForm({ ...safeForm, country: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Pincode *"
            className={`p-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.pincode ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
            }`}
            value={safeForm.pincode || ""}
            onChange={(e) => setForm({ ...safeForm, pincode: e.target.value })}
            required
          />

          <div className="relative">
            <Globe className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="url"
              placeholder="Website"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.website || ""}
              onChange={(e) => setForm({ ...safeForm, website: e.target.value })}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-2.5 text-blue-600" size={20} />
            <input
              type="tel"
              placeholder="Alternate Phone"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={safeForm.alternatePhone || ""}
              onChange={(e) => setForm({ ...safeForm, alternatePhone: e.target.value })}
            />
          </div>
        </div>
        
        {/* Show contact errors */}
        {Object.keys(errors).some(key => ['address', 'city', 'state', 'country', 'pincode', 'phone'].includes(key)) && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">Please fix the contact information errors above.</p>
          </div>
        )}
      </div>

      {/* Institute Type Specific Fields */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <School className="mr-2 text-blue-600" size={20} />
          {safeForm.instituteType ? `${safeForm.instituteType.charAt(0).toUpperCase() + safeForm.instituteType.slice(1)} Specific Details` : "Institute Specific Details"}
        </h3>
        {renderInstituteSpecificFields()}
      </div>
    </motion.div>
  );
} 