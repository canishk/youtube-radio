import { Link, Outlet } from "react-router-dom";

function AdminLayout() {

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex">

        <aside
          className="
            w-64
            bg-slate-900
            min-h-screen
            p-4
          "
        >

          <h2
            className="
              text-xl
              font-bold
              mb-6
            "
          >
            Admin
          </h2>

          <nav
            className="
              flex
              flex-col
              gap-4
            "
          >

            <Link to="/admin/dashboard">
              Dashboard
            </Link>

            <Link to="/admin/categories">
              Categories
            </Link>

            <Link to="/admin/songs">
              Songs
            </Link>

            <Link to="/admin/video-health">
              Video Health
            </Link>

          </nav>

        </aside>

        <main className="flex-1">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;