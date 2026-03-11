import React, { useState, useEffect } from "react";
import { Container, Button, Col, Row, Input, Card, CardBody } from "reactstrap";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import CountUp from "react-countup";
import Cookies from 'js-cookie';
import { useAuth } from "../../Context/AuthenticateProvider";
import { BsHouseHeart, BsBuilding, BsShop, BsBriefcase, BsCupHot, BsTree } from "react-icons/bs";
import { BiSearch, BiMap, BiHomeAlt } from "react-icons/bi";

// Slick Carousel CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Images
import Banner from "../../Assets/images/banner.png";
import Who1 from "../../Assets/images/who1.png";
import Person from "../../Assets/images/person-icon.svg";
import Tick from "../../Assets/images/tick-icon.svg";
import HomeShape3 from "../../Assets/images/home-shape-3.svg";
import HomeBackground from "../../Assets/images/home-background.jpg";
import ContactBanner from "../../Assets/images/banner-1.png";

const Home = () => {
    const token = Cookies.get('token');
    const navigate = useNavigate();
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [selectedType, setSelectedType] = useState("1"); // Default: Buy
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showAuthCard, setShowAuthCard] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        navigate(`/search-property?search=${encodeURIComponent(search)}&type_id=${selectedType}&category_id=${selectedCategory}`);
    };

    useEffect(() => {
        if (!user && !token) {
            const timer = setTimeout(() => setShowAuthCard(true), 15000);
            return () => clearTimeout(timer);
        }
    }, [user, token]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
    };

    const categories = [
        { icon: <BsHouseHeart />, title: "Villa", count: "12+ Listings" },
        { icon: <BsBuilding />, title: "Apartments", count: "24+ Listings" },
        { icon: <BsShop />, title: "Commercial", count: "08+ Listings" },
        { icon: <BsBriefcase />, title: "Office", count: "15+ Listings" },
        { icon: <BsCupHot />, title: "Restaurant", count: "05+ Listings" },
        { icon: <BsTree />, title: "Plot", count: "30+ Listings" },
    ];

    return (
        <React.Fragment>
            {/* 🔹 Auth Popup */}
            {showAuthCard && (
                <div className="premium-auth-overlay">
                    <Card className="premium-auth-card shadow-2xl animate-scale-in">
                        <CardBody className="p-5 text-center">
                            <div className="premium-icon-box mb-4 animate-bounce-slow">
                                <i className="bi bi-stars"></i>
                            </div>
                            <h3 className="fw-bold mb-2 text-dark">Join Our Community</h3>
                            <p className="text-muted mb-4 small">Discover exclusive properties and personalized deals curated just for you.</p>
                            <div className="d-grid gap-3">
                                <Button className="btn-premium-solid" onClick={() => navigate("/login")}>Login to Account</Button>
                                <Button className="btn-premium-outline" onClick={() => navigate("/signup")}>Create New Account</Button>
                            </div>
                            <button className="btn-close-link mt-4" onClick={() => setShowAuthCard(false)}>Maybe Later</button>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* 🔹 PREMIUM HERO BANNER */}
            <section className="premium-hero">
                <Container>
                    <Row className="align-items-center py-5">
                        <Col lg={7} className="hero-text-content">
                            <span className="premium-badge mb-3">Verified Real Estate Agency</span>
                            <h1 className="display-3 fw-extra-bold mb-4">
                                Find Your <span className="text-gradient">Luxury Living</span> <br /> Space Today
                            </h1>
                            <p className="lead text-secondary mb-5">
                                We bridge the gap between dream homes and reality with immersive listings and expert guidance.
                            </p>

                            {/* ✅ SEARCH BOX ALIGNMENT FIXED */}
                            <div className="premium-search-box shadow-xl animate-fade-in-delay">
                                <div className="search-type-tabs">
                                    {[["1", "Buy"], ["2", "Rent"], ["3", "Projects"], ["4", "Commercial"]].map(([id, label]) => (
                                        <button 
                                            key={id} 
                                            className={`type-tab ${selectedType === id ? "active" : ""}`}
                                            onClick={() => setSelectedType(id)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <div className="search-bar-content">
                                    <div className="search-input-wrapper group-border">
                                        <label className="small-label">Location</label>
                                        <div className="input-with-icon">
                                            <BiMap className="text-primary me-2" size={18} />
                                            <Input 
                                                type="text" 
                                                placeholder="Search City..." 
                                                className="premium-input-field" 
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="search-input-wrapper group-border">
                                        <label className="small-label">Property Type</label>
                                        <div className="input-with-icon">
                                            <BiHomeAlt className="text-primary me-2" size={18} />
                                            <select 
                                                className="premium-select-field"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="1">Home</option>
                                                <option value="2">Land</option>
                                                <option value="3">Plot</option>
                                                <option value="4">Commercial</option>
                                                <option value="5">Apartment</option>
                                                <option value="7">Villa</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="search-action-wrapper">
                                        <Button className="btn-search-main" onClick={handleSearchSubmit}>
                                            <BiSearch className="me-2" size={20} /> Search Property
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col lg={5} className="d-none d-lg-block position-relative">
                            <div className="hero-visual-wrapper">
                                <div className="hero-glow-blob"></div>
                                <img src={Banner} alt="Modern Building" className="hero-main-img animate-float" />
                                <div className="floating-secured-card shadow-lg animate-float-slow">
                                    <div className="icon-circle"><i className="bi bi-house-check"></i></div>
                                    <div><h6 className="mb-0 fw-bold">100% Secured</h6><small>Verified Listings</small></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 🔹 ABOUT SECTION - STAGGERED IMAGE COLLAGE FIXED */}
            <section className="premium-about py-10">
                <Container>
                    <Row className="align-items-center g-5">
                        <Col lg={6}>
                            <div className="about-image-collage">
                                <div className="collage-item item-1">
                                    <div className="trophy-badge shadow"><i className="bi bi-trophy-fill"></i></div>
                                    <img src={Who1} alt="Team" className="img-fluid rounded-4 shadow-lg" />
                                </div>
                                <div className="collage-item item-2">
                                    <img src={HomeBackground} alt="Interior" className="img-fluid rounded-4 shadow-lg" />
                                </div>
                                <div className="collage-item item-3">
                                    <img src={ContactBanner} alt="House" className="img-fluid rounded-4 shadow-lg" />
                                    <div className="review-pill shadow-lg">
                                        <div className="review-star"><i className="bi bi-star-fill"></i></div>
                                        <div className="review-avatars">
                                            <div className="avatar-stack">
                                                <img src={Person} alt="user" /><img src={Person} alt="user" /><img src={Person} alt="user" />
                                            </div>
                                            <span className="small fw-bold">15K + Reviews</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6} className="ps-lg-5">
                            <h6 className="section-subtitle">WHO WE ARE</h6>
                            <h2 className="section-title mb-4">Dedicated to Finding Your <br /> Perfect Match</h2>
                            <p className="text-muted fs-5 mb-5 lead">We provide verified listings and professional guidance to find your ideal home without any hassle.</p>
                            <Row className="g-4 mb-5">
                                <Col sm={6}>
                                    <div className="feature-pill shadow-sm">
                                        <div className="pill-icon"><img src={Person} alt="icon" width="30" /></div>
                                        <div><h4 className="mb-0 fw-bold text-dark"><CountUp end={55} suffix="K" /></h4><small className="text-muted">Satisfied People</small></div>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className="feature-pill shadow-sm">
                                        <div className="pill-icon"><img src={Tick} alt="icon" width="30" /></div>
                                        <div><h4 className="mb-0 fw-bold text-dark"><CountUp end={11} suffix="K" /></h4><small className="text-muted">Verified Property</small></div>
                                    </div>
                                </Col>
                            </Row>
                            <Button className="btn-about-premium px-5 py-3 rounded-pill shadow-lg">Learn More About Us</Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 🔹 Categories Slider */}
            <section className="premium-categories bg-light-soft py-10">
                <Container>
                    <div className="text-center mb-5">
                        <h6 className="section-subtitle">EXPLORE TYPES</h6>
                        <h2 className="section-title">What are you looking for?</h2>
                    </div>
                    <Slider {...sliderSettings} className="premium-slider">
                        {categories.map((cat, index) => (
                            <div className="px-2" key={index}>
                                <div className="category-premium-card border-0">
                                    <div className="c-icon-box">{cat.icon}</div>
                                    <h5 className="fw-bold mt-3 mb-1 text-dark">{cat.title}</h5>
                                    <p className="text-muted small">{cat.count}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </Container>
            </section>

            <style>{`
                :root {
                    --primary: #07c196;
                    --dark: #0e2e50;
                    --gradient: linear-gradient(135deg, #07c196 0%, #11cb46 100%);
                    --soft-bg: #f0fdf4;
                }

                .fw-extra-bold { font-weight: 900; letter-spacing: -1px; }
                .text-gradient { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .py-10 { padding: 100px 0; }
                .bg-light-soft { background-color: #f9fbfd; }

                /* 🔹 Hero Section Styling */
                .premium-hero { background: radial-gradient(circle at top right, #eafcf8, #ffffff); position: relative; overflow: hidden; }
                .premium-badge { background: #eaf7f4; color: var(--primary); padding: 8px 24px; border-radius: 50px; font-weight: 700; font-size: 12px; display: inline-block; }
                .hero-visual-wrapper { position: relative; display: flex; justify-content: center; align-items: center; }
                .hero-glow-blob { position: absolute; width: 450px; height: 450px; background: #cffceb; border-radius: 50%; filter: blur(80px); z-index: 1; }
                .hero-main-img { z-index: 2; width: 100%; border-radius: 40px; position: relative; }
                .floating-secured-card { position: absolute; bottom: 10%; left: -20px; z-index: 10; background: #fff; padding: 12px 20px; border-radius: 15px; display: flex; align-items: center; gap: 12px; min-width: 180px; border: 1px solid #f1f5f9; }

                /* ✅ Search Box Layout Alignment Fixed */
                .premium-search-box { background: #fff; border-radius: 24px; overflow: hidden; margin-top: 40px; border: 1px solid #f1f5f9; width: 100%; max-width: 850px; }
                .search-type-tabs { display: flex; background: #f8fafc; padding: 8px; border-bottom: 1px solid #f1f5f9; }
                .type-tab { flex: 1; padding: 12px 20px; border: none; background: none; font-weight: 700; color: #64748b; border-radius: 16px; transition: 0.3s; font-size: 15px; }
                .type-tab.active { background: #fff; color: var(--primary); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
                .search-bar-content { display: flex; align-items: stretch; padding: 10px; }
                .search-input-wrapper { flex: 1; padding: 15px 25px; display: flex; flex-direction: column; justify-content: center; }
                .group-border { border-right: 1px solid #f1f5f9; }
                .input-with-icon { display: flex; align-items: center; margin-top: 4px; }
                .small-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; color: #94a3b8; margin-bottom: 0; }
                .premium-input-field, .premium-select-field { border: none !important; padding: 0 !important; font-size: 16px; font-weight: 700; color: var(--dark); background: transparent !important; box-shadow: none !important; width: 100%; }
                .search-action-wrapper { padding: 10px; display: flex; align-items: center; }
                .btn-search-main { background: var(--gradient) !important; border: none !important; border-radius: 18px !important; font-weight: 800 !important; height: 60px; padding: 0 35px !important; font-size: 16px !important; display: flex; align-items: center; justify-content: center; transition: 0.4s !important; color: #fff; }

                /* 🔹 About Us Staggered Image Grid Fixed */
                .about-image-collage { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; position: relative; }
                .item-1 { grid-row: 1 / 3; }
                .item-2 { grid-row: 1 / 4; margin-top: 40px; }
                .item-3 { margin-top: -60px; position: relative; }
                .trophy-badge { position: absolute; top: -20px; left: -20px; width: 55px; height: 55px; background: #2cb5ff; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; z-index: 5; border: 4px solid #fff; }
                .review-pill { position: absolute; bottom: -20px; right: -20px; background: #fff; padding: 12px 20px; border-radius: 20px; display: flex; align-items: center; gap: 10px; z-index: 10; }
                .review-star { width: 40px; height: 40px; background: #ffc107; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .avatar-stack { display: flex; }
                .avatar-stack img { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff; margin-left: -8px; }

                .feature-pill { display: flex; align-items: center; gap: 15px; background: #fff; padding: 15px 20px; border-radius: 20px; border: 1px solid #f1f5f9; transition: 0.3s; }
                .btn-about-premium { background: #6c757d !important; border: none !important; font-weight: 700 !important; }

                @media (max-width: 991px) {
                    .search-bar-content { flex-direction: column; }
                    .group-border { border-right: none; border-bottom: 1px solid #f1f5f9; }
                    .btn-search-main { width: 100%; margin-top: 10px; }
                    .about-image-collage { gap: 10px; margin-bottom: 30px; }
                    .review-pill { right: 0; }
                }
                    .premium-categories {
    background-color: #f9fbfd; /* Light soft background */
    padding: 100px 0;
}

.section-subtitle {
    color: var(--primary);
    font-weight: 800;
    letter-spacing: 2px;
    font-size: 13px;
    text-transform: uppercase;
}

.section-title {
    font-weight: 900;
    color: var(--dark);
    margin-top: 10px;
}

/* ✅ Category Card Alignment Fix */
.category-premium-card {
    background: #fff;
    border-radius: 30px;
    padding: 45px 25px;
    text-align: center;
    transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid #f1f5f9 !important;
    margin: 15px 10px; /* Card spacing fix */
}

.category-premium-card:hover {
    transform: translateY(-15px);
    background: var(--dark); /* Design match hover color */
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
}

.category-premium-card:hover h5 {
    color: #fff !important;
}

.category-premium-card:hover p {
    color: rgba(255, 255, 255, 0.6) !important;
}

/* Icon Box logic like Design */
.c-icon-box {
    width: 85px;
    height: 85px;
    background: var(--soft-bg); /* Soft green background */
    color: var(--primary);
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
    margin: 0 auto;
    transition: 0.6s;
}

.category-premium-card:hover .c-icon-box {
    background: var(--primary);
    color: #fff;
    transform: rotateY(360deg); /* Modern flip animation */
}

/* Slick Dot Overrides */
.premium-slider .slick-dots li button:before {
    color: var(--primary) !important;
    font-size: 12px;
}

.premium-slider .slick-dots li.slick-active button:before {
    color: var(--primary) !important;
}
            `}</style>
        </React.Fragment>
    );
};

export default Home;