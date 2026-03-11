import React from "react";
import Logo from "../Assets/images/logo.png";
import FooterBackground from "../Assets/images/footer-background-img.jpg";
import { Facebook, Instagram, Location, Phone, Whatsapp } from "@boxicons/react";

const Footer = () => {
  return (
    <footer className="footer ps-0" style={{ backgroundImage: `url(${FooterBackground})` }}>
      <div className="footer-overlay"></div>
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-12 col-lg-3 text-start footer-widget">
            <img src={Logo} alt="logo" className="footer-logo mb-3" />
            <p className="footer-text">
              We specialize in connecting people with their dream homes,
              prime lands, and profitable investments.
            </p>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 text-start footer-widget">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="footer-links list-unstyled">
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/properties">Our Properties</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 text-start footer-widget">
            <h5 className="footer-title">Follow Us</h5>
            <div className="social-icons d-flex gap-3 mt-2">
              <a href="#"> <Facebook /> </a>
              <a href="#"> <Instagram /> </a>
              <a href="#"> <Whatsapp /> </a>
            </div>
          </div>
          <div className="col-12 col-lg-3 text-start footer-widget">
            <h5 className="footer-title">Contact Info</h5>
            <ul className="footer-contact list-unstyled">
              <li> <Phone /> +91 99444 41205</li>
              <li> <Phone /> +91 99769 43436</li>
              <li> <Location/> Karaikudi, Tamil Nadu</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom text-center mt-4">
        <p>
          © {new Date().getFullYear()} Green Valley Residency. All Rights Reserved.
        </p>
      </div>
    </footer>

  );
};

export default Footer;