import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Handler from "../../Helpers/Handler";
import { loadingFalse, loadingTrue } from "../../Reducer/loaderSlice";
import Logo from '../../Assets/images/logo.png'
import { useAuth } from "../../Context/AuthenticateProvider";
import { Link } from "react-router-dom";

const Register = () => {
    const dispatch = useDispatch();
    const { logIn } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error("Name is required");
        if (form.name.trim().length < 3) return toast.error("Name must be at least 3 characters");
        if (!form.email.trim()) return toast.error("Email is required");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return toast.error("Enter a valid email address");
        if (!form.phone.trim()) return toast.error("Phone number is required");
        const phoneRegex = /^[0-9]{10,13}$/;
        if (!phoneRegex.test(form.phone)) return toast.error("Enter a valid phone number");
        if (!form.password) return toast.error("Password is required");
        if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
        dispatch(loadingTrue());
        const res = await Handler({ method: "post", url: "/auth/register.php", data: form, });
        if (res?.success) {
            toast.success("Registration successful");
            if (res?.data?.token) {
                logIn(res?.data?.token, res?.data?.role);
            }
        } else {
            toast.error(res?.message || "Registration failed");
        }
        dispatch(loadingFalse());
    };


    return (
        <div className="login-wrapper">
            <div className="login-card row g-0">

                {/* LEFT BRAND PANEL */}
                <div className="col-lg-6 d-none d-lg-flex login-branding">
                    <div className="text-center text-white px-4">
                        <img src={Logo} className="logo-login" alt="logo" />
                        <p className="opacity-75 text-dark mt-3">Find. Buy. Sell. Invest.</p>
                    </div>
                </div>

                {/* RIGHT REGISTER FORM */}
                <div className="col-lg-6 col-12 d-flex align-items-center p-5">
                    <div className="w-100">
                        <h3 className="fw-bold mb-2">Create Account 🚀</h3>
                        <p className="text-muted mb-4">Register to get started</p>

                        <form onSubmit={handleSubmit}>

                            {/* Name */}
                            <div className="mb-3 position-relative">
                                <i className='bx bx-user input-icon'></i>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control premium-input"
                                    placeholder="Full Name"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email */}
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

                            {/* Phone */}
                            <div className="mb-3 position-relative">
                                <i className='bx bx-phone input-icon'></i>
                                <input
                                    type="tel"
                                    name="phone"
                                    maxLength={13}
                                    className="form-control premium-input"
                                    placeholder="Phone Number"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="mb-3 position-relative">
                                <i className='bx bx-lock input-icon'></i>
                                <input type={showPass ? "text" : "password"} name="password" className="form-control premium-input" placeholder="Password" onChange={handleChange} required
                                />
                                <i
                                    className={`bx ${showPass ? "bx-hide" : "bx-show"} toggle-pass`}
                                    onClick={() => setShowPass(!showPass)}
                                ></i>
                            </div>

                            <button className="btn btn-primary w-100 premium-btn mt-2">
                                Register
                            </button>
                            <p className="text-center mt-3 mb-0">
                                Already have an account?{" "}
                                <Link to="/login" className="fw-semibold text-decoration-none">
                                    Login
                                </Link>
                            </p>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
