import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, LineElement, PointElement, Tooltip, Legend
} from "chart.js";
import Handler from "../../Helpers/Handler";
import { loadingTrue, loadingFalse } from "../../Reducer/loaderSlice";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend
);

const AdminRevenueDashboard = () => {
    const dispatch = useDispatch();
    const [dataSets, setDataSets] = useState(null);

    const fetchRevenue = async () => {
        dispatch(loadingTrue());
        const res = await Handler({ method: "get", url: "/reports/revenue.php" });
        if (res?.success) setDataSets(res.data);
        dispatch(loadingFalse());
    };

    useEffect(() => {
        fetchRevenue();
    }, []);

    if (!dataSets) {
        return (
            <div className="admin-page">
                <div className="admin-card text-center p-5">Loading revenue analytics...</div>
            </div>
        );
    }

    const hasPlanData = dataSets.revenue_by_plan.labels.length > 0;
    const hasTimeData = dataSets.revenue_over_time.labels.length > 0;

    return (
        <div className="admin-page">
            <div className="admin-grid">

                {/* Revenue by Plan */}
                <div className="admin-card">
                    <h5>Revenue by Plan</h5>
                    {hasPlanData ? (
                        <Doughnut data={dataSets.revenue_by_plan} />
                    ) : (
                        <div className="no-data">No revenue data available</div>
                    )}
                </div>

                {/* Revenue Over Time */}
                <div className="admin-card full-width">
                    <h5>Revenue Trend (Last 12 Months)</h5>
                    {hasTimeData ? (
                        <Bar data={dataSets.revenue_over_time} />
                    ) : (
                        <div className="no-data">No revenue trend data</div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminRevenueDashboard;
