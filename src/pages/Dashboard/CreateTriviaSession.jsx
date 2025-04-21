import { auth, db } from "../../../app/server/api/firebase/firebaseConfig"
import { useEffect, useState } from "react";

import { deleteDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function CreateTriviaSession(){

    const [userId, setUserId] = useState(null);
    
    useEffect(() => {
        //grabbing users id
    setUserId(auth.currentUser);
    const gameList = grabUserData();
    console.log("Current User", auth.currentUser);
    console.log("User Id:", userId);
    console.log("list of games", gameList);

    }, []);

    
    
    //grab user Data
    const grabUserData = async () => {
        try {
            
            const userGameInfo = collection(db, "games");
            const q = query(userGameInfo, where("user_id", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            console.log("query",querySnapshot);



        } catch(err){
            console.log("error: ", err)
        }

    }

    grabUserData()



    //grabs users games




    return (
        <div className="flex w-full justify-center mt-20">
            <h1>Create Trivia Session!</h1>
            <div className="mt-3">



            </div>
        </div>
    )
}