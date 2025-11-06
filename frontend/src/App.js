import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AssetProvider } from "./context/AssetContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CommanderDashboard from "./pages/CommanderDashboard";
import LogisticsDashboard from "./pages/LogisticsDashboard";

function App() {
  return (
    <AssetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/commander/dashboard" element={<CommanderDashboard />} />
          <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
        </Routes>
      </Router>
    </AssetProvider>
  );
}

export default App;
