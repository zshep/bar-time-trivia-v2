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
    mcChoices,
    mcAnswers,
  } = doc;

  if (questionType === "multipleChoice") {
    const labels = Array.isArray(mcChoices) ? mcChoices : [];
    const choices = labels.map((label, i) => ({
      id: String.fromCharCode(65 + i), // "A","B","C",...
      label,
    }));

    const correct = (mcAnswers || [])
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