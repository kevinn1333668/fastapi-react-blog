import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/About";
import NotFound from "./Pages/NotFound";
import Layout from "./Components/Layout";
import Autorization from "./Pages/Autorization";
import AdminLayout from "./Components/AdminLayout";
import ErrorBoundary from "./Components/ErrorBoundary";
import { postsLoader } from "./api/posts";
import { authAction } from "./Pages/authAction";
import CreatePost from "./Pages/CreatePost";
import { createPostAction } from "./Pages/createPostAction";
import AdminPosts from "./Pages/AdminPosts";
import ChangePost from "./Pages/ChangePost";
import { deletePostAction } from "./Pages/deletePostAction";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: postsLoader,
        errorElement: <ErrorBoundary />,
      },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "admin", element: <Autorization />, action: authAction },
  { path: "*", element: <NotFound /> },
  {
    path: "settings",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminPosts />,
        loader: postsLoader,
        action: deletePostAction,
      },
      { path: "change", element: <ChangePost /> },
      { path: "add", element: <CreatePost />, action: createPostAction },
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
