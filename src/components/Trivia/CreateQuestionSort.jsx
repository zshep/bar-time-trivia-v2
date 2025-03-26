import { useState } from "react";

export default function CreateQuestionSort() {
    


    return(
        <div className="flex flex-col justify-center">
        
       <div>
        <p>Make order for options</p>
       </div>
       
       <div className="flex flex-col  ">
                <p className="text-lg text-wrap text-center ">Answer Choices</p>
                <p>Note: Put the correct order in descending order</p>
                <input
                    className="border border-black text-center my-1"
                    id="mcAnswer1"
                    placeholder="Answer choice 1"/>
                <input
                    className="border border-black text-center my-1"
                    id="mcAnswer2"
                    placeholder="Answer choice 2"
                     />
                <input
                    className="border border-black text-center my-1"
                    id="mcAnswer3"
                    placeholder="Answer choice 3" />
                <input 
                    className="border border-black text-center my-1"
                    id="mcAnswer4"
                    placeholder="Answer choice 4" />
                

            </div>
      

   </div>


    )


}