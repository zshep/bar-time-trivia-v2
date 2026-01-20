

export default function QuestionCard ( { questionData, confirmDelete, editQuestion } ) {

    //console.log("question data: ", questionData);
    const questionId = questionData.id;
    //console.log("questionid:", questionData.id);

        

    return(

     <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    {/* Left: main info */}
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            #
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {questionData.questionNumber ?? "—"}
          </p>
        </div>

        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Question
          </p>
          <p className="text-sm text-gray-900">
            {questionData.question || "No question text"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Type
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {questionData.questionType || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Points
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {questionData.points ?? "—"}
          </p>
        </div>
      </div>
    </div>

    {/* Right: actions */}
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => editQuestion(questionData)}
        className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-600 transition"
        type="button"
      >
        Edit
      </button>

      <button
        onClick={() => confirmDelete(questionData)}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
        type="button"
      >
        Delete
      </button>
    </div>
  </div>
</div>

    )
}