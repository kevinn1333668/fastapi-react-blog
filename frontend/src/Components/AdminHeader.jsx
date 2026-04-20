import NavLinkMenu from "../UI/NavLinkMenu";

function AdminHeader() {
  return (
    <header className="flex justify-between px-5 py-8 bg-blue-200 shadow-md">
      <img className="h-6" src="/favicon.svg" alt="logo" />
      <nav>
        <ul className="flex gap-14 justify-between">
          <li>
            <NavLinkMenu to={"delete"}>Delete Post</NavLinkMenu>
          </li>
          <li>
            <NavLinkMenu to={"change"}>Change Post</NavLinkMenu>
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
