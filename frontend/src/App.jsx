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
import AdminPosts from "./Pages/AdminPosts";
import ChangePost from "./Pages/ChangePost";
import { deletePostAction } from "./Pages/deletePostAction";
import { changePostAction } from "./Pages/changePostAction";
import ProtectedRoute from "./Components/ProtectedRoute";
import QuizList from "./Pages/QuizList";
import TakeQuiz from "./Pages/TakeQuiz";
import AdminQuizzes from "./Pages/AdminQuizzes";
import ChangeQuiz from "./Pages/ChangeQuiz";
import {
  quizzesLoader,
  quizTakeLoader,
  adminQuizzesLoader,
  changeQuizLoader,
} from "./api/quizzes";
import { deleteQuizAction } from "./Pages/deleteQuizAction";
import { changeQuizAction } from "./Pages/changeQuizAction";

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
      {
        path: "quizzes",
        element: <QuizList />,
        loader: quizzesLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "quizzes/:id",
        element: <TakeQuiz />,
        loader: quizTakeLoader,
        errorElement: <ErrorBoundary />,
      },
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
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "settings/quizzes",
    element: (
      <ProtectedRoute requireAdmin>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminQuizzes />,
        loader: adminQuizzesLoader,
        action: deleteQuizAction,
      },
      {
        path: "change",
        element: <ChangeQuiz />,
        loader: changeQuizLoader,
        action: changeQuizAction,
      },
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
