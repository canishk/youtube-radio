import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { lazy, Suspense, useEffect } from "react";
import { getPublicConfig } from "./services/configApi";

import HomePage from "./pages/HomePage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const SongsPage = lazy(() => import("./pages/admin/SongsPage"));
const VideoHealthPage = lazy(() => import("./pages/admin/VideoHealthPage"));

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

      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
            Loading…
          </div>
        }
      >
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
      </Suspense>

    </BrowserRouter>

  );
}

export default App;