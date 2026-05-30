import { useState } from "react";

function CategoryForm({
  initialData,
  onSubmit,
  onCancel
}) {

  const [id, setId] =
    useState(
      initialData?.id || ""
    );

  const [name, setName] =
    useState(
      initialData?.name || ""
    );

  const [description,
    setDescription] =
    useState(
      initialData?.description || ""
    );

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    await onSubmit({
      id,
      name,
      description,
      thumbnail: "",
      auto_mode: "time-aware"
    });
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="
        bg-slate-900
        p-4
        rounded-lg
      "
    >

      <div className="mb-3">

        <label>
          Category ID
        </label>

        <input
          value={id}
          onChange={(e) =>
            setId(e.target.value)
          }
          disabled={!!initialData}
          className="
            w-full
            p-2
            mt-1
            rounded
            text-black
          "
        />

      </div>

      <div className="mb-3">

        <label>
          Name
        </label>

        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="
            w-full
            p-2
            mt-1
            rounded
            text-black
          "
        />

      </div>

      <div className="mb-3">

        <label>
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="
            w-full
            p-2
            mt-1
            rounded
            text-black
          "
        />

      </div>

      <div className="flex gap-3">

        <button
          type="submit"
          className="
            bg-green-600
            px-4
            py-2
            rounded
          "
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="
            bg-slate-700
            px-4
            py-2
            rounded
          "
        >
          Cancel
        </button>

      </div>

    </form>
  );
}

export default CategoryForm;