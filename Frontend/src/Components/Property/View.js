import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";
import {
  MapPin,
  IndianRupee,
  Maximize,
  Bed,
  Car,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  House
} from "lucide-react";

/**
 * PropertyView Component (ADMIN)
 * For admins to view property details without any view limits.
 */
const PropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [p, setP] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const API_BASE_URL = "http://localhost/your_backend_file";
  

  const fetchPropertyDetails = async () => {
    dispatch(loadingTrue());
    try {
      const res = await Handler({
        method: "get",
        url: `/properties/view.php?property_id=${id}`
      });
      if (res.success) {
        setP(res.data.property || res.data);
      } else {
        toast.error(res.message);
        navigate("/admin/properties");
      }
    } catch (err) {
      toast.error("Error fetching property details");
    } finally {
      dispatch(loadingFalse());
    }
  };

  useEffect(() => {
    if (id) fetchPropertyDetails();
  }, [id]);

  if (!p) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const isLand = [2, 3].includes(Number(p.category_id));

  return (
    <div className="property-view-page admin-view bg-light min-vh-100 pb-5">
      <div className="bg-white border-bottom sticky-top z-3">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-icon btn-outline-secondary rounded-circle shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h5 className="fw-bold mb-0 text-dark">
                  <span className="text-primary me-2">[Admin]</span>
                  {p.property_name}
                </h5>
                <small className="text-muted">Viewing details for property ID: {p.property_id}</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => navigate(`/admin/edit-property/${id}`)}>
                Edit Property
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Same layout as user view but without count logic */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <img
                src={`${API_BASE_URL}/properties/${p.property_thumbnail}`}
                className="w-100 object-fit-cover"
                style={{ height: "400px" }}
                alt="Main"
              />
              <div className="card-body p-4">
                <div className="d-flex justify-content-between">
                  <div>
                    <h3 className="fw-bold">{p.property_name}</h3>
                    <p className="text-muted"><MapPin size={16} /> {p.property_address}</p>
                  </div>
                  <h3 className="text-success fw-bold">₹{Number(p.price).toLocaleString()}</h3>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="row g-4">
                <div className="col-md-3 text-center border-end">
                  <Maximize className="text-primary mb-2" />
                  <h6 className="mb-0">Area</h6>
                  <p className="fw-bold mb-0">{p.sqft} Sqft</p>
                </div>
                {!isLand && (
                  <div className="col-md-3 text-center border-end">
                    <Bed className="text-primary mb-2" />
                    <h6 className="mb-0">Bedrooms</h6>
                    <p className="fw-bold mb-0">{p.beds || 'N/A'}</p>
                  </div>
                )}
                <div className="col-md-3 text-center border-end">
                  <Calendar className="text-primary mb-2" />
                  <h6 className="mb-0">Built Year</h6>
                  <p className="fw-bold mb-0">{p.year_built || 'N/A'}</p>
                </div>
                <div className="col-md-3 text-center">
                  <span className="badge bg-primary px-3 py-2 rounded-pill">{p.category_name}</span>
                </div>
              </div>
              <hr className="my-4" />
              <h5 className="fw-bold mb-3">Description</h5>
              <p className="text-muted">{p.description}</p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h6 className="fw-bold mb-3">Owner Information</h6>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded-circle p-3 me-3"><User /></div>
                <div>
                  <h6 className="fw-bold mb-0">{p.owner_name}</h6>
                  <small className="text-muted">Registered Seller</small>
                </div>
              </div>
              <hr />
              <h6 className="fw-bold mb-3">Amenities</h6>
              <div className="d-flex flex-wrap gap-2">
                {p.amenities?.map((a, i) => (
                  <span key={i} className="badge bg-light text-dark border">{a}</span>
                ))}
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold mb-3">Attached Documents</h6>
              {p.property_documents?.map((d, i) => (
                <a key={i} href={`${API_BASE_URL}/properties/${d}`} target="_blank" className="btn btn-light btn-sm w-100 mb-2 text-start">
                  <FileText size={14} className="me-2" /> Document {i + 1}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rounded-4 { border-radius: 1rem !important; }
        .btn-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
};

export default PropertyView;