import { useState } from "react";
import FormControl from "../ui/FormControl";

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

        <FormControl
          value={id}
          onChange={(e) => setId(e.target.value)}
          disabled={!!initialData}
        />

      </div>

      <div className="mb-3">

        <label>
          Name
        </label>

        <FormControl
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

      </div>

      <div className="mb-3">

        <label>
          Description
        </label>

        <FormControl
          as="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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