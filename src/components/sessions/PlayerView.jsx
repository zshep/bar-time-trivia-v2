import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";


export default function PlayerView({
    currentQuestion,
    questionType,
    questionText,
    mcChoices,
    frAnswer,
    setFrAnswer,
    setPlayerChoice,
    submitAnswer,
}) {
    return (

        <div className="flex flex-col w-full items-center">
          <p>This is PlayerView</p>
              
              <div className="">
                
                <div className="flex justify-center mt-4">
        
                  {questionType === "freeResponse" && (
                    <QuestionFc
                      answer={frAnswer}
                      setAnswer={setFrAnswer}
                    />
                  )}
                  {questionType === "multipleChoice" && currentQuestion && (
                    <QuestionMc
                      choices={mcChoices}
                      playerChoice={mcPlayerChoice}
                      setPlayerChoice={setMcPlayerChoice}
                    />
                  )}
                  {questionType === "sort" && (
                    <QuestionSort />
                  )}
                </div>
        
                <div className="flex justify-center mt-10 ">
        
                  <button onClick={() => submitAnswer()} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                    Submit Answer
                  </button>
                </div>
        
              </div>
        
        
        
        
            </div>
    )
}