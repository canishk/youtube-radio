import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import HomePage from "./pages/HomePage";

import AdminLoginPage
from "./pages/admin/AdminLoginPage";

import AdminDashboard
from "./pages/admin/AdminDashboard";

import CategoriesPage
from "./pages/admin/CategoriesPage";

import SongsPage
from "./pages/admin/SongsPage";

import VideoHealthPage
from "./pages/admin/VideoHealthPage";

import AdminLayout
from "./layouts/AdminLayout";

import AdminProtectedRoute
from "./components/AdminProtectedRoute";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/nimda"
          element={
            <AdminLoginPage />
          }
        />

        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >

          <Route
            path="/admin/dashboard"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/categories"
            element={
              <CategoriesPage />
            }
          />

          <Route
            path="/admin/songs"
            element={
              <SongsPage />
            }
          />

          <Route
            path="/admin/video-health"
            element={
              <VideoHealthPage />
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );
}

export default App;