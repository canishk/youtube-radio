import { useEffect, useState } from "react";

import {getCategories, createCategory, updateCategory, deleteCategory} from "../../services/adminApi";

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
          className="bg-slate-900 p-4 rounded-lg mb-3"
        >
          <h3>{category.name}</h3>
          <p>{category.description}</p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setEditingCategory(category)}
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
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