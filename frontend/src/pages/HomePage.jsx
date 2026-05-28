import { useEffect, useState } from "react";

import api from "../services/api";
import CategoryCard from "../components/CategoryCard";

function HomePage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await api.get("/categories/");

      setCategories(response.data);

    } catch (error) {
      console.error("Failed to load categories", error);
    }
  }

  function handleSelectCategory(category) {
    console.log("Selected:", category);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        U-Tube Radio
      </h1>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        "
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onSelect={handleSelectCategory}
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;