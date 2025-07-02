import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { FirebaseProvider } from "./components/FirebaseProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import VesselsList from "./pages/VesselsList"
import VesselDetails from "./pages/VesselDetails"
import VesselForm from "./pages/VesselForm"
import TripCalculator from "./pages/TripCalculator"
import Reports from "./pages/Reports"
import LPGPrices from "./pages/LPGPrices"
import Statistics from "./pages/Statistics"
import Profile from "./pages/Profile"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Help from "./pages/Help"
import Calculator from "./pages/Calculator"
import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminAddUser from "./pages/AdminAddUser"
import AdminNotifications from "./pages/AdminNotifications"

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vessels"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VesselsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vessels/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VesselDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vessels/add"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <VesselForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vessels/edit/:id"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <VesselForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip-calculator"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TripCalculator />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lpg-prices"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LPGPrices />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Statistics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <Layout>
                    <About />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contact"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Contact />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Help />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculator"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Calculator />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <AdminUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-user"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <AdminAddUser />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <AdminNotifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </FirebaseProvider>
  )
}

export default App
