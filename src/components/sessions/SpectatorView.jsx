import QuestionFc from "./questionFc";
import QuestionMc from "./questionMc";
import QuestionSort from "./questionsort";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import socket from "../../utils/socket";


export default function SpecatorView ({
    sessionCode,
    currentQuestion,
    questionType
}) {

  const labels = (currentQuestion?.choices || []).map(c => c.label);
  const currentQuestionId = currentQuestion?.id || "no-ID";
  const navigate = useNavigate();

  // end Round
    useEffect(() => {
      
      const endRoundHandler = ({ sessionCode }) => {
        console.log("The host is ending the round")
        navigate(`/session/live/${sessionCode}/end`, {
          state: {
            isHost: false,
          },
        });
      };
      socket.on('round-ended', endRoundHandler);
      return () => {
        socket.off('round-ended', endRoundHandler);
      }
  
    }, [navigate]);

    return (
        <div className="w-full">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex justify-center">
                {currentQuestion?.type === "multipleChoice" && (
                  <QuestionMc
                    choices={labels}
                   
                  />
                )}
        
                {currentQuestion?.type === "freeResponse" && (
                  <QuestionFc />
                )}
        
                {currentQuestion?.type === "sort" && <QuestionSort />}
              </div>
           
              
            </div>
          </div>
        </div>
    )
}