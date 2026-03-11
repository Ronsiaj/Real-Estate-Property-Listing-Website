import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Zap, ChevronLeft } from "lucide-react";
import axios from "axios";

const Payment = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await axios.get("http://localhost/your_backend_file/payments/plans.php");
            if (res.data.success) {
                const fetchedPlans = res.data.plans || [];
                setPlans(fetchedPlans);
                setSelectedPlan(fetchedPlans[0] || null); // Machan first plan default selection
            }
        } catch (err) {
            console.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = () => {
        if (!selectedPlan) return;
        alert(`Proceeding payment for ${selectedPlan.plan_name} - ₹${selectedPlan.price}`);
        // Razorpay integration inga varum
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
                <div className="spinner-border text-success"></div>
            </div>
        );
    }

    return (
        <div className="payment-page bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5 col-md-8">
                        <div className="card border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                            
                            {/* ✅ HEADER SECTION */}
                            <div className="card-header bg-success text-white text-center py-5 border-0 position-relative">
                                <Zap size={48} className="mb-2" />
                                <h2 className="fw-bold mb-0">Premium Access</h2>
                                <p className="mb-0 opacity-75 small">Unlock unlimited property views & leads</p>
                            </div>

                            <div className="card-body p-4 text-center">

                                {/* ✅ PLAN SELECTOR (Horizontal Tab Style like Image) */}
                                <div className="plan-tab-container d-flex bg-light p-1 rounded-pill mb-5 border">
                                    {plans && plans.map(plan => {
                                        const active = selectedPlan?.plan_id === plan.plan_id;
                                        return (
                                            <div
                                                key={plan.plan_id}
                                                onClick={() => setSelectedPlan(plan)}
                                                className={`flex-fill py-2 px-3 rounded-pill fw-bold text-center transition-all cursor-pointer
                                                    ${active ? "bg-success text-white shadow-sm" : "text-secondary"}`}
                                                style={{ fontSize: '0.9rem' }}
                                            >
                                                {plan.plan_name} • {plan.duration_days} days
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ✅ DYNAMIC PRICE DISPLAY */}
                                <div className="pricing-section mb-5">
                                    <h1 className="fw-bold text-dark display-3 mb-0">
                                        ₹{Number(selectedPlan?.price).toFixed(2)}
                                    </h1>
                                    <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small">
                                        Valid for {selectedPlan?.duration_days} days
                                    </div>
                                </div>

                                {/* ✅ FEATURES LIST */}
                                <div className="features-list text-start mb-5 px-md-3">
                                    <Feature text="Unlimited Property Details" />
                                    <Feature text="Direct Seller Contact Number" />
                                    <Feature text="Priority Property Alerts" />
                                    <Feature text="No Hidden Charges" />
                                </div>

                                {/* ✅ ACTION BUTTONS */}
                                <button
                                    className="btn btn-success btn-lg w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3 shadow"
                                    onClick={handlePayment}
                                >
                                    <CreditCard size={20} />
                                    Proceed to Payment
                                </button>

                                <button
                                    className="btn btn-link btn-sm w-100 text-decoration-none text-muted fw-semibold"
                                    onClick={() => navigate(-1)}
                                >
                                    Back to browsing
                                </button>
                            </div>

                            <div className="card-footer bg-white text-center py-3 border-top-0 opacity-50">
                                <small className="small d-flex align-items-center justify-content-center gap-2">
                                    Secure 256-bit SSL encrypted payment
                                </small>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .payment-page { font-family: 'Inter', sans-serif; }
                .bg-success-subtle { background-color: #eaf7f4; }
                .rounded-4 { border-radius: 2rem !important; }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .cursor-pointer { cursor: pointer; }
                .shadow-lg { box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
                .plan-tab-container { background: #f8fafc; }
            `}</style>
        </div>
    );
};

/* Reusable Feature Item */
const Feature = ({ text }) => (
    <div className="d-flex align-items-center mb-3">
        <div className="bg-success-subtle text-success rounded-circle p-1 me-3 d-flex align-items-center justify-content-center">
            <ShieldCheck size={18} />
        </div>
        <span className="fw-medium text-dark-emphasis small">{text}</span>
    </div>
);

export default Payment;