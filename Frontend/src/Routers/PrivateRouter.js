import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthenticateProvider";
import { useSelector } from "react-redux";

const PrivateRouters = ({ allowedRoles = [] }) => {
  const { token } = useAuth();
  const user = useSelector(state => state.customer.customer);
  if (!token) return <Navigate to="/login" replace />;
  if (!user || !user.role) return null;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default PrivateRouters;
