import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, MapPin, Tag, ArrowRight } from "lucide-react"; // Icons kaga lucide-react use panren machan

const PropertyViewList = () => {
    const [views, setViews] = useState([]);
    const [loading, setLoading] = useState(true);

   
    const API_BASE_URL = "http://localhost/your_backend_file";

    useEffect(() => {
        // Unnoda 'Top Viewed Properties' API-ah inga hit panrom
        const fetchViews = async () => {
            try {
                const res = await axios.post(`${API_BASE_URL}/views/track.php`);
                if (res.data.success) {
                    setViews(res.data.data);
                }
            } catch (err) {
                toast.error("Faild to load");
            } finally {
                setLoading(false);
            }
        };
        fetchViews();
    }, []);

    if (loading) return <div className="text-center py-5 fw-bold">Loading Stats...</div>;

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-bottom-0">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0 text-dark">Most Viewed Properties</h5>
                    <span className="badge bg-success-soft text-success px-3 py-2 rounded-pill small">
                        Real-time Analytics
                    </span>
                </div>
            </div>

            <div className="card-body p-0">
                {views.length > 0 ? (
                    <div className="list-group list-group-flush">
                        {views.map((item, index) => (
                            <div
                                key={index}
                                className="list-group-item list-group-item-action border-start-0 border-end-0 py-3 px-4 transition-all"
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="row align-items-center">
                                    {/* Rank Number */}
                                    <div className="col-auto">
                                        <div className={`fw-bold fs-5 ${index < 3 ? 'text-success' : 'text-muted'}`}>
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col">
                                        <h6 className="fw-bold mb-1 text-dark text-capitalize">
                                            {item.property_name}
                                        </h6>
                                        <div className="d-flex gap-3 small text-muted">
                                            <span>
                                                <Eye size={14} className="me-1" />
                                                <b className="text-dark">{item.total_views}</b> Views
                                            </span>
                                            {/* Intha fields un API response-la illana remove pannikalaam machan */}
                                            {item.property_address && (
                                                <span><MapPin size={14} className="me-1" /> {item.property_address}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="col-auto text-end">
                                        <button className="btn btn-light btn-sm rounded-circle shadow-sm">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-5 text-center text-muted">No view data available yet.</div>
                )}
            </div>

            <style>{`
                .transition-all:hover {
                    background-color: #f8f9fa;
                    transform: translateX(5px);
                }
                .bg-success-soft {
                    background-color: #e8f5e9;
                }
                .list-group-item {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default PropertyViewList;