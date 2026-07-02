import { Navigate } from "react-router-dom";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/tournaments" replace />;
  }

  return children;
};

export default AdminRoute;
