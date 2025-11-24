// Extracts institute ID from JWT stored in localStorage
export const getInstituteIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload._id; // make sure your JWT contains _id
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};
