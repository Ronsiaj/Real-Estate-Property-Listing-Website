import React,{ useState } from "react";
import {
  Container,
  Button,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
} from "reactstrap";
import FooterBackground from "../../Assets/images/footer-background-img.jpg";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Assets/images/logo.png";
import HomeBackground from "../../Assets/images/home-background.jpg";
import Meeting from "../../Assets/images/about-page-meet.jpg"; // Left side image
import Meeting2 from "../../Assets/images/about-page-meet-1.jpg"; // Right side image

import ModernVilla from "../../Assets/images/Modern-Villa.svg"; // SVG for Modern Villa
import HomeHand from "../../Assets/images/home-hand-icon.svg"; // SVG for Secure Payment
import { useNavigate } from "react-router-dom";
const About = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const currentPath = location.pathname;
  const [offcanvas, setOffCanvas] = useState(false);
    // const [search, setSearch] = useState("");

  return (
    <React.Fragment>
      {/* Breadcrumb */}
      <section className="breadcrump-section">
        <div className="overlay"></div>
        <div className="container-fluid h-100 d-flex align-items-center">
          <div className="breadcrumb-content px-5">
            <ul className="breadcrumb mb-0">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <span className="mx-2">{">"}</span>
              </li>
              <li>About Us</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="row align-items-center">
            {/* Left - Image */}
            <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
              <img
                src={Meeting}
                alt="Meeting"
                className="about-img w-100 rounded"
              />
            </div>

            {/* Right - Content */}
            <div className="col-lg-6 col-md-12">
              <span className="about-subtitle">ABOUT US</span>
              <h2 className="about-title">
                We're on a Mission to Change <br /> View of RealEstate Field.
              </h2>
              <p className="about-text">
                when an unknown printer took a galley of type and scrambled it
                to make type specimen bookt has survived not only five centuries
                alsoey jequery the leap into electronic typesetting.
              </p>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="about-feature d-flex align-items-start">
                    <img
                      src={ModernVilla}
                      alt="Modern Villa"
                      className="about-icon me-3"
                    />
                    <div>
                      <h5 className="about-feature-title">Modern Villa</h5>
                      <p className="about-feature-text">
                        when unknown printer took galley of type and scrambled.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="about-feature d-flex align-items-start">
                    <img
                      src={HomeHand}
                      alt="Secure Payment"
                      className="about-icon me-3"
                    />
                    <div>
                      <h5 className="about-feature-title">Secure Payment</h5>
                      <p className="about-feature-text">
                        when unknown printer took galley of type and scrambled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Power / Video Section */}
      <section className="company-power-section">
        <div className="container">
          <div className="row align-items-center">
            {/* Left Content */}
            <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
              <span className="company-subtitle">COMPANY POWER</span>
              <h2 className="company-title">
                The Core Company Values Of <br /> Our Main Goal
              </h2>
              <p className="company-text">
                We are committed to delivering top-notch real estate solutions
                with integrity, transparency, and innovation. Our mission is to
                provide clients with properties that truly match their
                aspirations, ensuring trust and excellence in every deal we
                handle.
              </p>
              <p className="company-text">
                With a strong foundation built on values and customer
                satisfaction, we aim to revolutionize the real estate industry
                and make property transactions seamless, secure, and reliable
                for everyone.
              </p>
            </div>

            {/* Right Image with Video Icon */}
            <div className="col-lg-6 col-md-12 position-relative text-center">
              <div
                className="company-video-wrapper"
                style={{ backgroundImage: `url(${Meeting2})` }}
              >
                <a
                  href="https://www.youtube.com/watch?v=examplevideo"
                  className="company-video-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-play-fill"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tour Section */}
      <section
        className="video-tour"
        style={{ backgroundImage: `url(${HomeBackground})` }}
      >
        <div className="overlay"></div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-6">
              <div className="video-box animate-box">
                <span className="video-subtitle animate-fade">
                  • LET’S TAKE A TOUR
                </span>
                <h2 className="video-title animate-fade-delay">
                  Search Property Smarter, <br /> Quicker & Anywhere
                </h2>
                <a
                  href="https://www.youtube.com/watch?v=examplevideo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-play d-flex align-items-center gap-2 mt-3 animate-fade-delay2"
                >
                  <div className="play-icon">
                    <i className="bi bi-play-fill"></i>
                  </div>
                  <span>Play Video</span>
                </a>
              </div>
            </div>
            <div className="col-lg-7 col-md-6 d-none d-md-block text-center">
              <h1 className="video-text animate-text">Property For All</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

export default About;
