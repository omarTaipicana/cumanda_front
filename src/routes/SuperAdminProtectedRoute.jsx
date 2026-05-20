import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const SuperAdminProtectedRoute = () => {
    const [, , , loggedUser, , , , , , , , , , user, ,] = useAuth();
    const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;


    useEffect(() => {
        loggedUser();
    }, []);

    if (user) {
        if (
            user?.cI === superAdmin
        ) {
            return <Outlet />;
        } else {
            return <Navigate to="/home" />;
        }
    }
};

export default SuperAdminProtectedRoute