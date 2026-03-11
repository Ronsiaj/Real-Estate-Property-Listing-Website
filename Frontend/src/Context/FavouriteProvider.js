import React, { createContext, useContext, useState, useEffect } from "react";
import Handler from "../Helpers/Handler";
import { useAuth } from "./AuthenticateProvider";
import { toast } from "react-toastify";

const FavouriteContext = createContext();

export const useFavourite = () => useContext(FavouriteContext);

export const FavouriteProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch favourites on load or user change
    const fetchFavourites = async () => {
        if (!isAuthenticated) {
            setFavourites([]);
            return;
        }
        setLoading(true);
        try {
            const res = await Handler({
                url: "/favourites/list.php",
                method: "GET",
            });
            if (res.success) {
                setFavourites(res.data || []);
            }
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavourites();
    }, [isAuthenticated]);

    const isFavorite = (propertyId) => {
        return favourites.some((item) => Number(item.property_id) === Number(propertyId));
    };

    const toggleFavorite = async (property) => {
        if (!isAuthenticated) {
            toast.info("Please login to add to favorites");
            return;
        }

        const propertyId = property.property_id;
        const exists = isFavorite(propertyId);

        try {
            if (exists) {
                // Remove from favorites
                const res = await Handler({ url: "/favourites/remove.php", method: "delete", data: { property_id: propertyId }, });
                if (res.success) {
                    setFavourites((prev) => prev.filter((item) => Number(item.property_id) !== Number(propertyId)));
                    toast.success("Removed from favorites");
                } else {
                    toast.error(res.msg || "Failed to remove from favorites");
                }
            } else {
                // Add to favorites
                const res = await Handler({
                    url: "/favourites/add.php",
                    method: "POST",
                    data: { property_id: propertyId },
                });

                if (res.success) {
                    // If we have the full property object, add it to the list
                    // Otherwise, we might need to fetch the updated list or just add a minimal version
                    setFavourites((prev) => [...prev, { ...property, property_id: propertyId }]);
                    toast.success("Added to favorites");
                } else {
                    toast.error(res.msg || "Failed to add to favorites");
                }
            }
        } catch (err) {
            toast.error("An error occurred while updating favorites");
        }
    };

    return (
        <FavouriteContext.Provider
            value={{
                favourites,
                isFavorite,
                toggleFavorite,
                loading,
                refreshFavorites: fetchFavourites,
            }}
        >
            {children}
        </FavouriteContext.Provider>
    );
};
