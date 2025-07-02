import { Link, useLocation } from "react-router-dom"
import {
  Calculator,
  LayoutDashboard,
  Ship,
  FileText,
  HelpCircle,
  User,
  Users,
  Shield,
  UserPlus,
  TrendingUp,
  MapPin,
} from "lucide-react"
import { useFirebase } from "./FirebaseProvider"

const Sidebar = () => {
  const location = useLocation()
  const { userRole } = useFirebase()
  const isAdmin = userRole === "admin"

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="w-[80px] md:w-[240px] bg-[#2e1a47] dark:bg-gray-900 text-white flex flex-col h-screen transition-colors duration-200">
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="flex items-center gap-2">
          <div className="text-yellow-400 font-bold text-lg hidden md:block">Vamoil</div>
          <div className="text-xs text-gray-300 dark:text-gray-400 hidden md:block">INTERNATIONAL</div>
        </div>
      </div>

      <div className="flex-1 px-2 py-4">
        <nav className="space-y-2">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/admin/dashboard")
                  ? "bg-white/10 text-white"
                  : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
              }`}
            >
              <Shield className="h-5 w-5" />
              <span className="hidden md:inline">Admin Dashboard</span>
            </Link>
          )}

          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/")
                ? "bg-white/10 text-white"
                : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>

          <Link
            to="/vessels"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              location.pathname.includes("/vessels") &&
              !location.pathname.includes("/add") &&
              !location.pathname.includes("/edit")
                ? "bg-white/10 text-white"
                : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
            }`}
          >
            <Ship className="h-5 w-5" />
            <span className="hidden md:inline">Vessels</span>
          </Link>

          <Link
            to="/trip-calculator"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/trip-calculator")
                ? "bg-white/10 text-white"
                : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
            }`}
          >
            <MapPin className="h-5 w-5" />
            <span className="hidden md:inline">Trip Calculator</span>
          </Link>

          <Link
            to="/reports"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/reports")
                ? "bg-white/10 text-white"
                : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="hidden md:inline">Reports</span>
          </Link>

          <Link
            to="/calculator"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/calculator")
                ? "bg-white/10 text-white"
                : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span className="hidden md:inline">Calculator</span>
          </Link>

          <Link
            to="/lpg-prices"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive("/lpg-prices")
                ? "bg-white/10 text-white"
                : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="hidden md:inline">LPG Prices</span>
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/admin/users"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  location.pathname.includes("/admin/users")
                    ? "bg-white/10 text-white"
                    : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="hidden md:inline">Manage Users</span>
              </Link>

              <Link
                to="/admin/add-user"
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive("/admin/add-user")
                    ? "bg-white/10 text-white"
                    : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
                }`}
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden md:inline">Add User</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="p-4">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            isActive("/profile")
              ? "bg-white/10 text-white"
              : "text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="hidden md:inline">Profile</span>
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-3 py-2 text-gray-300 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="hidden md:inline">Help</span>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
