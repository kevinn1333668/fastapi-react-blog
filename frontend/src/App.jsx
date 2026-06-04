import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/About";
import NotFound from "./Pages/NotFound";
import Layout from "./Components/Layout";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ErrorBoundary from "./Components/ErrorBoundary";
import { homePostsLoader, adminPostsLoader, changePostLoader } from "./api/posts";
import { authAction } from "./Pages/authAction";
import { registerAction } from "./Pages/registerAction";
import CreatePost from "./Pages/CreatePost";
import { createPostAction } from "./Pages/createPostAction";
import AdminPosts from "./Pages/AdminPosts";
import ChangePost from "./Pages/ChangePost";
import { deletePostAction } from "./Pages/deletePostAction";
import { changePostAction } from "./Pages/changePostAction";
import ProtectedRoute from "./Components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    action: authAction,
  },
  {
    path: "/register",
    element: <Register />,
    action: registerAction,
  },
  {
    path: "/admin",
    loader: () => redirect("/login"),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute userFeedOnly>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
        loader: homePostsLoader,
        errorElement: <ErrorBoundary />,
      },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "settings",
    element: (
      <ProtectedRoute requireAdmin>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminPosts />,
        loader: adminPostsLoader,
        action: deletePostAction,
      },
      {
        path: "change",
        element: <ChangePost />,
        loader: changePostLoader,
        action: changePostAction,
      },
      { path: "add", element: <CreatePost />, action: createPostAction },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
