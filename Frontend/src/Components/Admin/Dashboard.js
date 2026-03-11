import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";

const COLORS = ["#6366f1", "#06b6d4", "#f97316", "#22c55e", "#e11d48"];

const Dashboard = () => {
  const dispatch = useDispatch();

  const [propertyData, setPropertyData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [userData, setUserData] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    type: "",
    minPrice: "",
    maxPrice: ""
  });

  const handleChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const loadDashboard = async () => {
    dispatch(loadingTrue());

    const query = new URLSearchParams(filters).toString();

    const [p, r, u] = await Promise.all([
      Handler({ method: "get", url: `/reports/properties.php?${query}` }),
      Handler({ method: "get", url: `/reports/revenue.php` }),
      Handler({ method: "get", url: `/reports/users.php` })
    ]);

    if (p?.success) setPropertyData(p.data);
    if (r?.success) setRevenueData(r.data);
    if (u?.success) setUserData(u.data);

    dispatch(loadingFalse());
  };

  /* 🔥 Debounce filter change */
  useEffect(() => {
    const delay = setTimeout(() => {
      loadDashboard();
    }, 500); // 500ms delay

    return () => clearTimeout(delay);
  }, [filters]);

  /* Initial load */
  useEffect(() => {
    loadDashboard();
  }, []);

  const formatData = (chart) =>
    chart?.labels?.map((label, i) => ({
      name: label,
      value: chart.datasets[0].data[i]
    })) || [];

  return (
    <div className="container-fluid py-4">

      {/* FILTER CARD */}
      <div className="admin-card mb-4">
        <div className="row g-3 align-items-end">

          <div className="col-md-3">
            <label className="form-label">Category</label>
            <select name="category" className="form-control" onChange={handleChange}>
              <option value="">All</option>
              <option value="1">Residential</option>
              <option value="2">Commercial</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Type</label>
            <select name="type" className="form-control" onChange={handleChange}>
              <option value="">All</option>
              <option value="1">Apartment</option>
              <option value="2">Villa</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Min Price</label>
            <input type="number" name="minPrice" className="form-control" onChange={handleChange} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Max Price</label>
            <input type="number" name="maxPrice" className="form-control" onChange={handleChange} />
          </div>

        </div>
      </div>

      {/* CHART ROW */}
      <div className="row g-4">

        <div className="col-12 col-md-6">
          <div className="admin-card">
            <div className="admin-card-header">
              <h4>Properties by Category</h4>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={formatData(propertyData?.properties_by_category)} dataKey="value" outerRadius={100}>
                  {formatData(propertyData?.properties_by_category).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="admin-card">
            <div className="admin-card-header">
              <h4>Revenue by Plan</h4>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={formatData(revenueData?.revenue_by_plan)} dataKey="value" outerRadius={100}>
                  {formatData(revenueData?.revenue_by_plan).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12">
          <div className="admin-card">
            <div className="admin-card-header">
              <h4>Revenue Trend</h4>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatData(revenueData?.revenue_over_time)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-12">
          <div className="admin-card">
            <div className="admin-card-header">
              <h4>New Users Trend</h4>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatData(userData?.users_by_signup_month)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
