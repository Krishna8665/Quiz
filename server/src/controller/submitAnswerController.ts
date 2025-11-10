import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../models/createQuiz";
import Round from "../models/createRounds";
import Team from "../models/team";
import Question from "../models/question";
import QuizHistory from "../models/quizHistory";

interface SubmitRequest extends Request {
  body: {
    quizId: string;
    roundId: string;
    // For normal rounds: single answer
    teamId?: string;
    questionId: string;
    givenAnswer?: string | number;
    isPassed?: boolean;
    // For estimation round: multiple answers
    answers?: { teamId: string; givenAnswer: number | string }[];
  };
}

export const submitAnswer = async (req: SubmitRequest, res: Response) => {
  try {
    console.log("=== Submit Answer Request Received ===");
    console.log("Request Body:", req.body);

    const {
      quizId,
      roundId,
      questionId,
      teamId,
      givenAnswer,
      isPassed = false,
      answers,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId))
      return res.status(400).json({ message: "Invalid quizId" });
    if (!mongoose.Types.ObjectId.isValid(roundId))
      return res.status(400).json({ message: "Invalid roundId" });

    const quiz = await Quiz.findById(quizId).populate("teams");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ message: "Round not found" });

    const question = await Question.findById(questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const rules = round.rules;

    //  ESTIMATION ROUND (batch)
    if (round.category === "estimation round") {
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res
          .status(400)
          .json({ message: "Estimation round requires answers array" });
      }

      const submittedTeams: any[] = [];

      for (const ans of answers) {
        const { teamId, givenAnswer } = ans;
        if (!mongoose.Types.ObjectId.isValid(teamId)) continue;
        const team = await Team.findById(teamId);
        if (!team) continue;

        const numericAnswer = Number(givenAnswer);
        if (isNaN(numericAnswer)) continue;

        let history = await QuizHistory.findOne({ quizId, roundId, teamId });
        const answerObj = {
          questionId: new mongoose.Types.ObjectId(question._id),
          givenAnswer: numericAnswer,
          pointsEarned: 0, // will calculate later
          isCorrect: false,
          isPassed: false,
        };

        if (!history) {
          history = await QuizHistory.create({
            quizId,
            roundId,
            teamId,
            answers: [answerObj],
            totalPoints: 0,
          });
        } else {
          history.answers.push(answerObj);
          await history.save();
        }

        submittedTeams.push({ teamId, numericAnswer });
      }

      // CALCULATE CLOSEST ANSWER 
      if (submittedTeams.length === quiz.teams.length) {
        const correctAnswerNum = Number(
          question.shortAnswer?.text ?? question.correctAnswer
        );
        if (!isNaN(correctAnswerNum)) {
          const differences = submittedTeams.map((t) => ({
            ...t,
            difference: Math.abs(correctAnswerNum - t.numericAnswer),
          }));

          const minDiff = Math.min(...differences.map((d) => d.difference));
          const winners = differences.filter((d) => d.difference === minDiff);
          const pointsToAward = Number(rules.points || 0);

          for (const winner of winners) {
            const history = await QuizHistory.findOne({
              quizId,
              roundId,
              teamId: winner.teamId,
            });
            if (history) {
              const index = history.answers.findIndex(
                (a) => a.questionId.toString() === question._id.toString()
              );
              if (index !== -1) {
                history.answers[index].pointsEarned = pointsToAward;
                history.answers[index].isCorrect = true;
                history.totalPoints += pointsToAward;
                await history.save();
              }
            }

            const team = await Team.findById(winner.teamId);
            if (team) {
              team.points = (team.points || 0) + pointsToAward;
              await team.save();
            }
          }

          return res.status(200).json({
            message: "Estimation answers submitted and scored",
            correctAnswer: correctAnswerNum,
            winners: winners.map((w) => ({
              teamId: w.teamId,
              givenAnswer: w.numericAnswer,
              difference: w.difference,
              pointsAwarded: pointsToAward,
            })),
          });
        }
      }

      return res.status(200).json({
        message: "Estimation answers submitted, waiting for remaining teams",
        teamsSubmitted: submittedTeams.length,
        totalTeams: quiz.teams.length,
      });
    }

    //  NORMAL ROUNDS (MCQ) 
    if (!teamId || !givenAnswer)
      return res
        .status(400)
        .json({ message: "teamId and givenAnswer required for normal rounds" });
    if (!mongoose.Types.ObjectId.isValid(teamId))
      return res.status(400).json({ message: "Invalid teamId" });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const correctAnswerStr = question.correctAnswer?.toString();
    const submittedAnswerStr = givenAnswer.toString();

    if (!correctAnswerStr)
      return res
        .status(400)
        .json({ message: "Question does not have a correct answer" });

    let pointsEarned = 0;
    let isCorrect = false;

    if (submittedAnswerStr === correctAnswerStr) {
      isCorrect = true;
      pointsEarned = isPassed
        ? Number(rules.passedPoints || 0)
        : Number(rules.points || 0);
    } else {
      isCorrect = false;
      pointsEarned =
        rules.enableNegative && !isPassed
          ? -Number(rules.negativePoints || 0)
          : 0;
    }

    team.points = (team.points || 0) + pointsEarned;
    await team.save();

    const answerObj = {
      questionId: new mongoose.Types.ObjectId(question._id),
      givenAnswer,
      pointsEarned,
      isCorrect,
      isPassed,
    };

    let history = await QuizHistory.findOne({ quizId, roundId, teamId });
    if (!history) {
      history = await QuizHistory.create({
        quizId,
        roundId,
        teamId,
        answers: [answerObj],
        totalPoints: pointsEarned,
      });
    } else {
      history.answers.push(answerObj);
      history.totalPoints += pointsEarned;
      await history.save();
    }

    return res.status(200).json({
      message: "Answer submitted successfully",
      pointsEarned,
      isCorrect,
      teamPoints: team.points,
    });
  } catch (err: any) {
    console.error("SubmitController Error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
