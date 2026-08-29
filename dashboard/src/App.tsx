import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage     from "./pages/DashboardPage";
import BusinessRulesPage from "./pages/BusinessRulesPage";
import CodeExplorerPage  from "./pages/CodeExplorerPage";
import RiskMapPage       from "./pages/RiskMapPage";
import SettingsPage      from "./pages/SettingsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"              element={<DashboardPage />}     />
        <Route path="/rules"         element={<BusinessRulesPage />} />
        <Route path="/code-explorer" element={<CodeExplorerPage />}  />
        <Route path="/risk-map"      element={<RiskMapPage />}       />
        <Route path="/settings"      element={<SettingsPage />}      />
        <Route path="*"              element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
