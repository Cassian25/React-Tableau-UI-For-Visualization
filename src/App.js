import React, { lazy, Suspense } from "react";
import "antd/dist/reset.css";
import "./App.css";

const Dashboard = lazy(() => import("./components/Dashboard"));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

export default App;
