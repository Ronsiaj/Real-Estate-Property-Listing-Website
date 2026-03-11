import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCookie } from "../../Helpers/Utils";
import { useDispatch } from "react-redux";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";

const PropertyEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = getCookie("token");

    // --- Constants ---
    const API_BASE_URL = "http://localhost/your_backend_file";
    
    
    const categories = [
        { id: 1, name: "Home" }, { id: 2, name: "Land" }, { id: 3, name: "Plot" },
        { id: 4, name: "Commercial Buildings" }, { id: 5, name: "Apartment" },
        { id: 6, name: "Individual Home" }, { id: 7, name: "Villa" },
    ];

    const amenitiesByCategory = {
        1: ["Water Supply", "Electricity", "Parking", "Garden", "Security", "Lift", "Swimming Pool", "Power Backup", "Borewell", "CCTV"],
        2: ["Road Access", "Corner Plot", "Gated Community", "Drainage", "Water Connection", "EB Connection", "Nearby Highway", "Fencing"],
        3: ["DTCP Approved", "CMDA Approved", "Corner Plot", "Road Facing", "Gated Layout", "Street Light", "Drainage", "Water Line"],
        4: ["Lift", "Power Backup", "Parking", "CCTV", "Security", "Central AC", "Fire Safety", "High Footfall Area"],
        5: ["Lift", "Power Backup", "Security", "Parking", "Swimming Pool", "Gym", "Club House", "Children Play Area"],
        6: ["Water Supply", "Borewell", "Garden", "Terrace", "Parking", "CCTV", "Solar Panel"],
        7: ["Private Garden", "Private Parking", "Swimming Pool", "Security", "Power Backup", "Club House", "Gym", "Terrace"]
    };

    // --- States ---
    const [categoryId, setCategoryId] = useState("");
    const [typeId, setTypeId] = useState("");
    const [disable, setDisable] = useState(false);
    const [data, setData] = useState({ 
        property_name: "", 
        property_address: "", 
        description: "", 
        sqft: "", 
        price: "", 
        amenities: [] 
    });

    // Media States
    const [media, setMedia] = useState({
        newThumbnail: null,
        newGallery: [],
        newDocs: [],
        newRooms: {}, // For new uploads
        oldThumbnail: "",
        oldGallery: [],
        oldDocs: [],
        oldRooms: {} // Store existing room images from DB
    });

    // --- 1. Fetch Existing Data ---
    useEffect(() => {
        const fetchDetails = async () => {
            dispatch(loadingTrue());
            try {
                const res = await axios.get(`${API_BASE_URL}/properties/view.php?property_id=${id}`);
                if (res.data.success) {
                    const p = res.data.property;
                    setCategoryId(p.category_id);
                    setTypeId(p.type_id);
                    setData({
                        property_name: p.property_name,
                        property_address: p.property_address,
                        description: p.description,
                        sqft: p.sqft,
                        price: p.price,
                        amenities: Array.isArray(p.amenities) ? p.amenities : JSON.parse(p.amenities || "[]")
                    });

                    // Room images identify panni dynamic-ah set panrom machan
                    const roomKeys = [
                        "living_room1", "living_room2", "kitchen1", "kitchen2", 
                        "bedroom1", "bedroom2", "bathroom1", "bathroom2", 
                        "pooja_hall1", "pooja_hall2"
                    ];
                    const existingRooms = {};
                    roomKeys.forEach(key => {
                        if (p[key]) existingRooms[key] = p[key];
                    });

                    setMedia(prev => ({
                        ...prev,
                        oldThumbnail: p.property_thumbnail,
                        oldGallery: p.gallery_imgs || [],
                        oldDocs: p.property_documents || [],
                        oldRooms: existingRooms
                    }));
                }
            } catch (err) {
                toast.error("Error loading property data");
            } finally {
                dispatch(loadingFalse());
            }
        };
        fetchDetails();
    }, [id, dispatch]);

    // --- 2. Handlers ---
    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const handleAmenityToggle = (item) => {
        const current = [...data.amenities];
        const index = current.indexOf(item);
        if (index > -1) current.splice(index, 1);
        else current.push(item);
        setData({ ...data, amenities: current });
    };

    const handleRoomFile = (key, file) => {
        setMedia(prev => ({
            ...prev,
            newRooms: { ...prev.newRooms, [key]: file }
        }));
    };

    // Database-la irunthu vantha image-ah frontend-la irunthu hide panna
    const removeOldRoomImg = (key) => {
        setMedia(prev => {
            const updatedOldRooms = { ...prev.oldRooms };
            delete updatedOldRooms[key];
            return { ...prev, oldRooms: updatedOldRooms };
        });
    };

    // --- 3. Submit Update ---
    const submit = async (e) => {
        e.preventDefault();
        setDisable(true);
        const formData = new FormData();
        
        formData.append("property_id", id);
        formData.append("category_id", categoryId);
        formData.append("type_id", typeId);

        Object.keys(data).forEach(key => {
            if (key === "amenities") formData.append(key, JSON.stringify(data[key]));
            else formData.append(key, data[key]);
        });

        if (media.newThumbnail) formData.append("property_thumbnail", media.newThumbnail);
        
        // Dynamic-ah ellaa room images-aiyum append panrom machan
        Object.keys(media.newRooms).forEach(k => {
            if (media.newRooms[k]) formData.append(k, media.newRooms[k]);
        });

        try {
            const res = await axios.post(`${API_BASE_URL}/properties/update.php`, formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                toast.success("Property updated successfully!");
                navigate("/admin/properties");
            } else {
                toast.error(res.data.msg || "Update failed");
            }
        } catch (err) {
            toast.error("Server error during update");
        } finally {
            setDisable(false);
        }
    };

    return (
        <section className="bg-light min-vh-100 py-5">
            <div className="container-fluid px-md-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center mb-5">
                        <h1 className="fw-bold display-6 text-dark">Edit Property Details</h1>
                        <p className="text-muted small">Update info and manage room media for ID: #{id}</p>
                    </div>

                    <div className="col-xxl-11">
                        <form onSubmit={submit} className="row g-4">
                            {/* LEFT: Main Form */}
                            <div className="col-lg-8">
                                {/* Basic Info */}
                                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">1. General Information</h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Property Title</label>
                                            <input type="text" name="property_name" value={data.property_name} onChange={handleChange} className="form-control border-0 bg-light" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Location</label>
                                            <input type="text" name="property_address" value={data.property_address} onChange={handleChange} className="form-control border-0 bg-light" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Category</label>
                                            <select className="form-select border-0 bg-light" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                                {categories && categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Listing Type</label>
                                            <select className="form-select border-0 bg-light" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                                                <option value="1">Sales</option>
                                                <option value="2">Rent</option>
                                                <option value="3">Lease</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold mb-3 text-success">2. Amenities</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {amenitiesByCategory[categoryId]?.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => handleAmenityToggle(item)}
                                                className={`px-3 py-2 rounded-pill border cursor-pointer transition-all ${data.amenities?.includes(item) ? 'bg-success text-white' : 'bg-white text-muted'}`}
                                                style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                <span className="fw-bold">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Room Media - Dynamic Section */}
                                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">3. Room Media (Preview & Update)</h5>
                                    <div className="row g-4">
                                        {["Living Room", "Kitchen", "Bedroom", "Bathroom", "Pooja Hall"].map((roomLabel, i) => {
                                            const roomKeyBase = roomLabel.toLowerCase().replace(" ", "_");
                                            return (
                                                <div key={i} className="col-12 border-bottom pb-3">
                                                    <label className="fw-bold small mb-3 d-block text-secondary">{roomLabel} Media</label>
                                                    <div className="row g-3">
                                                        {[1, 2]?.map(num => {
                                                            const key = `${roomKeyBase}${num}`;
                                                            const existingImg = media.oldRooms[key];
                                                            const newFile = media.newRooms[key];

                                                            return (
                                                                <div key={key} className="col-md-6">
                                                                    <div className="p-3 bg-white border rounded-3">
                                                                        <label className="small text-muted mb-2 d-block">Slot {num}</label>
                                                                        
                                                                        {/* 1. Existing Image from DB */}
                                                                        {existingImg && !newFile && (
                                                                            <div className="position-relative mb-2">
                                                                                <img src={`${API_BASE_URL}/properties/${existingImg}`} className="rounded shadow-sm w-100" style={{ height: '110px', objectFit: 'cover' }} alt="existing" />
                                                                                <button type="button" onClick={() => removeOldRoomImg(key)} className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle" style={{ width: '22px', height: '22px', padding: 0 }}>×</button>
                                                                            </div>
                                                                        )}

                                                                        {/* 2. New Selected File Preview */}
                                                                        {newFile && (
                                                                            <div className="position-relative mb-2">
                                                                                <img src={URL.createObjectURL(newFile)} className="rounded shadow-sm w-100 border border-success" style={{ height: '110px', objectFit: 'cover' }} alt="preview" />
                                                                                <button type="button" onClick={() => handleRoomFile(key, null)} className="btn btn-warning btn-sm position-absolute top-0 end-0 m-1 rounded-circle" style={{ width: '22px', height: '22px', padding: 0 }}>×</button>
                                                                            </div>
                                                                        )}

                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*" 
                                                                            className="form-control form-control-sm border-0 bg-light mt-2" 
                                                                            onChange={(e) => handleRoomFile(key, e.target.files[0])} 
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Action Sidebar */}
                            <div className="col-lg-4">
                                <div className="sticky-top" style={{ top: '20px' }}>
                                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-dark text-white shadow">
                                        <label className="small fw-bold text-white-50">PRICE (₹)</label>
                                        <input type="number" name="price" value={data.price} onChange={handleChange} className="form-control form-control-lg border-0 bg-transparent text-white fw-bold fs-2 text-center" required />
                                        <button disabled={disable} type="submit" className="btn btn-success btn-lg w-100 mt-4 fw-bold shadow">
                                            {disable ? "SAVING..." : "SAVE CHANGES"}
                                        </button>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                        <h6 className="fw-bold mb-3 text-success">Main Thumbnail</h6>
                                        {media.oldThumbnail && !media.newThumbnail && (
                                            <div className="position-relative mb-3">
                                                <img src={`${API_BASE_URL}/properties/${media.oldThumbnail}`} className="img-thumbnail rounded shadow-sm" alt="current" />
                                                <span className="badge bg-secondary position-absolute top-0 start-0 m-2">Current</span>
                                            </div>
                                        )}
                                        <input type="file" onChange={(e) => setMedia({...media, newThumbnail: e.target.files[0]})} className="form-control border-0 bg-light" />
                                        {media.newThumbnail && (
                                            <div className="position-relative mt-2">
                                                <img src={URL.createObjectURL(media.newThumbnail)} className="img-thumbnail rounded shadow-sm border-success" alt="new" />
                                                <button type="button" onClick={() => setMedia({...media, newThumbnail: null})} className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1">Cancel</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Media Status */}
                                    <div className="card border-0 shadow-sm rounded-4 p-4">
                                        <h6 className="fw-bold mb-3">Existing Files</h6>
                                        <div className="p-3 bg-light rounded-3">
                                            <small className="d-block mb-1">Gallery: <b>{media.oldGallery.length}</b></small>
                                            <small className="d-block">Documents: <b>{media.oldDocs.length}</b></small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <style>{`
                .transition-all { transition: all 0.2s ease-in-out; }
                .transition-all:hover { transform: scale(1.02); }
                input[type=number]::-webkit-inner-spin-button { display: none; }
                .cursor-pointer { cursor: pointer; }
                .form-control:focus { box-shadow: none; background-color: #f8f9fa; border: 1px solid #198754; }
            `}</style>
        </section>
    );
};

export default PropertyEdit;