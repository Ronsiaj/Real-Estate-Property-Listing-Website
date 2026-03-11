import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";

const AdminEnquiries = () => {
  const dispatch = useDispatch();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchEnquiries = async (pg = 1) => {
    dispatch(loadingTrue());

    const res = await Handler({
      method: "get",
      url: `/enquiries/list.php?page=${pg}&limit=10`
    });

    if (res?.success) {
      setRows(res.data || []);
      setPages(res.pages || 1);
      setPage(res.page || 1);
    } else {
      setRows([]);
    }

    dispatch(loadingFalse());
  };

  useEffect(() => {
    fetchEnquiries(page);
  }, [page]);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  return (
    <div className="admin-page">
      <div className="admin-card">

        <div className="admin-card-header">
          <h4>Enquiries</h4>
          <span className="admin-sub">Customer enquiries list</span>
        </div>

        <div className="table-responsive">
          <table className="table admin-table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Property</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((item, index) => (
                  <tr key={item.enquiry_id}>
                    <td>{(page - 1) * 10 + index + 1}</td>

                    <td className="fw-semibold">{item.user_name}</td>

                    <td className="fw-semibold">{item.mobile}</td>

                    <td>
                      <span className="badge bg-primary-soft text-primary">
                        {item.property_name}
                      </span>
                    </td>

                    <td style={{ maxWidth: 250 }}>
                      {item.message}
                    </td>

                    <td className="text-muted small">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No enquiries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mt-3">

          <small className="text-muted">
            Page {page} of {pages}
          </small>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <button
              className="btn btn-sm btn-outline-primary"
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminEnquiries;
