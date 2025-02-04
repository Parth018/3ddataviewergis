import React from "react";
import DashboardLayout from "./components/DashboardLayout";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <div className="h-screen">
      <DashboardLayout />
      <Analytics />
    </div>
  );
}

export default App;
