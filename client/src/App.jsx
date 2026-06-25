import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route
          path="/tournaments/:tournamentId"
          element={<TournamentDetails />}
        />
      </Routes>
    </>
  );
};

export default App;
