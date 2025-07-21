import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { FirebaseProvider } from "./components/FirebaseProvider"
import { ThemeProvider } from "./components/ThemeProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

// Import pages
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import VesselsList from "./pages/VesselsList"
import VesselForm from "./pages/VesselForm"
import VesselDetails from "./pages/VesselDetails"
import VesselTracking from "./pages/VesselTracking"
import Calculator from "./pages/Calculator"
import TripCalculator from "./pages/TripCalculator"
import Statistics from "./pages/Statistics"
import Reports from "./pages/Reports"
import LPGPrices from "./pages/LPGPrices"
import Help from "./pages/Help"
import Contact from "./pages/Contact"
import About from "./pages/About"
import Profile from "./pages/Profile"

// Admin pages
import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminAddUser from "./pages/AdminAddUser"
import AdminNotifications from "./pages/AdminNotifications"
import AdminPendingReports from "./pages/AdminPendingReports"

function App() {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />

              {/* Protected routes with layout */}
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
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Vessel routes */}
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
                path="/vessels/add"
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
                path="/vessels/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VesselDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Vessel Tracking route */}
              <Route
                path="/vessel-tracking"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VesselTracking />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Calculator routes */}
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
                path="/trip-calculator"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TripCalculator />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Other routes */}
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

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminUsers />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users/add"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminAddUser />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/pending-reports"
                element={
                  <ProtectedRoute adminOnly>
                    <Layout>
                      <AdminPendingReports />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute adminOnly>
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
      </FirebaseProvider>
    </ThemeProvider>
  )
}

export default App
