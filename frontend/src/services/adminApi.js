import api from "./api";

export async function getCategories() {

  const response =
    await api.get(
      "/admin/categories"
    );

  return response.data;
}

export async function createCategory(
  payload
) {

  const response =
    await api.post(
      "/admin/categories",
      payload
    );

  return response.data;
}

export async function updateCategory(
  categoryId,
  payload
) {

  const response =
    await api.put(
      `/admin/categories/${categoryId}`,
      payload
    );

  return response.data;
}

export async function deleteCategory(
  categoryId
) {

  const response =
    await api.delete(
      `/admin/categories/${categoryId}`
    );

  return response.data;
}