import axios from "axios";
import { ErrorApp } from "../../utils/http-error";
import { MESSAGE_CODE } from "../../utils/error-code";

export const parseCVWithAIService = async (text: string) => {
  const token = process.env.REPLICATE_API_TOKEN;
  
  if (!token) {
    return new ErrorApp(
      "Replicate API Token is not configured in .env file (REPLICATE_API_TOKEN)",
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }

  const prompt = `
You are an expert resume and CV parser for IT/tech students and developers.
Analyze the following raw CV/resume text and extract the information in JSON format matching the schema below.
Ensure you:
1. Standardize skills into professional industry-standard names (e.g., "bisa react" to "React.js", "desain figma" to "UI/UX Design" and "Figma").
2. Estimate the total experience years (as integer) based on project durations, learning history, or internships.
3. Classify their primary professional tech role (e.g., Frontend Developer, Backend Developer, Mobile Developer, UI/UX Designer, Data Analyst, QA Engineer, etc.).

Output Schema (must be exact):
{
  "role": "string",
  "company": "string",
  "experienceYear": number,
  "summary": "string",
  "skills": ["string"],
  "projects": [{"title": "string", "description": "string", "url": "string"}],
  "education": [{"school": "string", "degree": "string", "year": "string"}]
}

Return ONLY the raw JSON object. Do not wrap it in markdown code blocks (\`\`\`json) or add any other conversational text.

Raw CV Text:
${text}
`;

  try {
    const url = "https://api.replicate.com/v1/models/google/gemini-2.5-flash/predictions";
    
    const response = await axios.post(
      url,
      {
        input: {
          prompt: prompt,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "wait",
        },
      }
    );

    const prediction = response.data;
    if (prediction.status !== "succeeded") {
      return new ErrorApp(
        `Replicate prediction failed with status: ${prediction.status}`,
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }

    const output = prediction.output;
    if (!output) {
      return new ErrorApp("Failed to get output from Replicate model", 500, MESSAGE_CODE.INTERNAL_SERVER_ERROR);
    }

    const resultText = Array.isArray(output) ? output.join("") : output;
    const cleanJson = resultText.trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("Replicate API Error:", error?.response?.data || error.message);
    return new ErrorApp(
      `AI Parser error: ${error?.response?.data?.detail || error.message}`,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }
};

