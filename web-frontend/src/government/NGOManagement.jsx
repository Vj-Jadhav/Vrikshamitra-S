import React, { useEffect, useState } from "react";
import { API } from "../utils/api";
import { Check, X, Building2 } from "lucide-react";

export default function NGOManagement({ token }) {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingNGOs = async () => {
        try {
            const res = await API.get("/government/ngos/pending", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setNgos(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch NGOs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingNGOs();
    }, []);

    const handleAction = async (id, action) => {
        try {
            const endpoint = `/government/ngos/${id}/${action}`; // approve or reject
            await API.put(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from list
            setNgos(ngos.filter(n => n._id !== id));
            alert(`NGO ${action}d successfully`);
        } catch (error) {
            console.error(`Failed to ${action} NGO`, error);
            alert("Action failing");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Building2 /> NGO Approvals
            </h2>

            {loading ? (
                <p>Loading pending requests...</p>
            ) : ngos.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No pending NGO registrations found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ngos.map(ngo => (
                        <div key={ngo._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{ngo.name}</h3>
                                <p className="text-sm text-gray-500">Darpan ID: {ngo.darpanId}</p>
                                <p className="text-sm text-gray-500">Pincode: {ngo.pincode}</p>
                                <p className="text-sm text-gray-500">Email: {ngo.contactEmail}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(ngo._id, 'approve')}
                                    className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                                >
                                    <Check size={18} /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(ngo._id, 'reject')}
                                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                                >
                                    <X size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
