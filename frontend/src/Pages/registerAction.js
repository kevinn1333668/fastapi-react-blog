import { redirect } from "react-router-dom";
import { register as apiRegister, setSession } from "../api/auth";

export async function registerAction({ request }) {
  const formData = await request.formData();

  const username = (formData.get("username") || "").toString().trim();
  const password = formData.get("password");
  const passwordConfirm = formData.get("password_confirm");

  if (!username || !password) {
    return { error: "Заполните все поля" };
  }

  if (password !== passwordConfirm) {
    return { error: "Пароли не совпадают" };
  }

  try {
    const data = await apiRegister(username, password);
    setSession({
      access_token: data.access_token,
      user: data.user,
    });

    return redirect(data.user?.is_admin ? "/settings" : "/");
  } catch (err) {
    if (err.status === 409) {
      return { error: "Пользователь с таким логином уже существует" };
    }
    if (err.status === 422) {
      return { error: "Проверьте логин (от 3 символов) и пароль" };
    }
    return {
      error:
        typeof err.detail === "string"
          ? err.detail
          : "Ошибка регистрации. Попробуйте снова.",
    };
  }
}
