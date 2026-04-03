import QuestionFc from "./questionFc";
import QuestionMc from "./questionMc";
import QuestionSort from "./questionsort";


export default function specatorView ({
    sessionCode,
    curentQuestion,
    questionType
}) {


    return (
        <div className="w-full">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex justify-center">
                {currentQuestion?.type === "multipleChoice" && (
                  <QuestionMc
                    choices={labels}
                    selectedIndexes={selectedIndexes}
                    setSelectedIndexes={setSelectedIndexes}
                  />
                )}
        
                {currentQuestion?.type === "freeResponse" && (
                  <QuestionFc setAnswer={setPlayerFrAnswer} playerAnswer={playerFrAnswer} />
                )}
        
                {currentQuestion?.type === "sort" && <QuestionSort />}
              </div>
           
              
            </div>
          </div>
        </div>
    )
}