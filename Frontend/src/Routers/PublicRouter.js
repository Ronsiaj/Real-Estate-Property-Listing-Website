import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthenticateProvider";
import { useSelector } from "react-redux";

const PublicRouters = () => {
  const { token } = useAuth();
  const user = useSelector(state => state.customer.customer);
  if (token && user?.role) {
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "business") return <Navigate to="/business/dashboard" replace />;
  }
  return <Outlet />;
};

export default PublicRouters;
