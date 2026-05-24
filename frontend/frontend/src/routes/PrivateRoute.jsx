// import { Navigate } from "react-router-dom";

// function PrivateRoute({ children }) {
//   const token = localStorage.getItem("access");

//   return token ? children : <Navigate to="/login" />;
// }

// export default PrivateRoute;





import { Navigate } from "react-router-dom";

// allowedRoles — optional array e.g. ["admin"] or ["instructor"]
// If not passed, any logged-in user is allowed through.

export default function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access");
  const role  = localStorage.getItem("role");

  // Not logged in → send to login
  if (!token) return <Navigate to="/login" replace />;

  // Logged in but wrong role → send to their own dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
