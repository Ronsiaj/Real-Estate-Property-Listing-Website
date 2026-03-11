import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Handler from "../../Helpers/Handler";
import { loadingFalse, loadingTrue } from "../../Reducer/loaderSlice";
import Logo from '../../Assets/images/logo.png'
import { useAuth } from "../../Context/AuthenticateProvider";
import { Link, useNavigate } from "react-router-dom";
import { setProfile } from "../../Reducer/customerSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logIn, setIsAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) return toast.error("Email is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email))
      return toast.error("Enter a valid email address");

    if (!form.password) return toast.error("Password is required");

    dispatch(loadingTrue());

    const res = await Handler({
      method: "post",
      url: "/auth/login.php",
      data: form,
    });

    if (res?.success) {
      const role = res?.data?.role;

      logIn(res?.data?.token, role);
      setIsAuthenticated(true);
      dispatch(setProfile(res?.data));

      toast.success("Login successful");

      /* 🔥 ROLE BASED REDIRECT */
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate("/search-property");
      } else {
        navigate("/");
      }

    } else {
      toast.error(res?.message || "Login failed");
    }

    dispatch(loadingFalse());
  };

  return (
    <div className="login-wrapper">
      <div className="login-card row g-0">
        
        {/* LEFT PANEL */}
        <div className="col-lg-6 d-none d-lg-flex login-branding">
          <div className="text-center text-white px-4">
            <img src={Logo} className="logo-login" alt="logo" />
            <p className="opacity-75 text-dark mt-3">Find. Buy. Sell. Invest.</p>
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="col-lg-6 col-12 d-flex align-items-center p-5">
          <div className="w-100">
            <h3 className="fw-bold mb-2">Welcome Back 👋</h3>
            <p className="text-muted mb-4">Login to your account</p>

            <form onSubmit={handleSubmit}>
              
              <div className="mb-3 position-relative">
                <i className='bx bx-envelope input-icon'></i>
                <input
                  type="email"
                  name="email"
                  className="form-control premium-input"
                  placeholder="Email address"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3 position-relative">
                <i className='bx bx-lock input-icon'></i>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  className="form-control premium-input"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
                <i
                  className={`bx ${showPass ? "bx-hide" : "bx-show"} toggle-pass`}
                  onClick={() => setShowPass(!showPass)}
                ></i>
              </div>

              <button className="btn btn-primary w-100 premium-btn mt-2">
                Login
              </button>

              <p className="text-center mt-3 mb-0">
                Don’t have an account?{" "}
                <Link to="/register" className="fw-semibold text-decoration-none">
                  Register
                </Link>
              </p>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
