import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";
import moment from "moment";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const dispatch = useDispatch();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  /* ================= FETCH USERS ================= */

  const fetchUsers = async (pageNo = 1, query = "") => {
    dispatch(loadingTrue());

    const res = await Handler({
      method: "get",
      url: `/users/search_user.php?page=${pageNo}&limit=${limit}&q=${query}`
    });

    if (res?.success) {
      setRows(res.data?.users || []);
      setTotal(res.total_records || 0);
      setTotalPages(res.total_pages || 1);
    } else {
      setRows([]);
    }

    dispatch(loadingFalse());
  };

  /* ================= SEARCH DEBOUNCE ================= */

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(page, search);
    }, 500);

    return () => clearTimeout(delay);
  }, [search, page]);

  /* ================= EDIT USER ================= */

  const openEdit = async (id) => {
    dispatch(loadingTrue());

    const res = await Handler({ method: "get", url: `/users/view.php?id=${id}` });

    dispatch(loadingFalse());

    if (res?.success) {
      setEditUser(res.data.user);
      setForm({
        name: res.data.user.name,
        email: res.data.user.email,
        phone: res.data.user.phone
      });
      setShowModal(true);
    }
  };

  const handleUpdate = async () => {
    dispatch(loadingTrue());

    const payload = { ...form, user_id: editUser.user_id };

    const res = await Handler({
      method: "post",
      url: `/users/update.php`,
      data: payload
    });

    dispatch(loadingFalse());

    if (res?.success) {
      toast.success(res.message || res.msg);
      setShowModal(false);
      fetchUsers(page, search);
    } else {
      toast.error(res.message || res.msg);
    }
  };

  /* ================= SAFE PAGE CHANGE ================= */

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="admin-page bg-light min-vh-100 p-4">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

        {/* HEADER */}
        <div className="card-header bg-white py-4 px-4 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1 text-dark">User Directory</h4>
            <p className="text-muted small mb-0">
              Total managed users:
              <span className="fw-bold text-success"> {total}</span>
            </p>
          </div>

          <div className="d-flex gap-2">
            <div className="input-group shadow-sm" style={{ width: "350px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                placeholder="Type name or email to filter..."
                className="form-control border-start-0"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <button
              className="btn btn-dark rounded-3 px-4 fw-bold"
              onClick={() => fetchUsers(page, search)}
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table align-middle mb-0 modern-admin-table">
            <thead className="bg-light-subtle">
              <tr className="text-muted small fw-bold text-uppercase">
                <th className="ps-4">#</th>
                <th>Identity</th>
                <th>Contact Details</th>
                <th>Privilege</th>
                <th>Registration</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((u, index) => (
                  <tr key={u.user_id} className="hover-row border-bottom">
                    <td className="ps-4 text-muted">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold"
                          style={{ width: 40, height: 40 }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
                            UID-{u.user_id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-medium text-dark text-lowercase">{u.email}</div>
                      <small className="text-muted">
                        <i className="fas fa-phone-alt me-1 small"></i> {u.phone}
                      </small>
                    </td>

                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${u.role === 'admin'
                        ? 'bg-danger-subtle text-danger'
                        : 'bg-primary-subtle text-primary'
                        }`}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <div className="fw-medium text-dark">
                        {moment(u.created_at).format("MMM DD, YYYY")}
                      </div>
                      <small className="text-muted">
                        {moment(u.created_at).format("hh:mm A")}
                      </small>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-light btn-sm rounded-circle shadow-sm border p-2"
                        onClick={() => openEdit(u.user_id)}
                      >
                        <i className="fas fa-user-edit text-success"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No matching users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="d-flex justify-content-end py-4 bg-light-subtle border-top">

          <button
            className="btn btn-sm btn-outline-dark me-2"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                className={`btn btn-sm mx-1 ${page === p ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            );
          })}

          <button
            className="btn btn-sm btn-outline-dark ms-2"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>

        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
