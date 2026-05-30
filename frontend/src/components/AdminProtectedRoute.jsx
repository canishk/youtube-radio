import { Navigate } from "react-router-dom";

function AdminProtectedRoute({
  children
}) {

  const authenticated =
    sessionStorage.getItem(
      "admin_authenticated"
    );

  if (!authenticated) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default AdminProtectedRoute;