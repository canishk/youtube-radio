function ResumeCard({
  categoryName,
  onResume
}) {

  return (

    <div
      className="
        bg-slate-900
        border
        border-slate-700
        rounded-xl
        p-5
        mb-6
      "
    >

      <h2
        className="
          text-lg
          font-semibold
        "
      >
        Welcome Back
      </h2>

      <p
        className="
          text-slate-400
          mt-2
        "
      >
        Resume listening:
      </p>

      <p
        className="
          mt-2
          font-medium
        "
      >
        {categoryName}
      </p>

      <button
        onClick={onResume}
        className="
          mt-4
          bg-red-600
          hover:bg-red-700
          px-4
          py-2
          rounded-lg
        "
      >
        Resume Station
      </button>

    </div>
  );
}

export default ResumeCard;