import { redirect } from "react-router-dom";
import {
  login as apiLogin,
  fetchMe,
  setStoredToken,
  clearToken,
} from "../api/auth";

export async function authAction({ request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const data = await apiLogin(username, password);
    setStoredToken(data.access_token);

    try {
      await fetchMe(data.access_token);
      return redirect("/settings");
    } catch {
      clearToken();
      return { error: "Не удалось проверить сессию. Попробуйте снова." };
    }
  } catch (err) {
    if (err.status === 401) {
      return { error: "Неверный логин или пароль" };
    }
    return { error: "Ошибка сети или сервера" };
  }
}
