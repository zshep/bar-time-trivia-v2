

export default function QuestionCard () {


    return(

        <div className="flex border border-black mb-2">
            <div className="border border-black">
                <p className="font-bold">Question number</p>
                <p>{}</p>
            </div>

            <div className="border border-black">
                <p className="font-bold">Question</p>
                <p>{}</p>
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