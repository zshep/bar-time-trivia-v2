import accident from "../public/images/accident.jpg"
export default function NotFound() {

    return(

        <div>
            <div>
                <h2>Whooops! That didn't work!</h2>
            </div>
            <div>
                <img
                    src={accident}>
                
                </img>
            </div>
        </div>
    )
}