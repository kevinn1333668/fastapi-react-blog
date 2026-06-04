import { useNavigate } from "react-router-dom";
import NavLinkMenu from "../UI/NavLinkMenu";
import { clearSession, getStoredUser } from "../api/auth";
import { isAdminUser } from "../api/guards";

function Header() {
  const user = getStoredUser();
  const admin = isAdminUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex justify-between items-center px-5 py-8 bg-blue-200 shadow-md">
      <img className="h-6" src="/favicon.svg" alt="logo" />
      <nav>
        <ul className="flex gap-8 items-center">
          {admin ? (
            <li>
              <NavLinkMenu to="/settings">Посты</NavLinkMenu>
            </li>
          ) : (
            <>
              <li>
                <NavLinkMenu to="/">Лента</NavLinkMenu>
              </li>
              <li>
                <NavLinkMenu to="/about">О проекте</NavLinkMenu>
              </li>
            </>
          )}
          {user && (
            <>
              <li className="text-sm text-gray-700">{user.username}</li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-blue-800 hover:underline"
                >
                  Выйти
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
