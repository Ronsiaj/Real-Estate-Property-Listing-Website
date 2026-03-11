import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";
import { Line, Doughnut } from "react-chartjs-2";
import { 
    Users, Home, MessageSquare, TrendingUp, DollarSign, 
    Activity, Bell, Calendar, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, ArcElement, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, 
    ArcElement, Tooltip, Legend, Filler
);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState(null);
    const [range, setRange] = useState("month");

    // ✅ Filter logic-ah fetch function kulla pass panrom machan
    const fetchDashboard = async (selectedRange) => {
        dispatch(loadingTrue());
        try {
            const res = await Handler({
                method: "get",
                url: `/reports/dashboard.php?range=${selectedRange}`
            });
            if (res?.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            dispatch(loadingFalse());
        }
    };

    // ✅ Range maarum pothu automatic-ah fetch aagum
    useEffect(() => { 
        fetchDashboard(range); 
    }, [range]);

    // ✅ Loader state handle panrom, data null-ah iruntha error varaama thadukkum
    if (!data) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
            <div className="spinner-border text-success"></div>
        </div>
    );

    // ✅ Safely destructure with default values
    const { 
        summary = {}, 
        charts = {}, 
        top_performing_property = null, 
        most_popular_plan = {}, 
        notifications = [] 
    } = data;

    return (
        <div className="admin-dashboard bg-light min-vh-100 p-4">
            
            {/* 🟢 HEADER SECTION */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Executive Dashboard</h3>
                    <p className="text-muted small mb-0">Real-time performance metrics</p>
                </div>
                <div className="d-flex align-items-center gap-3 bg-white p-2 rounded-pill shadow-sm border">
                    <Calendar size={18} className="text-success ms-2" />
                    <select
                        className="form-select border-0 shadow-none bg-transparent fw-bold text-dark"
                        style={{ width: '180px', cursor: 'pointer' }}
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="12months">Last 12 Months</option>
                    </select>
                </div>
            </div>

            {/* 🟢 KPI SECTION */}
            <div className="row g-4 mb-5">
                <KPICard title="Revenue" value={`₹ ${(summary.revenue || 0).toLocaleString()}`} 
                    growth={summary.revenue_growth_percent} icon={<DollarSign />} color="#07c196" isRevenue />
                <KPICard title="Enquiries" value={summary.total_enquiries || 0} icon={<MessageSquare />} color="#0d6efd" />
                <KPICard title="Active Users" value={summary.active_users || 0} icon={<Users />} color="#fd7e14" />
                <KPICard title="Total Properties" value={summary.total_properties || 0} icon={<Home />} color="#6f42c1" />
            </div>

            {/* 🟢 CHARTS SECTION */}
            <div className="row g-4 mb-5">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h6 className="fw-bold text-dark mb-4">Engagement Trend</h6>
                        <div style={{ height: '320px' }}>
                            <Line 
                                data={{
                                    labels: charts.enquiries?.labels || [],
                                    datasets: [
                                        {
                                            label: "Enquiries",
                                            data: charts.enquiries?.datasets[0]?.data || [],
                                            borderColor: '#07c196',
                                            backgroundColor: 'rgba(7, 193, 150, 0.1)',
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4
                                        }
                                    ]
                                }} 
                                options={premiumLineOptions} 
                            />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h6 className="fw-bold text-dark mb-4">Property Distribution</h6>
                        <div style={{ height: '250px' }}>
                            <Doughnut 
                                data={{
                                    labels: charts.properties?.labels || [],
                                    datasets: [{
                                        data: charts.properties?.datasets[0]?.data || [],
                                        backgroundColor: ['#07c196', '#0d6efd', '#fd7e14', '#6f42c1', '#20c997'],
                                        borderWidth: 0
                                    }]
                                }} 
                                options={premiumDoughnutOptions} 
                            />
                        </div>
                        <div className="mt-4">
                            {charts.properties?.labels?.map((label, i) => (
                                <div key={i} className="d-flex justify-content-between align-items-center mb-2 small">
                                    <span className="text-muted"><span className="dot me-2" style={{backgroundColor: ['#07c196', '#0d6efd', '#fd7e14', '#6f42c1', '#20c997'][i]}}></span>{label}</span>
                                    <span className="fw-bold">{charts.properties.datasets[0].data[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 LOWER INSIGHTS */}
            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white h-100">
                        <h6 className="text-uppercase small fw-bold opacity-50 mb-4">Top Performance</h6>
                        
                        {/* ✅ Optional Chaining added to fix the Null Error */}
                        <div className="mb-4">
                            <p className="small mb-1 opacity-75">Top Property</p>
                            <h4 className="fw-bold text-success text-capitalize">{top_performing_property?.property_name || "No Data Available"}</h4>
                            {top_performing_property && (
                                <span className="badge rounded-pill bg-success bg-opacity-25 text-success px-3 py-2 mt-2" style={{fontSize:'11px'}}>
                                    {top_performing_property.total} Enquiries Recorded
                                </span>
                            )}
                        </div>
                        
                        <hr className="opacity-25" />
                        <div>
                            <p className="small mb-1 opacity-75">Most Popular Plan</p>
                            <h5 className="fw-bold">{most_popular_plan?.plan_name || "Free Tier"}</h5>
                            <span className="small opacity-50">{most_popular_plan?.total || 0} Subscriptions</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h6 className="fw-bold text-dark mb-4">Recent Activity Log</h6>
                        <div className="activity-list">
                            {notifications.length === 0 ? (
                                <p className="text-center py-5 text-muted">No recent activity</p>
                            ) : (
                                notifications.map((n, i) => (
                                    <div key={i} className="d-flex align-items-center justify-content-between border-bottom py-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="icon-circle bg-light text-success"><Activity size={14} /></div>
                                            <div>
                                                <div className="fw-bold text-dark small">{n.type}</div>
                                                <div className="text-muted" style={{fontSize: '11px'}}>{new Date(n.time).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={16} className="text-muted opacity-50" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; }
                .icon-circle { height: 32px; width: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .bg-revenue { background: linear-gradient(135deg, #07c196 0%, #05a57f 100%); color: white !important; }
                .card { transition: all 0.3s ease; }
                .card:hover { transform: translateY(-5px); }
            `}</style>
        </div>
    );
};

/* 🟢 SUB-COMPONENTS */

const KPICard = ({ title, value, icon, color, growth, isRevenue }) => (
    <div className="col-md-3">
        <div className={`card border-0 shadow-sm rounded-4 h-100 ${isRevenue ? 'bg-revenue shadow-lg' : 'bg-white'}`}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-2 rounded-3 shadow-sm" style={{backgroundColor: isRevenue ? 'rgba(255,255,255,0.2)' : `${color}15`, color: isRevenue ? '#fff' : color}}>
                        {icon}
                    </div>
                    {growth !== undefined && (
                        <div className={`small fw-bold d-flex align-items-center ${growth >= 0 ? (isRevenue ? 'text-white' : 'text-success') : 'text-danger'}`}>
                            {growth >= 0 ? <ArrowUpRight size={14} className="me-1" /> : <ArrowDownRight size={14} className="me-1" />}
                            {Math.abs(growth)}%
                        </div>
                    )}
                </div>
                <small className={isRevenue ? 'text-white-50' : 'text-muted'}>{title}</small>
                <h3 className="fw-bold mb-0 mt-1">{value}</h3>
            </div>
        </div>
    </div>
);

const premiumLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#999', font: { size: 11 } } },
        y: { border: { display: false }, grid: { color: '#f0f0f0' }, ticks: { color: '#999', font: { size: 11 } } }
    }
};

const premiumDoughnutOptions = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
};

export default AdminDashboard;