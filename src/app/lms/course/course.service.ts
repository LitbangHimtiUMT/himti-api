import axios from "axios";
import { ErrorApp } from "../../../utils/http-error";
import { MESSAGE_CODE } from "../../../utils/error-code";

export const evaluateCourseAnswer = async (
  moduleId: string,
  moduleTitle: string,
  question: string,
  criteria: string,
  answer: string
) => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new ErrorApp(
      "Replicate API Token is not configured in the environment",
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }

  const prompt = `
You are an expert programming lecturer/instructor grading a student's answer for a learning module.
Module ID: ${moduleId}
Module Title: ${moduleTitle}
Question/Challenge: ${question}
Grading Criteria: ${criteria}

Student's Answer:
"""
${answer}
"""

Evaluate the student's answer. Provide:
1. A numerical score (0 to 100) as an integer. To pass, the student needs at least 75. Be fair but strict based on the criteria.
2. A clear, constructive feedback in Indonesian. Address the student directly. Explain why they got the score, point out any syntax errors, and how to improve if they didn't pass, or praise them if they passed.
3. A boolean "isPassed" which is true if score >= 75, else false.

Output Schema (must be exact JSON, no markdown code blocks, no additional text):
{
  "score": number,
  "feedback": "string",
  "isPassed": boolean
}
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
      throw new ErrorApp(
        `Replicate prediction failed with status: ${prediction.status}`,
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }

    const output = prediction.output;
    if (!output) {
      throw new ErrorApp(
        "Failed to get output from AI model",
        500,
        MESSAGE_CODE.INTERNAL_SERVER_ERROR
      );
    }

    const resultText = Array.isArray(output) ? output.join("") : output;
    const cleanJson = resultText.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("AI Evaluation Service Error:", error?.response?.data || error.message);
    if (error instanceof ErrorApp) {
      throw error;
    }
    throw new ErrorApp(
      `Evaluation error: ${error?.response?.data?.detail || error.message}`,
      500,
      MESSAGE_CODE.INTERNAL_SERVER_ERROR
    );
  }
};
