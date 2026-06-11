import { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  refreshCategoryThumbnail,
} from "../../services/adminApi";

import CategoryForm from "../../components/admin/CategoryForm";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const data = await getCategories();
    setCategories(data);
  }

  async function handleCreate(payload) {
    await createCategory(payload);
    setShowForm(false);
    await loadCategories();
  }

  async function handleUpdate(payload) {
    await updateCategory(editingCategory.id, payload);
    setEditingCategory(null);
    await loadCategories();
  }

  async function handleDelete(categoryId) {
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) {
      return;
    }
    await deleteCategory(categoryId);
    await loadCategories();
  }

  async function handleToggle(categoryId) {
    await toggleCategory(categoryId);
    await loadCategories();
  }

  async function handleRefreshThumbnail(categoryId) {
    const updated = await refreshCategoryThumbnail(categoryId);

    if (!updated?.thumbnail) {
      window.alert("No playable songs found to assign a thumbnail.");
    }

    await loadCategories();
  }

  return (
    <div className="p-6">
      {showForm && (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingCategory && (
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleUpdate}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {categories.map((category) => (
        <div
          key={category.id}
          className={`
            p-4 rounded-lg mb-3
            ${category.enabled ? "bg-slate-900" : "bg-slate-600 opacity-40"}
          `}
        >
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h3>{category.name}</h3>
              <div className="mt-1 mb-2">

            <span className={
                category.enabled
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {
                category.enabled
                  ? "Enabled"
                  : "Disabled"
              }
            </span>
              </div>
              <p>{category.description}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRefreshThumbnail(category.id)}
                  className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700"
                >
                  Refresh thumbnail
                </button>
                <button
                  onClick={() =>
                    handleToggle(
                      category.id
                    )
                  }
                  className={
                    category.enabled
                      ? "bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700"
                      : "bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                  }
                >

                  {
                    category.enabled
                      ? "Disable"
                      : "Enable"
                  }

                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {category.thumbnail ? (
              <img
                src={category.thumbnail}
                alt=""
                className="w-16 h-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div
                className="h-16 w-16 shrink-0 rounded-lg bg-slate-800"
                aria-hidden
              />
            )}
          </div>
        </div>
      ))}

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 px-4 py-2 rounded mb-4 hover:bg-blue-700"
      >
        Add Category
      </button>
    </div>
  );
}

export default CategoriesPage;