import { Outlet, useNavigation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Layout() {
  const navigation = useNavigation();
  return (
    <>
      <Header />
      <main>
        {navigation.state === "loading" && (
          <div className="flex justify-center items-center h-screen">
            <p className="text-xl">Loading...</p>
          </div>
        )}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;
