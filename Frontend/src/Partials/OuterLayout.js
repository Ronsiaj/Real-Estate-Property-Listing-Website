import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Outer = () => {
    return (
        <React.Fragment>
            <Header />
            <div className="outer-wrapper">
                <Outlet />
            </div>
            <Footer />
        </React.Fragment>
    );
};

export default Outer;
