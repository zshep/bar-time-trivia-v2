

export default function QuestionCard ( { questionData, confirmDelete, editQuestion } ) {

    //console.log("question data: ", questionData);
    const questionId = questionData.id;
    //console.log("questionid:", questionData.id);

        

    return(

        <div className="flex border border-black mb-2">
            <div className="border border-black p-2 ">
                <p className="font-bold">number</p>
                <p>{questionData.questionNumber}</p>
            </div>

            <div className="border border-black p-2 w-1/2">
                <p className="font-bold">Question</p>
                <p>{questionData.question}</p>
            </div>

            <div className="border border-black p-2 ">
                <p className="font-bold">Type</p>
                <p>{questionData.questionType}</p>
            </div>

            <div className="border border-black p-2 ">
                <p className="font-bold">Points</p>
                <p>{questionData.points}</p>
            </div>
            <div className="flex flex-col">
                <button onClick={() => editQuestion(questionData)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold  text-sm">Edit</button>
                <button onClick={() => confirmDelete(questionData)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 text-sm">Delete</button>
            </div>
            
        </div>
    )
}