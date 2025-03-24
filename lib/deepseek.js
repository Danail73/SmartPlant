import axios from "axios";

const HUGGING_FACE_API_KEY = "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"; // Keep this secure

export const fetchAIResponse = async (plantName) => {
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            {
                inputs: `Provide plant care tips for ${plantName} in the following JSON format: {
                "watering": "Watering tips here",
                "temperature": "Temperature tips here",
                "light": "Light tips here",
                "soil": "Soil tips here"
              }` },
            {
                headers: {
                    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const tipsJsonString = response.data.choices[0].message.content;
        const tips = JSON.parse(tipsJsonString);
        return tips;
    } catch (error) {
        console.error("Hugging Face API error:", error.response?.data || error.message);
        return "Error fetching response!";
    }
};

