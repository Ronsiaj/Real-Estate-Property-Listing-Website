import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";
import { useView } from "../../Context/ViewProvider";
import { MapPin, IndianRupee, Maximize, Bed, Car, Calendar, CheckCircle2, ChevronLeft, FileText, User, MessageCircle, Phone, Share2, Heart, Bath, ExternalLink, Check, Info} from "lucide-react";
import { Badge } from "reactstrap";

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { trackView, viewCount } = useView();
    const [p, setP] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [previewImg, setPreviewImg] = useState(null);
    const [message, setMessage] = useState("");

    const API_BASE_URL = "http://localhost/your_backend_file";
    

    useEffect(() => {
        if (id && viewCount >= 12) {
            toast.info("Unlock premium to view more properties!");
            navigate("/plans");
        }
    }, [id, viewCount, navigate]);

    const trackPropertyView = async () => {
        try { await Handler({ method: "post", url: "/views/track.php", data: { property_id: id } }); } catch { }
    };

    const fetchPropertyDetails = async () => {
        dispatch(loadingTrue());
        try {
            const res = await Handler({ method: "get", url: `/properties/view.php?property_id=${id}` });
            if (res.success) {
                setP(res.data.property || res.data);
                trackView(id);
                trackPropertyView();
            } else {
                toast.error(res.message);
                navigate("/");
            }
        } catch {
            toast.error("Error fetching property details");
        } finally {
            dispatch(loadingFalse());
        }
    };

    useEffect(() => { if (id) fetchPropertyDetails(); }, [id]);

    const sendMessage = async () => {
        if (!message.trim()) return toast.error("Enter your message");
        try {
            const res = await Handler({ method: "post", url: "/enquiries/create.php", data: { property_id: id, message } });
            if (res.success) { toast.success("Message sent successfully!"); setMessage(""); }
            else toast.error(res.message);
        } catch { toast.error("Failed to send message"); }
    };

    if (!p) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
            <div className="spinner-grow text-success"></div>
        </div>
    );

    const isLand = [2, 3].includes(Number(p.category_id));

    return (
        <div className="bg-light min-vh-100">
            {/* ✅ PREMIUM HEADER */}
            <div className="bg-white border-bottom sticky-top z-3 py-2 shadow-sm">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary rounded-circle p-2">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="d-none d-md-block">
                            <h6 className="fw-bold mb-0 text-dark">{p.property_name}</h6>
                            <span className="text-muted small"><MapPin size={12} /> {p.property_address}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-light rounded-pill d-flex align-items-center gap-2 px-3 border shadow-sm">
                            <Share2 size={16} /> <span className="d-none d-md-inline">Share</span>
                        </button>
                        <button className="btn btn-light rounded-pill d-flex align-items-center gap-2 px-3 border shadow-sm text-danger">
                            <Heart size={16} /> <span className="d-none d-md-inline">Save</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mt-4 pb-5">
                <div className="row g-4">
                    {/* 🔹 LEFT COLUMN */}
                    <div className="col-lg-8">
                        {/* HERO IMAGE SECTION */}
                        <div className="property-hero shadow-sm rounded-4 overflow-hidden position-relative bg-white mb-4">
                            <div className="badge-overlay position-absolute top-0 start-0 p-3 z-2">
                                <span className="badge bg-success px-3 py-2 rounded-pill fs-6 shadow">₹ {Number(p.price).toLocaleString('en-IN')}</span>
                            </div>
                            <img
                                src={`${API_BASE_URL}/properties/${p.property_thumbnail}`}
                                className="w-100 hero-img"
                                onClick={() => setPreviewImg(`${API_BASE_URL}/properties/${p.property_thumbnail}`)}
                                alt="Main Thumbnail"
                            />
                            {/* SMALL PREVIEW STRIP (ONLY ON DESKTOP) */}
                            <div className="gallery-preview-strip d-none d-md-flex gap-2 p-3 position-absolute bottom-0 start-0 w-100">
                                {p.gallery_imgs?.slice(0, 3).map((img, i) => (
                                    <div key={i} className="mini-thumb shadow" onClick={() => setPreviewImg(`${API_BASE_URL}/properties/${img}`)}>
                                        <img src={`${API_BASE_URL}/properties/${img}`} alt="gallery" />
                                    </div>
                                ))}
                                {p.gallery_imgs?.length > 3 && (
                                    <div className="mini-thumb more-photos" onClick={() => setActiveTab("gallery")}>
                                        <span>+{p.gallery_imgs.length - 3} Photos</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SPECIFICATION GRID */}
                        {!isLand && (
                            <div className="row g-3 mb-4">
                                {[
                                    { icon: <Bed size={20} />, label: "Beds", val: p.beds },
                                    { icon: <Bath size={20} />, label: "Baths", val: p.baths },
                                    { icon: <Maximize size={20} />, label: "Area", val: p.sqft + " sqft" },
                                    { icon: <Car size={20} />, label: "Parking", val: p.parking || "None" },
                                ].map((item, idx) => (
                                    <div className="col-6 col-md-3" key={idx}>
                                        <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white h-100 hover-card">
                                            <div className="text-success mb-2">{item.icon}</div>
                                            <div className="fw-bold">{item.val}</div>
                                            <small className="text-muted">{item.label}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TABS NAVIGATION */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="tab-header d-flex p-1 bg-light m-3 rounded-pill border">
                                {["overview", "gallery", "features", "documents"].map(tab => (
                                    <button key={tab}
                                        className={`tab-link flex-fill py-2 rounded-pill border-0 text-capitalize fw-bold transition-all ${activeTab === tab ? "bg-white text-success shadow-sm" : "bg-transparent text-muted"}`}
                                        onClick={() => setActiveTab(tab)}
                                    >{tab}</button>
                                ))}
                            </div>

                            <div className="card-body px-4 pb-4">
                                {activeTab === "overview" && (
                                    <div className="animate-fade">
                                        <h5 className="fw-bold mb-3 text-dark">About this Property</h5>
                                        <p className="text-secondary leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{p.description}</p>
                                        <hr className="my-4" />
                                        <h5 className="fw-bold mb-3">Location Details</h5>
                                        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-4 border">
                                            <div className="bg-white p-2 rounded-circle shadow-sm"><MapPin className="text-danger" /></div>
                                            <span className="fw-bold">{p.property_address}</span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "gallery" && (
                                    <div className="row g-3 animate-fade">
                                        {p.gallery_imgs?.map((img, i) => (
                                            <div key={i} className="col-md-4 col-6">
                                                <div className="gallery-img-card rounded-4 overflow-hidden shadow-sm h-100">
                                                    <img
                                                        src={`${API_BASE_URL}/properties/${img}`}
                                                        className="w-100 h-100 object-fit-cover"
                                                        style={{ cursor: "zoom-in", minHeight: '160px' }}
                                                        onClick={() => setPreviewImg(`${API_BASE_URL}/properties/${img}`)}
                                                        alt=""
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === "features" && (
                                    <div className="row g-3 animate-fade">
                                        {p.amenities?.map((a, i) => (
                                            <div key={i} className="col-md-6">
                                                <div className="d-flex align-items-center gap-2 p-3 bg-white border rounded-4">
                                                    <CheckCircle2 size={18} className="text-success" />
                                                    <span className="fw-medium">{a}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === "documents" && (
                                    <div className="row g-3 animate-fade">
                                        {p.property_documents?.map((doc, i) => (
                                            <div key={i} className="col-md-6">
                                                <a href={`${API_BASE_URL}/properties/${doc}`} target="_blank" rel="noreferrer" className="text-decoration-none">
                                                    <div className="p-3 border rounded-4 d-flex align-items-center justify-content-between bg-white hover-border-danger">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="bg-danger-subtle p-2 rounded-3"><FileText className="text-danger" /></div>
                                                            <span className="fw-bold text-dark small">Property Document {i + 1}</span>
                                                        </div>
                                                        <ExternalLink size={16} className="text-muted" />
                                                    </div>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🔹 RIGHT SIDEBAR */}
                    <div className="col-lg-4">
                        <div className="sticky-sidebar">
                            {/* OWNER INFO CARD */}
                            <div className="card shadow-sm border-0 rounded-4 p-4 mb-3 bg-white">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div className="bg-primary text-white p-3 rounded-circle shadow-sm fw-bold fs-5">
                                        {p.owner_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0 text-capitalize">{p.owner_name}</h6>
                                        <Badge color="success" pill className="fw-normal bg-success-subtle text-success border border-success">Verified Property</Badge>
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <button className="btn btn-success btn-lg rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm border-0 py-3">
                                        <Phone size={18} /> Call Agent
                                    </button>
                                    <button className="btn btn-outline-success btn-lg rounded-pill d-flex align-items-center justify-content-center gap-2 border-2 py-3">
                                        <MessageCircle size={18} /> Chat on WhatsApp
                                    </button>
                                </div>
                            </div>

                            {/* ENQUIRY FORM */}
                            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <MessageCircle className="text-primary" size={20} /> Interested in this?
                                </h6>
                                <textarea
                                    className="form-control border-light bg-light rounded-4 mb-3 p-3 shadow-none focus-primary"
                                    rows="4"
                                    placeholder="Tell the agent what you are looking for..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <button
                                    className="btn btn-primary btn-lg rounded-pill w-100 fw-bold py-3 shadow border-0"
                                    onClick={sendMessage}
                                >
                                    Send Enquiry
                                </button>
                                <p className="small text-muted text-center mt-3 mb-0">Agent usually responds in 2 hours</p>
                            </div>

                            {/* SAFETY TIPS CARD */}
                            <div className="p-3 bg-warning-subtle rounded-4 mt-3 border border-warning-subtle d-flex gap-2">
                                <Info size={20} className="text-warning flex-shrink-0" />
                                <small className="text-warning-emphasis">Don't transfer any booking amount before physical visit.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🖼 FULLSCREEN PREVIEW */}
            {previewImg && (
                <div className="img-overlay show" onClick={() => setPreviewImg(null)}>
                    <div className="container text-center">
                        <img src={previewImg} className="img-fluid rounded shadow-lg animate-scale" alt="full preview" />
                    </div>
                </div>
            )}

            <style>{`
                .hero-img { height: 450px; object-fit: cover; cursor: zoom-in; transition: transform 0.4s; }
                .hero-img:hover { transform: scale(1.02); }
                .hero-visual-wrapper:hover .hero-img { transform: scale(1.02); }
                
                .mini-thumb { width: 100px; height: 70px; border-radius: 12px; overflow: hidden; border: 2px solid white; cursor: pointer; transition: 0.3s; }
                .mini-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .mini-thumb:hover { transform: translateY(-5px); border-color: #28a745; }
                .more-photos { background: rgba(0,0,0,0.6); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }

                .tab-link { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 0.9rem; }
                .hover-card { transition: all 0.3s; cursor: default; }
                .hover-card:hover { transform: translateY(-5px); background: #f8fff9 !important; }
                
                .sticky-sidebar { position: sticky; top: 100px; }
                .animate-fade { animation: fadeIn 0.4s ease-in; }
                .animate-scale { animation: scaleIn 0.3s ease-out; }
                
                .img-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; pointer-events: none; cursor: zoom-out; }
                .img-overlay.show { opacity: 1; pointer-events: auto; }
                .img-overlay img { max-height: 85vh; border-radius: 12px; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .focus-primary:focus { border-color: #07c196 !important; background: white !important; }
                .hover-border-danger:hover { border-color: #dc3545 !important; }

                @media (max-width: 768px) {
                    .hero-img { height: 280px; }
                    .py-10 { padding-top: 3rem; padding-bottom: 3rem; }
                    .tab-link { font-size: 0.75rem; }
                    .badge-overlay .badge { font-size: 14px !important; }
                }
            `}</style>
        </div>
    );
};

export default PropertyDetails;