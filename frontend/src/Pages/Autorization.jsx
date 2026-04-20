import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as apiLogin,
  fetchMe,
  getStoredToken,
  setStoredToken,
  clearToken,
} from "../api/auth";

export default function Autorization() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await apiLogin(username, password);
      setStoredToken(data.access_token);

      try {
        const me = await fetchMe(data.access_token);
        setCurrentUser(me.username);
        navigate("/settings");
      } catch {
        clearToken();
        setCurrentUser(null);
        alert("Не удалось проверить сессию. Попробуйте снова.");
      }
    } catch (err) {
      if (err.status === 401) {
        setError("Неверный логин или пароль");
        alert("Вход не выполнен: неверный логин или пароль.");
      } else {
        setError("Ошибка сети или сервера");
        alert("Вход не выполнен: проверьте, что бэкенд запущен и доступен.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
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
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2 text-white bg-blue-500 rounded-lg transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
