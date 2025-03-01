export default function RoundList() {


    //grab list of round



    return (

        <div>
            <p>Rounds</p>
            <div className="border border-r-4">
                {rounds.map((round, index) => (
                    <Roundcard key={index} roundData={round} />
                ))}
            </div>

            <div>
                <button type="button" onClick={addRound}>Add Round</button> {/* Button to add a round */}
                <button type="submit">Save</button> {/* Move Save button inside form */}
            </div>
        </div>


    )
};