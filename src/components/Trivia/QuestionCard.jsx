

export default function QuestionCard ( { questionData } ) {

    console.log("question data: ", questionData);

    return(

        <div className="flex border border-black mb-2">
            <div className="border border-black">
                <p className="font-bold">Question number</p>
                <p>{questionData.questionNumber}</p>
            </div>

            <div className="border border-black">
                <p className="font-bold">Question</p>
                <p>{questionData.question}</p>
            </div>

            <div className="border border-black">
                <p className="font-bold">Answer</p>
                <p>{}</p>
            </div>

            <div className="border border-black">
                <p className="font-bold">Question Type</p>
                <p>{}</p>
            </div>

            <div className="border border-black">
                <p className="font-bold">Points</p>
                <p>{}</p>
            </div>
            
        </div>
    )
}