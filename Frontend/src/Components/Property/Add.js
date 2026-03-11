import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getCookie } from "../../Helpers/Utils";

const PropertyForm = () => {
    const amenitiesByCategory = {
        1: ["Water Supply", "Electricity", "Parking", "Garden", "Security", "Lift", "Swimming Pool", "Power Backup", "Borewell", "CCTV"],
        2: ["Road Access", "Corner Plot", "Gated Community", "Drainage", "Water Connection", "EB Connection", "Nearby Highway", "Fencing"],
        3: ["DTCP Approved", "CMDA Approved", "Corner Plot", "Road Facing", "Gated Layout", "Street Light", "Drainage", "Water Line"],
        4: ["Lift", "Power Backup", "Parking", "CCTV", "Security", "Central AC", "Fire Safety", "High Footfall Area"],
        5: ["Lift", "Power Backup", "Security", "Parking", "Swimming Pool", "Gym", "Club House", "Children Play Area"],
        6: ["Water Supply", "Borewell", "Garden", "Terrace", "Parking", "CCTV", "Solar Panel"],
        7: ["Private Garden", "Private Parking", "Swimming Pool", "Security", "Power Backup", "Club House", "Gym", "Terrace"]
    };

    const [categories, setCategories] = useState([
        { id: 1, name: "Home" }, { id: 2, name: "Land" }, { id: 3, name: "Plot" },
        { id: 4, name: "Commercial Buildings" }, { id: 5, name: "Apartment" },
        { id: 6, name: "Individual Home" }, { id: 7, name: "Villa" },
    ]);
    
    const token = getCookie("token");
    const [categoryId, setCategoryId] = useState("");
    const [typeId, setTypeId] = useState("");
    const [data, setData] = useState({ amenities: [] });
    const [disable, setDisable] = useState(false);

    const logic1 = [1, 5, 6, 7]; 
    const logic2 = [2, 3, 4];

    const [propertyThumbnail, setPropertyThumbnail] = useState(null);
    const [galleryImgs, setGalleryImgs] = useState([]);
    const [propertyDocs, setPropertyDocs] = useState([]);
    const [rooms, setRooms] = useState({}); 

    
    const API_BASE_URL = "http://localhost/your_backend_file";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/categories/list.php`);
                if (res.data?.success && Array.isArray(res.data.data)) setCategories(res.data.data);
            } catch (err) { console.error("Fetch error:", err); }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (e) => setTypeId(e.target.value === "" ? "" : parseInt(e.target.value));

    const handleCategoryChange = (e) => {
        const val = e.target.value === "" ? "" : parseInt(e.target.value);
        setCategoryId(val);
        setData((prev) => ({ ...prev, amenities: [] }));
        setRooms({}); 
    };

    const handleAmenityToggle = (amenity) => {
        setData((prev) => {
            const current = prev.amenities || [];
            if (current.includes(amenity)) {
                return { ...prev, amenities: current.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...current, amenity] };
            }
        });
    };

    const handleRoomFile = (key, file) => {
        if (file) setRooms(prev => ({ ...prev, [key]: file }));
    };

    const removeRoomFile = (key) => {
        setRooms(prev => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Login session expired.");
        
        try {
            setDisable(true);
            const formData = new FormData();
            formData.append("category_id", categoryId);
            formData.append("type_id", typeId);
            
            Object.keys(data).forEach(key => {
                if (key === "amenities") {
                    formData.append("amenities", JSON.stringify(data[key]));
                } else {
                    formData.append(key, data[key]);
                }
            });

            if (propertyThumbnail) formData.append("property_thumbnail", propertyThumbnail);
            galleryImgs.forEach(file => formData.append("gallery_imgs[]", file));
            propertyDocs.forEach(file => formData.append("property_documents[]", file));
            
            Object.keys(rooms).forEach(key => {
                formData.append(key, rooms[key]);
            });

            const res = await axios.post(`${API_BASE_URL}/properties/add.php`, formData, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            if (res.data?.success) toast.success("Property added successfully!");
            else toast.error(res.data?.msg || "Backend Error");
        } catch (err) { toast.error("Submit error occurred."); }
        finally { setDisable(false); }
    };

    return (
        <section className="bg-light min-vh-100 py-5">
            <div className="container-fluid px-md-5">
                <div className="row justify-content-center">
                    <div className="col-12 text-center mb-5">
                        <h1 className="fw-bold display-6 text-dark">Property Submission Portal</h1>
                    </div>
                    
                    <div className="col-xxl-11">
                        <form onSubmit={submit} className="row g-4">
                            <div className="col-lg-8">
                                {/* 1. Main Information */}
                                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">1. Main Information</h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Property Title</label>
                                            <input type="text" name="property_name" onChange={handleChange} className="form-control border-0 bg-light py-2" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Location</label>
                                            <input type="text" name="property_address" onChange={handleChange} className="form-control border-0 bg-light py-2" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Category</label>
                                            <select className="form-select border-0 bg-light py-2" value={categoryId} onChange={handleCategoryChange} required>
                                                <option value="">Select Category</option>
                                                {categories && categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Listing Type</label>
                                            <select className="form-select border-0 bg-light py-2" value={typeId} onChange={handleTypeChange} required>
                                                <option value="">Select Type</option>
                                                <option value="1">Sales</option>
                                                <option value="2">Rent</option>
                                                <option value="3">Lease</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Description</label>
                                            <textarea name="description" onChange={handleChange} className="form-control border-0 bg-light py-2" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Amenities */}
                                {categoryId && (
                                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                        <h5 className="fw-bold mb-3 text-success">2. Amenities</h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {amenitiesByCategory[categoryId]?.map((item, idx) => (
                                                <div key={idx} onClick={() => handleAmenityToggle(item)}
                                                    className={`px-3 py-2 rounded-pill border cursor-pointer transition-all ${data.amenities?.includes(item) ? 'bg-success text-white border-success' : 'bg-white text-muted'}`}
                                                    style={{ cursor: 'pointer' }}>
                                                    <small className="fw-bold">{item}</small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Specifications */}
                                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">3. Specifications</h5>
                                    <div className="row g-3">
                                        <div className="col-md-4"><label className="form-label small fw-bold">Total Sqft</label><input type="number" name="sqft" onChange={handleChange} className="form-control border-0 bg-light" required /></div>
                                        {logic1?.includes(categoryId) && (
                                            <>
                                                <div className="col-md-4"><label className="form-label small fw-bold">Beds</label><input type="number" name="beds" onChange={handleChange} className="form-control border-0 bg-light" /></div>
                                                <div className="col-md-4"><label className="form-label small fw-bold">Baths</label><input type="number" name="baths" onChange={handleChange} className="form-control border-0 bg-light" /></div>
                                                <div className="col-md-4"><label className="form-label small fw-bold">Parking</label><input type="number" name="parking" onChange={handleChange} className="form-control border-0 bg-light" /></div>
                                                <div className="col-md-4"><label className="form-label small fw-bold">Year Built</label><input type="number" name="year_built" onChange={handleChange} className="form-control border-0 bg-light" /></div>
                                            </>
                                        )}
                                        {logic2?.includes(categoryId) && (
                                            <>
                                                <div className="col-md-4"><label className="form-label small fw-bold">Acres</label><input type="number" step="0.01" name="acres" onChange={handleChange} className="form-control border-0 bg-light" required /></div>
                                                <div className="col-md-8"><label className="form-label small fw-bold">Ownership Details</label><input type="text" name="ownership_details" onChange={handleChange} className="form-control border-0 bg-light" required /></div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Detailed Room Previews */}
                                {logic1?.includes(categoryId) && (
                                    <div className="card border-0 shadow-sm rounded-4 p-4">
                                        <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">4. Room Previews</h5>
                                        <div className="row g-4">
                                            {["Living Room", "Kitchen", "Bedroom", "Bathroom", "Pooja Hall"].map((roomLabel, i) => {
                                                const roomKey = roomLabel?.toLowerCase()?.replace(" ", "_");
                                                return (
                                                    <div key={i} className="col-md-12 border-bottom pb-3">
                                                        <label className="fw-bold small mb-2 d-block text-dark">{roomLabel} (Select Max 2)</label>
                                                        <div className="row g-3">
                                                            {[1, 2]?.map(num => {
                                                                const key = `${roomKey}${num}`;
                                                                return (
                                                                    <div key={key} className="col-md-6">
                                                                        <div className="p-2 border rounded bg-white text-center">
                                                                            <input type="file" accept="image/*" className="form-control form-control-sm border-0" 
                                                                                onChange={(e) => handleRoomFile(key, e.target.files[0])} 
                                                                            />
                                                                            {rooms[key] && (
                                                                                <div className="position-relative mt-2">
                                                                                    <img src={URL.createObjectURL(rooms[key])} className="rounded shadow-sm" style={{ width: '100%', height: '100px', objectFit: 'cover' }} alt="preview" />
                                                                                    <button type="button" onClick={() => removeRoomFile(key)} className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-0" style={{width:'20px', height:'20px'}}>×</button>
                                                                                </div>
                                                                            )}
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
                                )}
                            </div>

                            <div className="col-lg-4">
                                <div className="sticky-top" style={{ top: '20px' }}>
                                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-dark text-white shadow">
                                        <label className="small fw-bold text-white-50">PRICE (₹)</label>
                                        <input type="number" name="price" onChange={handleChange} className="form-control form-control-lg border-0 text-dark fw-bold fs-2 text-center" placeholder="0" required />
                                        <button disabled={disable} type="submit" className="btn btn-success btn-lg w-100 mt-4 fw-bold shadow">
                                            {disable ? "SAVING..." : "PUBLISH NOW"}
                                        </button>
                                    </div>

                                    <div className="card border-0 shadow-sm rounded-4 p-4">
                                        <h6 className="fw-bold mb-3 border-bottom pb-2 text-success">Media Uploads</h6>
                                        {/* Thumbnail Preview */}
                                        <div className="mb-3">
                                            <label className="small fw-bold">Thumbnail</label>
                                            <input type="file" onChange={(e) => setPropertyThumbnail(e.target.files[0])} className="form-control border-0 bg-light mt-1" />
                                            {propertyThumbnail && <img src={URL.createObjectURL(propertyThumbnail)} className="img-thumbnail mt-2 shadow-sm" alt="thumb" style={{maxHeight:'150px', objectFit:'cover', width:'100%'}} />}
                                        </div>

                                        {/* Gallery Previews ✅ FIXED */}
                                        <div className="mb-3">
                                            <label className="small fw-bold text-muted">Gallery (Max 4)</label>
                                            <input type="file" multiple accept="image/*" onChange={(e) => setGalleryImgs(Array.from(e.target.files).slice(0, 4))} className="form-control border-0 bg-light mt-1" />
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {galleryImgs.map((file, index) => (
                                                    <div key={index} className="position-relative" style={{ width: '45%' }}>
                                                        <img src={URL.createObjectURL(file)} className="rounded shadow-sm w-100" style={{ height: '60px', objectFit: 'cover' }} alt={`gallery-${index}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Legal Documents Preview ✅ FIXED */}
                                        <div>
                                            <label className="small fw-bold text-muted">Legal Documents</label>
                                            <input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => setPropertyDocs(Array.from(e.target.files))} className="form-control border-0 bg-light mt-1" />
                                            <div className="mt-2">
                                                {propertyDocs.map((file, index) => (
                                                    <div key={index} className="p-2 mb-1 bg-light rounded border d-flex align-items-center" style={{ fontSize: '12px' }}>
                                                        <i className="fas fa-file-pdf text-danger me-2"></i>
                                                        <span className="text-truncate" style={{maxWidth: '180px'}}>{file.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
                .transition-all { transition: all 0.3s ease; }
                input[type=number]::-webkit-inner-spin-button { display: none; }
            `}</style>
        </section>
    );
};

export default PropertyForm;