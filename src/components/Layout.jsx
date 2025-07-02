import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import ChatBot from "./ChatBot"

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto bg-muted/40 dark:bg-gray-800/40 transition-colors duration-200">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  )
}

export default Layout
