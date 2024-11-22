//homepage for now
import Auth from "../../app/server/auth/authentication"
import jedi from "../public/images/jedi.small.jpg";


export default function Home() {


    return (
        <div className="flex flex-row align-top h-full w-full">

            <div className='w-1/2 content-center self-center justify-items-center pr-10 mr-10'>
                <img className="rounded-full" src={jedi} />
            </div>
            <div className='w-1/2 content-center self-center justify-items-center pl-10 ml-10'>

                <Auth></Auth>
            </div>

        </div>

    )
}