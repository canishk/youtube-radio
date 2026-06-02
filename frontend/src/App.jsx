import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { useEffect } from "react";
import { getPublicConfig } from "./services/configApi";

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

  useEffect(() => {

    function setMetaTag(name, value) {
      if (!value) {
        return;
      }
      let element = document.head.querySelector(
        `meta[name="${name}"]`
      );
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    }

    function setMetaProperty(property, value) {
      if (!value) {
        return;
      }
      let element = document.head.querySelector(
        `meta[property="${property}"]`
      );
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    }

    async function loadConfig() {

      try {

        const config =
          await getPublicConfig();

        if (config.site_title) {
          document.title = config.site_title;
        }

        setMetaTag("description", config.meta_description);
        setMetaTag("keywords", config.meta_keywords);
        setMetaTag("author", config.meta_author);
        setMetaProperty(
          "og:title",
          config.og_title || config.site_title
        );

      } catch (error) {

        console.error(error);
      }
    }

    loadConfig();

  }, []);

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