import { useEffect } from "react";
import { Form, Link, useActionData, useNavigate, useNavigation } from "react-router-dom";
import {
  fetchMe,
  getStoredToken,
  getStoredUser,
  clearSession,
  setSession,
} from "../api/auth";

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getStoredToken();
      const user = getStoredUser();
      if (!token) return;

      if (user) {
        if (!cancelled) {
          navigate(user.is_admin ? "/settings" : "/", { replace: true });
        }
        return;
      }

      try {
        const me = await fetchMe(token);
        if (!cancelled) {
          setSession({ access_token: token, user: me });
          navigate(me.is_admin ? "/settings" : "/", { replace: true });
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form
        method="post"
        className="flex flex-col gap-4 p-6 w-full max-w-sm bg-white rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center">Вход</h2>

        <input
          type="text"
          name="username"
          placeholder="Логин"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          autoComplete="username"
        />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          autoComplete="current-password"
        />

        {actionData?.error && (
          <p className="text-sm text-red-500">{actionData.error}</p>
        )}

        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="py-2 text-white bg-blue-500 rounded-lg transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {navigation.state === "submitting" ? "Вход…" : "Войти"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </Form>
    </div>
  );
}
