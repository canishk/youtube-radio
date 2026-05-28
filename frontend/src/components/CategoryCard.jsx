function CategoryCard({ category, onSelect }) {
  return (
    <div
      onClick={() => onSelect(category)}
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        p-5
        cursor-pointer
        hover:bg-slate-800
        transition
      "
    >
      <h2 className="text-xl font-semibold">
        {category.name}
      </h2>

      <p className="text-slate-400 mt-2">
        {category.description}
      </p>

      <button
        className="
          mt-4
          bg-red-600
          hover:bg-red-700
          px-4
          py-2
          rounded-lg
        "
      >
        Listen Now
      </button>
    </div>
  );
}

export default CategoryCard;