


export default function Gamecard({ game, confirmDelete, editGame }) {

        
    return (

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  {/* Left content */}
  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900">
      {game.name}
    </h3>

    {game.description && (
      <p className="mt-1 text-sm text-gray-600">
        {game.description}
      </p>
    )}

    <div className="mt-2 text-sm text-gray-500">
      Rounds: <span className="font-medium text-gray-700">
        {game.numberRounds || "Unknown"}
      </span>
    </div>
  </div>

  {/* Actions */}
  <div className="flex flex-col gap-2 shrink-0">
    <button
      onClick={() => editGame(game)}
      className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-600 transition"
    >
      Edit
    </button>

    <button
      onClick={() => confirmDelete(game)}
      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
    >
      Delete
    </button>
  </div>
</div>
    )

}