import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { Layout, ProtectedRoute } from '@/components';
import {
  LoginPage,
  LoadingPage,
  DashboardPage,
  AccountPage,
  PatientsPage,
  MyTasksPage,
  InformationPage,
  ReturningPage,
  SchedulingPage,
  SurgeryPage,
  SettingsPage,
  SmsManagementPage,
} from '@/pages';
import StatusPage from '@/pages/StatusPage';
import AuditLogsPage from '@/pages/AuditLogsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loading" element={<LoadingPage />} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/my-tasks" element={<MyTasksPage />} />
              <Route path="/information" element={<InformationPage />} />
              <Route path="/returning" element={<ReturningPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/scheduling" element={<SchedulingPage />} />
              <Route path="/surgery" element={<SurgeryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/sms-management" element={<SmsManagementPage />} />
            </Route>

            {/* Redirect root to loading */}
            <Route path="/" element={<Navigate to="/loading" replace />} />

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/loading" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
