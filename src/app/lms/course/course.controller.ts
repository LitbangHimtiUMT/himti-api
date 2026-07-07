import { Request, Response } from "express";
import { evaluateCourseAnswer } from "./course.service";

export const evaluateCourseController = async (req: Request, res: Response) => {
  const { moduleId, moduleTitle, question, criteria, answer } = req.body as {
    moduleId?: string;
    moduleTitle?: string;
    question?: string;
    criteria?: string;
    answer?: string;
  };

  if (!moduleId || !moduleTitle || !question || !criteria || !answer) {
    return res.status(400).json({
      message: "moduleId, moduleTitle, question, criteria, and answer are required",
    });
  }

  const result = await evaluateCourseAnswer(
    moduleId,
    moduleTitle,
    question,
    criteria,
    answer
  );

  return res.json(result);
};
