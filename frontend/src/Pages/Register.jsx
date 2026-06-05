import { Form, Link, useActionData, useNavigation } from "react-router-dom";

export default function Register() {
  const actionData = useActionData();
  const navigation = useNavigation();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form
        method="post"
        className="flex flex-col gap-4 p-6 w-full max-w-sm bg-white rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-semibold text-center">Регистрация</h2>

        <input
          type="text"
          name="username"
          placeholder="Логин"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
        />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={3}
          autoComplete="new-password"
        />

        <input
          type="password"
          name="password_confirm"
          placeholder="Повторите пароль"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength={3}
          autoComplete="new-password"
        />

        {actionData?.error && (
          <p className="text-sm text-red-500">{actionData.error}</p>
        )}

        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="py-2 text-white bg-blue-500 rounded-lg transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {navigation.state === "submitting" ? "Регистрация…" : "Создать аккаунт"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </p>
      </Form>
    </div>
  );
}
