//homepage for now
import Auth from "../../app/server/auth/authentication"
import jedi from "../public/images/jedi.small.jpg";


export default function Home() {


    return (
        <div className="flex flex-row align-top h-full w-full">

            <div className='w-1/2 content-center self-center justify-items-center ml-20'>
                <img className="rounded-full" src={jedi} width={160} />
                <div className="atma-thin w-1/2 mt-6">
                    <p>Bar Style Trivia in the palm of your hand. Log in to create trivia grames, run a trivia session, or to play live using your player profile</p>

                </div>
            </div>
            <div className='w-1/2 content-center self-center justify-items-center mr-20'>

                <Auth></Auth>
            </div>

        </div>

    )
}