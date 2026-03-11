import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import Logo from "../Assets/images/logo.png";
import { getCookie } from "../Helpers/Utils";
import { List, Plus, UserCircle, Heart, LogOut } from "lucide-react"; // Standard Lucide icons
import { useAuth } from "../Context/AuthenticateProvider";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logOut } = useAuth();
  const [offcanvas, setOffCanvas] = useState(false);
  const userRole = getCookie("person");

  const isActive = (path) => location.pathname === path;

  /* ===== MENU CONFIG ===== */
  const publicMenu = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/search-property", label: "Properties" },
    { path: "/plans", label: "Plans" },
    { path: "/contact", label: "Contact" }
  ];

  const userMenu = [{ path: "/user/properties", label: "My Properties" }];
  const adminMenu = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/properties", label: "Properties" },
    { path: "/admin/enquiries", label: "Enquiries" }
  ];

  let menuItems = publicMenu;
  if (userRole === "admin") menuItems = adminMenu;
  else if (userRole === "user") menuItems = [...publicMenu, ...userMenu];

  const handleAddProperty = () => {
    setOffCanvas(false);
    if (userRole === "admin") navigate("/admin/add-property");
    else if (userRole === "user") navigate("/user/add-property");
    else navigate("/login");
  };

  return (
    <header className="shadow-sm bg-white sticky-top">
      <Container>
        <div className="d-flex align-items-center justify-content-between py-2">
          
          {/* LOGO */}
          <Link to="/" className="p-0">
            <img src={Logo} alt="logo" className="site-logo" style={{ height: '45px' }} />
          </Link>

          {/* DESKTOP MENU - Hidden on Mobile */}
          <ul className="d-none d-lg-flex align-items-center gap-4 list-unstyled m-0">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={`nav-link-custom ${isActive(item.path) ? "active" : ""}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* RIGHT ACTIONS */}
          <div className="d-flex align-items-center gap-2">
            
            {/* Desktop Only Icons */}
            {isAuthenticated ? (
              <div className="d-none d-lg-flex align-items-center gap-2">
                <Button className="add-header-btn px-3" onClick={handleAddProperty}>Add Property</Button>
                <Button className="icon-btn-circle" onClick={() => navigate("/favourite")}><Heart size={20}/></Button>
                <Button className="icon-btn-circle" onClick={() => navigate(userRole === "admin" ? "/admin/dashboard" : "/profile")}><UserCircle size={20}/></Button>
                <Button color="danger" outline size="sm" className="rounded-pill px-3" onClick={logOut}>Logout</Button>
              </div>
            ) : (
              <Button className="btn-premium-solid d-none d-lg-block" onClick={() => navigate("/login")}>Login</Button>
            )}

            {/* MOBILE HAMBURGER - Always Visible on Mobile */}
            <Button className="icon-btn-circle d-lg-none" onClick={() => setOffCanvas(true)}>
              <List size={24} />
            </Button>
          </div>
        </div>
      </Container>

      {/* MOBILE MENU (OFFCANVAS) */}
      <Offcanvas isOpen={offcanvas} toggle={() => setOffCanvas(false)} direction="end" className="premium-offcanvas">
        <OffcanvasHeader toggle={() => setOffCanvas(false)} className="border-bottom">
          <img src={Logo} alt="logo" style={{ height: '40px' }} />
        </OffcanvasHeader>

        <OffcanvasBody className="d-flex flex-column justify-content-between">
          <div>
            <label className="text-muted small fw-bold mb-3 text-uppercase">Navigation</label>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-5">
              {menuItems.map(item => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    onClick={() => setOffCanvas(false)}
                    className={`offcanvas-link ${isActive(item.path) ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ✅ MOBILE ACTIONS MOVED HERE */}
            <label className="text-muted small fw-bold mb-3 text-uppercase">Quick Actions</label>
            <div className="d-grid gap-3">
              {isAuthenticated ? (
                <>
                  <Button color="success" className="rounded-3 py-2 d-flex align-items-center justify-content-center gap-2" onClick={handleAddProperty}>
                    <Plus size={18}/> Add Property
                  </Button>
                  <Button color="light" className="text-start py-2 px-3 border-0 d-flex align-items-center gap-3" onClick={() => {navigate("/favourite"); setOffCanvas(false);}}>
                    <Heart size={18} className="text-danger"/> My Favourites
                  </Button>
                  <Button color="light" className="text-start py-2 px-3 border-0 d-flex align-items-center gap-3" onClick={() => {navigate("/profile"); setOffCanvas(false);}}>
                    <UserCircle size={18}/> My Profile
                  </Button>
                </>
              ) : (
                <Button className="btn-premium-solid" onClick={() => {navigate("/login"); setOffCanvas(false);}}>Login / Register</Button>
              )}
            </div>
          </div>

          {/* LOGOUT AT BOTTOM */}
          {isAuthenticated && (
            <div className="mt-auto pt-4 border-top">
              <Button color="outline-danger" className="w-100 d-flex align-items-center justify-content-center gap-2 py-2" onClick={logOut}>
                <LogOut size={18}/> Logout Account
              </Button>
            </div>
          )}
        </OffcanvasBody>
      </Offcanvas>

      <style>{`
        .nav-link-custom { color: #555; text-decoration: none; font-size: 15px; transition: 0.3s; }
        .nav-link-custom:hover, .nav-link-custom.active { color: #07c196; }
        
        .icon-btn-circle { width: 40px; height: 40px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: #eaf7f4; border: none; color: #07c196; transition: 0.3s; }
        .icon-btn-circle:hover { background: #07c196; color: white; }

        .offcanvas-link { display: block; padding: 12px 15px; border-radius: 8px; color: #333; text-decoration: none; font-weight: 500; }
        .offcanvas-link.active { background: #eaf7f4; color: #07c196; }
        
        .premium-offcanvas { width: 280px !important; }
        .add-header-btn { background: #07c196; color: white; border: none; border-radius: 8px; font-weight: 600; }
      `}</style>
    </header>
  );
};

export default Header;