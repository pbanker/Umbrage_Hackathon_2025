import { Route, Routes } from "react-router-dom";
import LoginPage from "./login/login";
import DashboardPage from "./dashboard/dashboard";
import ChatPage from "./chat/chat";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route path="chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
