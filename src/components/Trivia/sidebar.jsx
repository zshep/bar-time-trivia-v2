
export default function SideNav() {
    return (
        <div className="border border-dark h-100 w-100">
            <div>
                <ul className="nav flex-column text-center">
                    <li className="nav-item">
                        <link className="nav-link active" href="/dashboard">Home</link>
                    </li>
                    <li className="nav-item">
                        <link className="nav-link" href="/dashboard/makeTriviaSession">Make Trivia</link>
                    </li>
                    <li className="nav-item">
                        <link className="nav-link" href="/dashboard/playTrivia">Play Trivia</link>
                    </li>
                    <li className="nav-item">
                        <link
                            href="/dashboard/manageTeams">Manage Teams
                        </link>

                    </li>

                </ul>
            </div>


            <div className="d-flex justify-content-center">
              
                
            </div>

        </div>
    )
}

