import { useLocation} from "react-router-dom";

export default function EditQuestion() {

    console.log("Editing a question");
    const location = useLocation();
    const questionData = location.state?.questionData;
    console.log(questionData);


    return(
        <div className="flex justify-items-center">
            <p>Edit Question: {questionData.question}</p>

        </div>
    )
}