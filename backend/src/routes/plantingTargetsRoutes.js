// routes/plantingTargetsRoutes.js
import express from "express";
import {
  createPlantingTarget,
  getPlantingTargets,
  getPlantingTargetsByPincode
} from "../controllers/plantingTargetsController.js";

const router = express.Router();

// Debug route to check if router is working
router.get('/test-route', (req, res) => {
  res.json({ message: 'Planting targets router is working!' });
});

// Your actual routes
router.post("/create", createPlantingTarget);
router.get("/", getPlantingTargets);
router.get("/pincode/:pincode", getPlantingTargetsByPincode);

export default router;