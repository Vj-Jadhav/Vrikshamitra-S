import app from "./src/app.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

// IMPORTANT: Bind to 0.0.0.0 so mobile can access backend
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
