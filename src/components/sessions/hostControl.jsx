

export default function hostControl() {

    const handleChangeQuestion = () => {
        console.log("The host wants to change the question");

        //change the state of question number

        
    }


    return(
        <div>
            <p>This is the host control </p>
            <div className="flex justify-between">
                <button>Next Question</button>
                <button>Previous Question</button>
                <button>End Round</button>

            </div>

        </div>
    )
}