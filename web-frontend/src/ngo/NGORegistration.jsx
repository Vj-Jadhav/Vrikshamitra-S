import React, { useState } from "react";
import { API } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function NGORegistration() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        darpanId: "",
        pincode: "",
        password: "",
        description: "",
        location: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: ""
    });

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Auto-fetch location from Pincode
        if (name === "pincode" && value.length === 6) {
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await response.json();
                if (data[0].Status === "Success") {
                    const { District, State, Country } = data[0].PostOffice[0];
                    setForm(prev => ({
                        ...prev,
                        location: `${District}, ${State}, ${Country}`,
                        country: Country // Optional, but useful
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch pincode details", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post("/ngo/register", form);
            if (res.data.success) {
                alert("Registration Successful! Please wait for government approval before logging in.");
                navigate("/ngo/login");
            }
        } catch (error) {
            console.error("Registration Error", error);
            alert(error.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">NGO Registration</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium">NGO Name *</label>
                            <input
                                type="text" name="name" required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Darpan ID *</label>
                            <input
                                type="text" name="darpanId" required
                                placeholder="Unique Govt ID"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Pincode *</label>
                            <input
                                type="text" name="pincode" required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Password *</label>
                            <input
                                type="password" name="password" required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Contact Person</label>
                            <input
                                type="text" name="contactPerson"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Contact Email *</label>
                            <input
                                type="email" name="contactEmail" required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Contact Phone *</label>
                            <input
                                type="text" name="contactPhone" required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium">Location (City/State)</label>
                            <input
                                type="text" name="location"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400 bg-gray-100"
                                value={form.location}
                                readOnly
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium">Description</label>
                        <textarea
                            name="description"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                            rows="3"
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                        {loading ? "Registering..." : "Register NGO"}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Already registered? <a href="/ngo/login" className="text-green-600 font-semibold">Login here</a>
                </p>
            </div>
        </div>
    );
}
