import curriculum from "./curriculum.json";
import baseQuestions from "./questions.json";
import simulatorExpansion from "./simulator-expansion.json";
const questions: typeof baseQuestions = [...baseQuestions, ...simulatorExpansion];
export { curriculum, questions };
