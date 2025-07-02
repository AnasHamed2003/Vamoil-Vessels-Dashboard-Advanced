"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, BarChart2, Info, Phone, Search, Sun, Moon } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./ThemeProvider"

const Navbar = () => {
  const location = useLocation()
  const { theme, toggleTheme, isDark } = useTheme()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center px-4 md:px-6 transition-colors duration-200">
      <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
        <Link
          to="/"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/")
              ? "text-[#2e1a47] dark:text-white"
              : "text-muted-foreground dark:text-gray-400 hover:text-[#2e1a47] dark:hover:text-white"
          }`}
        >
          <Home className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Home</span>
        </Link>
        <Link
          to="/statistics"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/statistics")
              ? "text-[#2e1a47] dark:text-white"
              : "text-muted-foreground dark:text-gray-400 hover:text-[#2e1a47] dark:hover:text-white"
          }`}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Statistics</span>
        </Link>
        <Link
          to="/about"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/about")
              ? "text-[#2e1a47] dark:text-white"
              : "text-muted-foreground dark:text-gray-400 hover:text-[#2e1a47] dark:hover:text-white"
          }`}
        >
          <Info className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">About Us</span>
        </Link>
        <Link
          to="/contact"
          className={`flex items-center text-sm font-medium transition-colors ${
            isActive("/contact")
              ? "text-[#2e1a47] dark:text-white"
              : "text-muted-foreground dark:text-gray-400 hover:text-[#2e1a47] dark:hover:text-white"
          }`}
        >
          <Phone className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">Contact Us</span>
        </Link>
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="rounded-md border border-input dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[150px] lg:w-[250px] dark:text-white transition-colors duration-200"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-gray-600" />}
        </Button>
      </div>
    </header>
  )
}

export default Navbar
