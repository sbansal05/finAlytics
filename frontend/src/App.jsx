import React, { useContext } from 'react';
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const { token } = useContext(AuthContext);

  return (
    <div>
      {token ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;