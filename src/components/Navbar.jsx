import { Link, useLocation } from "react-router-dom"
import { Home, BarChart2, Info, Phone, Search } from "lucide-react"

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="h-16 border-b bg-white flex items-center px-4 md:px-6">
      <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
        <Link
          to="/"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/") ? "text-[#2e1a47]" : "text-muted-foreground hover:text-[#2e1a47]"
          }`}
        >
          <Home className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Home</span>
        </Link>
        <Link
          to="/statistics"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/statistics") ? "text-[#2e1a47]" : "text-muted-foreground hover:text-[#2e1a47]"
          }`}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Statistics</span>
        </Link>
        <Link
          to="/about"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/about") ? "text-[#2e1a47]" : "text-muted-foreground hover:text-[#2e1a47]"
          }`}
        >
          <Info className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">About Us</span>
        </Link>
        <Link
          to="/contact"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/contact") ? "text-[#2e1a47]" : "text-muted-foreground hover:text-[#2e1a47]"
          }`}
        >
          <Phone className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Contact Us</span>
        </Link>
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="rounded-md border border-input bg-white px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
