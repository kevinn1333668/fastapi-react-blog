import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/About";
import NotFound from "./Pages/NotFound";
import Layout from "./Components/Layout";
import Autorization from "./Pages/Autorization";
import AdminLayout from "./Components/AdminLayout";
import DeletePost from "./Pages/DeletePost";
import ChangePost from "./Pages/ChangePost";
import AddPost from "./Pages/AddPost";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "admin", element: <Autorization /> },
  { path: "*", element: <NotFound /> },
  {
    path: "settings",
    element: <AdminLayout />,
    children: [
      { path: "delete", element: <DeletePost /> },
      { path: "change", element: <ChangePost /> },
      { path: "add", element: <AddPost /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
