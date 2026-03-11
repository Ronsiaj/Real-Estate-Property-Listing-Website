import React, { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export const useView = () => useContext(ViewContext);

const ViewProvider = ({ children }) => {
    const [viewedProperties, setViewedProperties] = useState(() => {
        const saved = localStorage.getItem("viewed_properties");
        return saved ? JSON.parse(saved) : [];
    });

    const trackView = (propertyId) => {
        if (!propertyId) return;
        setViewedProperties((prev) => {
            if (prev.includes(propertyId)) return prev;
            const next = [...prev, propertyId];
            localStorage.setItem("viewed_properties", JSON.stringify(next));
            return next;
        });
    };

    const viewCount = viewedProperties.length;

    return (
        <ViewContext.Provider value={{ viewCount, trackView, viewedProperties }}>
            {children}
        </ViewContext.Provider>
    );
};

export default ViewProvider;
