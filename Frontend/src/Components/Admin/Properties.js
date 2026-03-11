import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Analytics API hit panna

const AdminProperties = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [viewStats, setViewStats] = useState({}); // Machan views-ah store panna state
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 5; 

  // --- Analytics Fetch Logic ---
  const fetchAnalytics = async () => {
    try {
      // Intha GET API thaan top views-ah kudukum
      const res = await axios.get(`http://localhost/your_backend_file/analytics/top_views.php`);
      if (res.data.success) {
        // Machan mapping logic: { property_id: total_views }
        const stats = {};
        res.data.data.forEach(item => {
          // Un API-la 'property_id' field iruntha idha use pannu, illana property_name-ah match pannu
          stats[item.property_name] = item.total_views; 
        });
        setViewStats(stats);
      }
    } catch (err) {
      console.log("Analytics load error", err);
    }
  };

  const fetchProperties = async (pageNo = 1) => {
    dispatch(loadingTrue());
    const res = await Handler({ 
        method: "get", 
        url: `/properties/myproperty.php?page=${pageNo}&limit=${limit}` 
    });
    
    if (res?.success) {
      setRows(res?.data?.properties || []);
      setTotal(res?.data?.total || 0);
      setTotalPages(res?.data?.total_pages || 0);
      setPage(res?.data?.page || 1);
      // Property fetch aana udane analytics-um fetch panrom
      fetchAnalytics();
    }
    dispatch(loadingFalse());
  };

  useEffect(() => { 
    fetchProperties(page); 
  }, [page]);

  const getCategoryBadge = (id) => {
    const cats = { 1: "Home", 2: "Land", 3: "Plot", 4: "Commercial", 5: "Apartment", 6: "Individual", 7: "Villa" };
    return <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-semibold shadow-sm mb-1">{cats[id] || "Other"}</span>;
  };

  const getTypeBadge = (id) => {
    const types = { 1: ["For Sale", "bg-primary-subtle text-primary"], 2: ["For Rent", "bg-success-subtle text-success"], 3: ["Lease", "bg-warning-subtle text-warning"] };
    const [label, colorClass] = types[id] || ["Unknown", "bg-secondary text-white"];
    return <span className={`badge rounded-pill ${colorClass} border px-3 py-2`}>{label}</span>;
  };

  return (
    <div className="admin-page bg-white min-vh-100 p-4">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        
        {/* Header */}
        <div className="card-header bg-white py-4 px-4 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-0 text-dark">Property Inventory</h4>
            <p className="text-muted small mb-0 mt-1">Showing {rows.length} of {total} listings</p>
          </div>
          <button onClick={() => fetchProperties(page)} className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold">
            <i className="fas fa-sync-alt me-2"></i> Refresh
          </button>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="table admin-modern-table align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-uppercase small fw-bold text-muted" style={{ letterSpacing: '1px' }}>
                <th className="ps-4 py-3">Property Info</th>
                <th className="py-3">Type & Engagement</th> {/* Machan engagement nu sethuten */}
                <th className="py-3 text-center">Specifications</th>
                <th className="py-3 text-center">Room Assets</th>
                <th className="py-3 text-end">Price</th>
                <th className="pe-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((p) => (
                <tr key={p.property_id} className="border-bottom hover-row">
                  <td className="ps-4 py-4" style={{ minWidth: "280px" }}>
                    <div className="d-flex align-items-center">
                      <img 
                        src={p.thumbnail_url ? `/images/properties/${p.thumbnail_url}` : "https://via.placeholder.com/80"}
                        className="rounded-3 shadow-xs border me-3"
                        style={{ width: "65px", height: "65px", objectFit: "cover" }}
                        alt=""
                      />
                      <div>
                        <div className="fw-bold text-dark fs-6">{p.property_name}</div>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px' }}>
                          <i className="fas fa-map-marker-alt text-danger me-1 small"></i> {p.property_address}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column align-items-start gap-1">
                      {getCategoryBadge(p.category_id)}
                      {getTypeBadge(p.type_id)}
                      
                      {/* --- Machan, inga thaan analytics counter varuthu! --- */}
                      <div className="mt-2 py-1 px-2 rounded-2 bg-light border d-inline-flex align-items-center">
                        <i className="fas fa-eye text-muted me-2 small"></i>
                        <span className="small fw-bold">
                           {viewStats[p.property_name] || 0} <span className="text-muted fw-normal">views</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center small text-muted">
                    {p.beds && <div>🛏 {p.beds} Beds</div>}
                    {p.sqft && <div>📐 {p.sqft} Sqft</div>}
                    {p.acres && <div>🌾 {p.acres} Acres</div>}
                  </td>
                  <td className="text-center small">
                    {Object.entries(p.rooms || {}).map(([room, imgs]) => 
                      imgs.length > 0 && (
                        <div key={room} className="badge bg-light text-dark border me-1 mb-1 px-2">
                          {room.replace("_", " ")} ({imgs.length})
                        </div>
                      )
                    )}
                    <div className="mt-1">
                        <span className="me-2"><i className="fas fa-images text-primary"></i> {p.gallery_imgs?.length || 0}</span>
                        <span><i className="fas fa-file-pdf text-danger"></i> {p.property_documents?.length || 0}</span>
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="fw-bold fs-5 text-dark">₹{Number(p.price || 0).toLocaleString()}</div>
                  </td>
                  <td className="pe-4 text-center">
                    <div className="dropdown">
                      <button className="btn btn-light btn-sm rounded-circle border shadow-sm" data-bs-toggle="dropdown" style={{ width: 35, height: 35 }}>
                        <i className="fas fa-ellipsis-v text-muted"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2">
                        <li><button className="dropdown-item rounded-2 py-2" onClick={() => navigate(`/admin/view-property/${p.property_id}`)}><i className="fas fa-eye text-primary me-2"></i> View Profile</button></li>
                        <li><button className="dropdown-item rounded-2 py-2" onClick={() => navigate(`/admin/edit-property/${p.property_id}`)}><i className="fas fa-edit text-success me-2"></i> Edit Details</button></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item rounded-2 py-2 text-danger"><i className="fas fa-trash me-2"></i> Delete</button></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- STYLISH PAGINATION --- */}
        <div className="card-footer bg-white py-3 px-4 border-top d-flex justify-content-between align-items-center">
          <div className="small text-muted fw-medium">
            Showing Page <span className="text-dark fw-bold">{page}</span> of {totalPages}
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link rounded-3 border-0 shadow-sm px-3" onClick={() => setPage(page - 1)}>
                    Previous
                </button>
              </li>
              
              {[...Array(totalPages)].map((_, idx) => {
                  const pNo = idx + 1;
                  return (
                    <li key={pNo} className={`page-item ${page === pNo ? 'active' : ''}`}>
                        <button 
                            className={`page-link rounded-3 border-0 shadow-sm px-3 ${page === pNo ? 'bg-dark text-white' : 'bg-light text-dark'}`}
                            onClick={() => setPage(pNo)}
                        >
                            {pNo}
                        </button>
                    </li>
                  )
              })}

              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link rounded-3 border-0 shadow-sm px-3" onClick={() => setPage(page + 1)}>
                    Next
                </button>
              </li>
            </ul>
          </nav>
        </div>

      </div>

      <style>{`
        .hover-row:hover { background-color: #fcfcfc !important; }
        .page-link { transition: all 0.2s ease; cursor: pointer; }
        .page-link:hover { background-color: #333 !important; color: #fff !important; }
        .active .page-link { background-color: #000 !important; border-color: #000 !important; }
        .bg-primary-subtle { background-color: #e7f1ff; }
        .bg-success-subtle { background-color: #e1f7ec; }
        .bg-warning-subtle { background-color: #fff8e1; }
        .shadow-xs { box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
};

export default AdminProperties;