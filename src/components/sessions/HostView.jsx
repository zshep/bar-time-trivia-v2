import QuestionMc from "./questionMc";

export default function HostView ({
    currentQuestion,
    questionType,
    mcChoices,
    players,
    nextQuestion,
    prevQuestion,
    endRound,
})
{
    return (
        <div>
            <h2>{currentQuestion.question}</h2>
            {questionType === "multipleChoice" && (
                <QuestionMc choices={mcChoices} />
            )}

        </div>

    )



}