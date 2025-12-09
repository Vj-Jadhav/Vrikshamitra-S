import express from "express";
import { loginNGO, getPendingRequests, acceptRequest, markOrderDelivered, getNGOEvents, registerNGO, getAvailableNGOs } from "../controllers/ngoController.js";

const router = express.Router();

router.post("/login", loginNGO);
router.post("/register", registerNGO);
router.get("/requests/pending", getPendingRequests);
router.post("/requests/accept", acceptRequest);
router.post("/events/delivered", markOrderDelivered);
router.get("/events/:ngoId", getNGOEvents);
router.get("/available-ngos", getAvailableNGOs);

export default router;
