// normalizer of questions documents for multiple choice and free response question types
export function toWireQuestion(doc) {
  const {
    id,
    answer,
    points,
    question,
    questionNumber,
    questionType,
    roundId,
    mcChoices: mcChoicesTop,
    mcAnswers: mcAnswersTop,
  } = doc;
  console.log("normalizing data:", doc);

  const isArray = (v) => Array.isArray ? Array.isArray(v) : Object.prototype.toString.call(v) === "[object Array]";

  if (questionType === "multipleChoice") {
    const ansObj = (answer && typeof answer === "object") ? answer : {};

    const rawChoices = isArray(ansObj.mcChoices) ? ansObj.mcChoices
      : isArray(mcChoicesTop) ? mcChoicesTop
        : [];
    const rawCorrect = isArray(ansObj.mcAnswers) ? ansObj.mcAnswers
      : isArray(mcAnswersTop) ? mcAnswersTop
        : [];



    const choices = rawChoices.map((label, i) => ({
      id: String.fromCharCode(65 + i), // "A","B","C","D",...
      label,
    }));
    console.log("choices after normalized", choices);

    const correct = rawCorrect
      .map((ans) => {
        const isLetter = typeof ans === "string" && /^[A-Z]$/.test(ans);
        if (isLetter) return ans;
        const found = choices.find((c) => c.label === ans);
        return found ? found.id : null;
      })
      .filter(Boolean);

    return {
      id,
      type: "multipleChoice",
      text: question,
      number: questionNumber,
      points,
      roundId,
      choices,
      correct,
    };
  }

  // freeResponse
  return {
    id,
    type: "freeResponse",
    text: question,
    number: questionNumber,
    points,
    roundId,
    correctText: typeof answer === "string" ? answer : undefined,
  };
}