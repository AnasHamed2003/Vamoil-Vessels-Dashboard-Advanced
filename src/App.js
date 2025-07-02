import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { FirebaseProvider } from "./components/FirebaseProvider"
import { ThemeProvider } from "./components/ThemeProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import VesselsList from "./pages/VesselsList"
import VesselDetails from "./pages/VesselDetails"
import VesselForm from "./pages/VesselForm"
import TripCalculator from "./pages/TripCalculator"
import Reports from "./pages/Reports"
import Statistics from "./pages/Statistics"
import LPGPrices from "./pages/LPGPrices"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminAddUser from "./pages/AdminAddUser"
import AdminNotifications from "./pages/AdminNotifications"
import Calculator from "./pages/Calculator"
import Help from "./pages/Help"
import Contact from "./pages/Contact"
import About from "./pages/About"
import { initializeEmailJS } from "./utils/emailService"
import "./index.css"

// Initialize EmailJS when the app starts
initializeEmailJS()

function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Navigate to="/dashboard" replace />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
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
                path="/vessels/new"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VesselForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/vessels/edit/:id"
                element={
                  <ProtectedRoute>
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
                path="/contact"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Contact />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
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

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </FirebaseProvider>
  )
}

export default App
