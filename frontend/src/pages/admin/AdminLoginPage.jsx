import { useState } from "react";

import api from "../../services/api";

function AdminLoginPage() {

  const [accessKey,
    setAccessKey] =
    useState("");

  const [error,
    setError] =
    useState("");

  async function handleLogin() {

    try {

      await api.post(
        "/admin/auth",
        {
          access_key:
            accessKey
        }
      );

      sessionStorage.setItem(
        "admin_authenticated",
        "true"
      );

      window.location.href =
        "/admin/dashboard";

    } catch {

      setError(
        "Invalid access key"
      );
    }
  }

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
      "
    >

      <div
        className="
          bg-slate-900
          p-8
          rounded-xl
          w-96
        "
      >

        <h1
          className="
            text-2xl
            font-bold
            mb-4
          "
        >
          Admin Login
        </h1>

        <input
          type="password"
          value={accessKey}
          onChange={(e) =>
            setAccessKey(
              e.target.value
            )
          }
          placeholder="Access Key"
          className="
            w-full
            p-2
            rounded
            text-black
          "
        />

        {error && (
          <p
            className="
              text-red-500
              mt-2
            "
          >
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="
            mt-4
            bg-red-600
            px-4
            py-2
            rounded
          "
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default AdminLoginPage;