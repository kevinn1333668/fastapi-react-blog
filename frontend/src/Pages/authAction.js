import { redirect } from "react-router-dom";
import {
  login as apiLogin,
  fetchMe,
  setSession,
  clearSession,
} from "../api/auth";

export async function authAction({ request }) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const data = await apiLogin(username, password);

    try {
      const me = await fetchMe(data.access_token);
      setSession({ access_token: data.access_token, user: me });
      return redirect(me.is_admin ? "/settings" : "/");
    } catch {
      clearSession();
      return { error: "Не удалось проверить сессию. Попробуйте снова." };
    }
  } catch (err) {
    clearSession();
    if (err.status === 401 || err.status === 404) {
      return { error: "Неверный логин или пароль" };
    }
    return { error: "Ошибка сети или сервера" };
  }
}
