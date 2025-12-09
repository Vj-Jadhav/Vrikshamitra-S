import NGO from "../models/NGO.js";
import PlantingRequest from "../models/PlantingRequest.js";
import Event from "../models/Event.js";

// Login NGO
export const loginNGO = async (req, res) => {
    try {
        const { darpanId, pincode } = req.body;

        // Direct check - no password hashing for MVP as per plan
        const ngo = await NGO.findOne({ darpanId });

        if (!ngo) {
            return res.status(404).json({ message: "NGO not found with this Darpan ID" });
        }

        if (ngo.pincode !== pincode) {
            return res.status(401).json({ message: "Invalid Pincode for this NGO" });
        }

        if (ngo.status !== 'active') {
            return res.status(403).json({ message: "Your account is pending approval or suspended." });
        }

        // In a real app, we'd verify password here too, but user prompt emphasized DarpanID + Pincode login.
        // If the schema has password, we should probably check it if sent, but let's stick to the prompt's "DARPAN ID and PINCODE" flow.
        // For now, returning the NGO object is enough for the frontend to store state.

        res.status(200).json({
            message: "Login successful",
            ngo: {
                _id: ngo._id,
                name: ngo.name,
                darpanId: ngo.darpanId,
                pincode: ngo.pincode
            }
        });

    } catch (error) {
        console.error("NGO Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Register NGO
export const registerNGO = async (req, res) => {
    try {
        const { name, darpanId, pincode, password, description, location, contactPerson, contactEmail, contactPhone } = req.body;

        // Validate required fields
        if (!name || !darpanId || !pincode || !password || !contactEmail) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        // Check if NGO already exists
        const existingNGO = await NGO.findOne({ $or: [{ darpanId }, { email: contactEmail }] });
        if (existingNGO) {
            return res.status(400).json({ success: false, message: "NGO with this Darpan ID or Email already exists" });
        }

        // Create new NGO
        const newNGO = new NGO({
            name,
            darpanId,
            pincode,
            password, // Note: In production, hash this password!
            description: description || "New NGO",
            location: location || "India",
            contactPerson: contactPerson || "Admin",
            contactEmail,
            contactPhone: contactPhone || "",
            status: 'pending' // pending approval
        });

        await newNGO.save();

        res.status(201).json({
            success: true,
            message: "Registration successful! Please wait for government approval.",
            data: {
                _id: newNGO._id,
                name: newNGO.name,
                status: newNGO.status
            }
        });

    } catch (error) {
        console.error("Error in registerNGO:", error);
        res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
};

// Get Pending Requests for NGO's Pincode
export const getPendingRequests = async (req, res) => {
    try {
        const { pincode } = req.query; // Passed from frontend state

        if (!pincode) {
            return res.status(400).json({ message: "Pincode is required" });
        }

        // 1. Fetch old-style PlantingRequests
        const requests = await PlantingRequest.find({
            pincode: pincode,
            status: 'pending',
            facultyStatus: 'accepted'
        }).lean();

        // 2. Fetch new-style Events (Request to NGO creates these)
        // We need to find events that are pending and belong to institutes in this pincode
        // Since Event doesn't have pincode, we populate instituteId
        const pendingEvents = await Event.find({
            status: 'pending',
            // Ensure it's a request type event (created by institute, waiting for NGO)
            // usually these have targetId or explicitly waiting
        })
            .populate('instituteId', 'pincode instituteName name')
            .lean();

        // Filter events by pincode and normalize structure
        const normalizedEvents = pendingEvents
            .filter(event => event.instituteId && (event.instituteId.pincode == pincode))
            .map(event => ({
                _id: event._id, // Use event ID as request ID
                type: 'event_request', // Marker
                instituteName: event.instituteName,
                treeCount: event.plannedTrees || 0,
                treeType: 'Mixed', // Default or parse from title/desc
                createdAt: event.createdAt,
                // Add specific fields needed for acceptance
                isEventModel: true,
                targetId: event.targetId
            }));

        // Combine
        const combined = [...requests, ...normalizedEvents];

        // Sort by date desc
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(combined);
    } catch (error) {
        console.error("Fetch Pending Requests Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept Request & Create Event
// Accept Request & Create Event (Handles both PlantingRequest and Event)
export const acceptRequest = async (req, res) => {
    try {
        const { requestId, ngoId } = req.body;

        const ngo = await NGO.findById(ngoId);
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        // Check if this ID belongs to an existing Event (New Flow)
        const existingEvent = await Event.findById(requestId);
        if (existingEvent) {
            if (existingEvent.status !== 'pending') {
                return res.status(400).json({ message: "Event is already processed" });
            }

            existingEvent.status = 'approved';
            existingEvent.ngoId = ngo._id;
            existingEvent.ngoName = ngo.name;
            // existingEvent.deliveryStatus is already 'pending' by default

            await existingEvent.save();
            return res.status(200).json({ message: "Request accepted successfully", event: existingEvent });
        }

        // Fallback to Old Flow (PlantingRequest)
        const request = await PlantingRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: "Request is not pending" });
        }

        // Create Event
        const newEvent = new Event({
            title: `${request.treeType} Plantation Drive`,
            description: `Plantation drive for ${request.treeCount} ${request.treeType} trees requested by ${request.instituteName}`,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
            venue: `${request.instituteName} Campus`,
            instituteId: request.instituteId,
            instituteName: request.instituteName,
            ngoId: ngo._id,
            ngoName: ngo.name,
            requestId: request._id,
            plannedTrees: request.treeCount,
            itemsRequested: `${request.treeCount} ${request.treeType} Soaplings`,
            status: 'approved', // Automatically approved as it's a mutual agreement
            deliveryStatus: 'pending',
            createdBy: ngo._id, // Technicality: NGO "creates" the official event by accepting
            createdByName: ngo.name,
            assignedFaculty: request.assignedFaculty,
            registrations: []
        });

        await newEvent.save();

        // Update Request
        request.status = 'accepted';
        request.acceptedBy = ngo._id;
        request.eventId = newEvent._id;
        await request.save();

        res.status(201).json({ message: "Request accepted and Event created", event: newEvent });

    } catch (error) {
        console.error("Accept Request Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Mark Delivered
export const markOrderDelivered = async (req, res) => {
    try {
        const { eventId } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.deliveryStatus = 'delivered';
        await event.save();

        res.status(200).json({ message: "Order marked as delivered", event });
    } catch (error) {
        console.error("Mark Delivered Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get NGO Events
export const getNGOEvents = async (req, res) => {
    try {
        const { ngoId } = req.params;
        const events = await Event.find({ ngoId: ngoId }).sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (error) {
        console.error("Get NGO Events Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get available NGOs by pincode
export const getAvailableNGOs = async (req, res) => {
    try {
        const { pincode } = req.query;

        if (!pincode) {
            return res.status(400).json({ success: false, message: "Pincode is required" });
        }

        const ngos = await NGO.find({
            pincode: pincode,
            status: 'active'
        }).select('name email phone location pincode');

        res.status(200).json({ success: true, data: ngos });
    } catch (error) {
        console.error("Error fetching available NGOs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
