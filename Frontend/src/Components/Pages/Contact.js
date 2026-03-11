import React, { useState } from "react";
import FooterBackground from "../../Assets/images/footer-background-img.jpg";
import Logo from "../../Assets/images/logo.png";
import {
    Container, Button,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody
} from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Contact = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const currentPath = location.pathname;
    const [offcanvas, setOffCanvas] = useState(false);

    // 🔹 Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        comments: "",
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^[0-9]{10,15}$/.test(formData.phone))
            newErrors.phone = "Enter valid phone number (10–15 digits)";
        if (!formData.comments.trim()) newErrors.comments = "Comments are required";
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSubmitted(true);
        console.log("Form submitted:", formData);
        // 🚀 Here you can send formData to backend API
    };
    return (
        <React.Fragment>
            
            {/* breadcrumb section */}
            <section class="breadcrump-section">
                <div class="overlay"></div>
                <div class="container-fluid h-100 d-flex align-items-center">
                    <div class="breadcrumb-content px-5">
                        <ul class="breadcrumb mb-0">
                            <li>
                                <a href="/">Home</a>
                            </li>
                            <li>
                                <span class="mx-2">{'>'}</span>
                            </li>
                            <li>Contact</li>
                        </ul>
                    </div>
                </div>
            </section>
            <section className="contact-page-section">
                <div className="container">
                    <div className="row align-items-stretch">
                        {/* Left Side */}
                        <div className="col-lg-6 col-md-12 mb-4 mb-lg-0 d-flex">
                            <div className="contact-page-left flex-fill">
                                <h2 className="contact-page-title">Get in Touch</h2>
                                <p className="contact-page-subtitle">
                                   Green Valley Residency
                                </p>

                                <div className="contact-page-box d-flex align-items-center">
                                    <div className="contact-page-icon">
                                        <i className="bi bi-geo-alt-fill"></i>
                                    </div>
                                    <div>
                                        <h6 className="contact-page-label">Location</h6>
                                        <p className="contact-page-text">
                                            Chennai.
                                        </p>
                                    </div>
                                </div>

                                <div className="contact-page-box d-flex align-items-center">
                                    <div className="contact-page-icon">
                                        <i className="bi bi-telephone-fill"></i>
                                    </div>
                                    <div>
                                        <h6 className="contact-page-label">Emergency Call</h6>
                                        <p className="contact-page-text">+91 98765 43210</p>
                                    </div>
                                </div>

                                <div className="contact-page-box d-flex align-items-center">
                                    <div className="contact-page-icon">
                                        <i className="bi bi-share-fill"></i>
                                    </div>
                                    <div>
                                        <h6 className="contact-page-label">Follow Us On</h6>
                                        <div className="contact-page-social d-flex gap-3">
                                            <a href="#">
                                                <i className="bi bi-facebook"></i>
                                            </a>
                                            <a href="#">
                                                <i className="bi bi-twitter"></i>
                                            </a>
                                            <a href="#">
                                                <i className="bi bi-whatsapp"></i>
                                            </a>
                                            <a href="#">
                                                <i className="bi bi-linkedin"></i>
                                            </a>
                                            <a href="#">
                                                <i className="bi bi-instagram"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="col-lg-6 col-md-12 d-flex">
                            <div className="contact-page-form flex-fill">
                                <h3 className="form-title">Quick Contact</h3>
                                <p className="form-subtitle">
                                    Borem ipsum dolor sit amet conse ctetur adipisicing elit sed
                                    do eiusmod Eorem ipsum dolor sit amet conse ctetur.
                                </p>

                                {submitted && (
                                    <div className="alert alert-success">
                                        ✅ Thank you! Your message has been sent.
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    noValidate
                                    className="h-100 d-flex flex-column"
                                >
                                    <div className="row flex-grow-1">
                                        <div className="col-md-6 mb-3">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Name *"
                                                className={`form-control ${errors.name ? "is-invalid" : ""
                                                    }`}
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback">{errors.name}</div>
                                            )}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <input
                                                type="text"
                                                name="phone"
                                                maxLength={13}
                                                placeholder="Phone *"
                                                className={`form-control ${errors.phone ? "is-invalid" : ""
                                                    }`}
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                            {errors.phone && (
                                                <div className="invalid-feedback">{errors.phone}</div>
                                            )}
                                        </div>
                                        <div className="col-12 mb-3 flex-grow-1">
                                            <textarea
                                                name="comments"
                                                placeholder="Comments *"
                                                rows="6"
                                                className={`form-control h-100 ${errors.comments ? "is-invalid" : ""
                                                    }`}
                                                value={formData.comments}
                                                onChange={handleChange}
                                            ></textarea>
                                            {errors.comments && (
                                                <div className="invalid-feedback">
                                                    {errors.comments}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-12 mt-auto">
                                            <button
                                                type="submit"
                                                className="btn contact-page-btn w-100 mt-3"
                                            >
                                                SEND MESSAGE
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="contact-map-section">
                <div className="container">
                    <div className="map-wrapper">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.31381162603!2d78.771991075079!3d10.073352490035814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0067fae7e9cff7%3A0x4708481a066012af!2sQ%20Ads%20-%20Digital%20Marketing%20Agency!5e0!3m2!1sen!2sin!4v1748504150494!5m2!1sen!2sin"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* footer section */}
            {/* <section
        className="footer"
        style={{ backgroundImage: `url(${FooterBackground})` }}
      >
        <div className="footer-overlay"></div>
        <div className="container footer-top row gx-5">
          <div className="col-lg-3 col-md-6 mb-4 footer-widget">
            <img src={Logo} alt="logo" className="footer-logo mb-3" />
            <p className="footer-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="social-icons d-flex gap-3">
              <a href="#">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4 footer-widget">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="footer-links list-unstyled">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About us</a>
              </li>
              <li>
                <a href="/properties">Our Properties</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4 footer-widget">
            <h5 className="footer-title">Newsletter</h5>
            <p className="footer-text">
              Subscribe to our newsletter to get the latest updates.
            </p>
            <form className="newsletter-form d-flex">
              <input
                type="email"
                placeholder="Your email"
                className="form-control me-2"
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>

          <div className="col-lg-3 col-md-6 mb-4 footer-widget">
            <h5 className="footer-title">Contact Info</h5>
            <ul className="footer-contact list-unstyled">
              <li>
                <i className="bi bi-geo-alt"></i> 123 Main Street, New York, USA
              </li>
              <li>
                <i className="bi bi-telephone"></i> +1 234 567 890
              </li>
              <li>
                <i className="bi bi-envelope"></i> info@example.com
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section>
        <div className="footer-bottom text-center">
          <p>2025 © All right reserved by Qads Digital Marketing</p>
        </div>
      </section> */}
        </React.Fragment>
    );
};

export default Contact;
