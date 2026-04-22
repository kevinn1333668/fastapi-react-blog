import { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "react-router-dom";
import { fetchMe, getStoredToken, clearToken } from "../api/auth";

export default function Autorization() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const actionData = useActionData();
  const navigation = useNavigation();

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        setSessionLoading(false);
        return;
      }

      try {
        const me = await fetchMe(token);
        if (!cancelled) {
          setCurrentUser(me.username);
        }
      } catch {
        if (!cancelled) {
          clearToken();
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form
        method="post"
        className="flex flex-col gap-4 p-6 w-full max-w-sm bg-white rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center">Админ-панель</h2>

        {sessionLoading ? (
          <p className="text-sm text-center text-gray-500">Проверка сессии…</p>
        ) : currentUser ? (
          <p className="text-sm text-center text-green-600">
            Вы вошли как {currentUser}
          </p>
        ) : null}

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
      </Form>
    </div>
  );
}
