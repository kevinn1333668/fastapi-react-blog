import NavLinkMenu from "../UI/NavLinkMenu";

function Header() {
  return (
    <header className="flex justify-between px-5 py-8 bg-blue-200 shadow-md">
      <img className="h-6" src="/favicon.svg" alt="logo" />
      <nav>
        <ul className="flex gap-14">
          <li>
            <NavLinkMenu to={"/"}>Home</NavLinkMenu>
          </li>
          <li>
            <NavLinkMenu to={"about"}>about</NavLinkMenu>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
