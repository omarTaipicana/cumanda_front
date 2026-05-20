import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const InstitutoProtectedRoute = () => {
    const[, , , loggedUser, , , , , , , , , , user,,] = useAuth();
    const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;


    useEffect(() => {
        loggedUser();
    }, []);

    if (user) {
        if (
            user?.role?.slice(0, 9) === "instituto" ||
            user?.cI === superAdmin
        ) {
            return <Outlet />;
        } else {
            return <Navigate to="/home" />;
        }
    }
};
export default InstitutoProtectedRoute