import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";


export default function HostView({
    currentQuestion,
    questionType,
    mcChoices,
    players,
    nextQuestion,
    prevQuestion,
    endRound,
}) {
    //console.log("question Type:", questionType);
    return (
        <div>
            <div className="flex flex-col w-full items-center mt-5">
                <p>This is Host View</p>


            </div>
            <div>
                <h2>{/*currentQuestion.question*/}</h2>
                {questionType === "multipleChoice" && (
                   /* <QuestionMc choices={mcChoices} />*/
                   <p>I'm a MC TAG</p>
                   
                )}
                {questionType === "freeResponse" && (
                    /*<QuestionFc /> */
                    <p>I'm a FR Section</p>
                )}
            </div>

            <div className="mt-10">
           
            <div className="flex justify-between mt-4">
                <button className="">Next Question</button>
                <button>Previous Question</button>
                <button>End Round</button>

            </div>
            </div>

        </div>

    )



}