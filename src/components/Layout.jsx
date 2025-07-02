import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import ChatBot from "./ChatBot"

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto bg-muted/40">{children}</main>
      </div>
      <ChatBot />
    </div>
  )
}

export default Layout
