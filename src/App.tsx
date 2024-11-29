import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import CustomFields from './pages/CustomFields';
import Deals from './pages/Deals';
import DealDetails from './pages/DealDetails';
import PipelineSettings from './pages/PipelineSettings';
import LossReasons from './pages/LossReasons';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/companies" element={<PrivateRoute><Companies /></PrivateRoute>} />
        <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
        <Route path="/deals" element={<PrivateRoute><Deals /></PrivateRoute>} />
        <Route path="/deals/:id" element={<PrivateRoute><DealDetails /></PrivateRoute>} />
        <Route path="/settings/custom-fields" element={<PrivateRoute><CustomFields /></PrivateRoute>} />
        <Route path="/settings/pipelines" element={<PrivateRoute><PipelineSettings /></PrivateRoute>} />
        <Route path="/settings/pipelines/loss-reasons" element={<PrivateRoute><LossReasons /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;