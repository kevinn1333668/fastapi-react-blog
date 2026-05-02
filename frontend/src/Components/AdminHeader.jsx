import NavLinkMenu from "../UI/NavLinkMenu";

function AdminHeader() {
  return (
    <header className="flex justify-between px-5 py-8 bg-blue-200 shadow-md">
      <img className="h-6" src="/favicon.svg" alt="logo" />
      <nav>
        <ul className="flex justify-between gap-14">
          <li>
            <NavLinkMenu to={"/settings"}>Home</NavLinkMenu>
          </li>
          <li>
            <NavLinkMenu to={"add"}>Add Post</NavLinkMenu>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default AdminHeader;
