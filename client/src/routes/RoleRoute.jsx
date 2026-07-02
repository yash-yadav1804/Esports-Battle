import { Navigate } from "react-router-dom";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/tournaments" replace />;
  }

  return children;
};

export default RoleRoute;
