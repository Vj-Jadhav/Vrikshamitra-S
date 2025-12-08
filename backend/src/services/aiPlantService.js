/* eslint-disable no-unused-vars */
/**
 * Mock AI Plant Service
 * Simulates analyzing a plant image for health and growth.
 * Replace this with actual API integration (e.g., Kindwise) in production.
 */

export const analyzePlantImage = async (imagePath) => {
    console.log(`Analyzing plant image at: ${imagePath}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock analysis data
    // Randomize slightly for demo purposes
    const isHealthy = Math.random() > 0.2;

    if (isHealthy) {
        return {
            health: "Healthy",
            message: "Your plant is looking vibrant and healthy! Keep up the good work.",
            growthFactor: 0.05, // 5% growth
            disease: null,
            confidence: 0.98
        };
    } else {
        return {
            health: "Needs Attention",
            message: "The plant shows some signs of mild dehydration. Ensure it gets enough water.",
            growthFactor: 0.01, // 1% growth
            disease: "Dehydration",
            confidence: 0.85
        };
    }
};;

