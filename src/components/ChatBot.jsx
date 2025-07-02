"use client"

import { useState, useRef, useEffect } from "react"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Ship,
  Calculator,
  FileText,
  BarChart3,
  Settings,
  Minimize2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { useTheme } from "./ThemeProvider"

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "Hello! I'm your Vamoil assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const { isDark } = useTheme()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const quickActions = [
    { icon: Ship, text: "How to add a vessel?", action: "add_vessel" },
    { icon: Calculator, text: "Trip cost calculation", action: "trip_calculator" },
    { icon: FileText, text: "Generate reports", action: "reports" },
    { icon: BarChart3, text: "View statistics", action: "statistics" },
    { icon: Settings, text: "Account settings", action: "settings" },
  ]

  const botResponses = {
    // Vessel Management
    add_vessel: {
      message:
        'To add a new vessel:\n\n1. Go to the "Vessels" page from the sidebar\n2. Click the "Add Vessel" button\n3. Fill in the vessel details (name, type, capacity, etc.)\n4. Upload vessel documents if needed\n5. Click "Save Vessel"\n\nNote: You need admin privileges to add vessels.',
      followUp: ["How to edit vessel?", "Vessel types available", "Upload vessel documents"],
    },
    edit_vessel: {
      message:
        'To edit a vessel:\n\n1. Go to "Vessels" page\n2. Find the vessel you want to edit\n3. Click "Details" to view vessel information\n4. Click "Edit" button (admin only)\n5. Update the information\n6. Save changes\n\nAll changes are tracked with timestamps.',
      followUp: ["Delete vessel", "View vessel history", "Vessel permissions"],
    },
    vessel_types: {
      message:
        "Vamoil manages these vessel types:\n\n• Oil Tanker - For crude oil transport\n• LPG Carrier - For liquefied petroleum gas\n• Chemical Tanker - For chemical products\n• Bulk Carrier - For dry bulk cargo\n\nEach type has specific capacity and operational parameters.",
      followUp: ["Add vessel", "Vessel specifications", "Vessel tracking"],
    },

    // Trip Calculator
    trip_calculator: {
      message:
        'The Trip Cost Calculator helps estimate shipping costs:\n\n1. Go to "Trip Calculator" from sidebar\n2. Select vessel type\n3. Enter origin and destination\n4. Input cargo weight/volume\n5. Add fuel prices and other costs\n6. Click "Calculate" for cost breakdown\n\nYou can save calculations as trip reports.',
      followUp: ["Save trip report", "Upload trip documents", "Export calculations"],
    },
    save_trip: {
      message:
        'To save a trip calculation:\n\n1. Complete your trip calculation\n2. Click "Save as Report" button\n3. Add trip description and notes\n4. Upload supporting documents (optional)\n5. Click "Save Trip Report"\n\nSaved trips appear in your Reports section.',
      followUp: ["View saved trips", "Upload documents", "Export trip data"],
    },

    // Reports
    reports: {
      message:
        'Generate various reports:\n\n1. Go to "Reports" page\n2. Choose report type:\n   • Monthly Reports\n   • Financial Reports\n   • Performance Reports\n3. Select date range\n4. Click "Generate Report"\n5. Download as PDF or CSV\n\nReports include all trip data and attachments.',
      followUp: ["Export formats", "Schedule reports", "Report templates"],
    },
    export_data: {
      message:
        "Export options available:\n\n• PDF Reports - Detailed formatted reports\n• CSV Files - Data for spreadsheet analysis\n• Trip Summaries - Quick overview exports\n\nAll exports include file attachments and metadata.",
      followUp: ["PDF customization", "Data filtering", "Bulk exports"],
    },

    // Statistics
    statistics: {
      message:
        'View comprehensive statistics:\n\n1. Go to "Statistics" page\n2. View charts for:\n   • Vessel utilization\n   • Cost trends\n   • Route efficiency\n   • Fuel consumption\n3. Filter by date range or vessel type\n4. Export statistical data\n\nCharts update in real-time with your data.',
      followUp: ["Custom charts", "Data analysis", "Performance metrics"],
    },

    // Account & Settings
    settings: {
      message:
        'Manage your account:\n\n1. Click your profile in the sidebar\n2. Go to "Profile" page\n3. Update personal information\n4. Change password\n5. Set notification preferences\n\nAdmins can access additional settings in Admin Dashboard.',
      followUp: ["Admin features", "User permissions", "Notifications"],
    },
    admin_features: {
      message:
        "Admin features include:\n\n• User Management - Add/edit/delete users\n• Vessel Management - Full vessel control\n• System Notifications - Send announcements\n• Data Management - Backup and maintenance\n• Reports Access - All user reports\n\nAccess via Admin Dashboard in sidebar.",
      followUp: ["Add users", "User roles", "System backup"],
    },

    // LPG Prices
    lpg_prices: {
      message:
        'Track LPG market prices:\n\n1. Go to "LPG Prices" page\n2. View current market rates\n3. See price history charts\n4. Compare regional prices\n5. Set price alerts (coming soon)\n\nPrices update regularly from market sources.',
      followUp: ["Price alerts", "Historical data", "Market analysis"],
    },

    // General Help
    navigation: {
      message:
        "Navigate the system:\n\n• Sidebar - Main navigation menu\n• Dashboard - Overview and quick actions\n• Top navbar - Search and profile access\n• Breadcrumbs - Track your location\n• Quick actions - Common tasks shortcuts\n\nUse Ctrl+B to toggle sidebar.",
      followUp: ["Keyboard shortcuts", "Mobile navigation", "Search features"],
    },
    search: {
      message:
        "Search functionality:\n\n• Top search bar - Find vessels, trips, reports\n• Filter options - Narrow down results\n• Quick filters - Common search criteria\n• Advanced search - Detailed filtering\n\nSearch works across all your accessible data.",
      followUp: ["Advanced filters", "Search tips", "Saved searches"],
    },

    // Default responses
    default: {
      message:
        "I can help you with:\n\n• Vessel management and tracking\n• Trip cost calculations\n• Report generation and exports\n• System navigation and features\n• Account settings and preferences\n\nWhat would you like to know more about?",
      followUp: ["Vessel management", "Trip calculator", "Reports", "Statistics", "Account settings"],
    },
  }

  const processMessage = (message) => {
    const lowerMessage = message.toLowerCase()

    // Keyword matching for responses
    if (lowerMessage.includes("vessel") && (lowerMessage.includes("add") || lowerMessage.includes("create"))) {
      return "add_vessel"
    }
    if (lowerMessage.includes("vessel") && (lowerMessage.includes("edit") || lowerMessage.includes("update"))) {
      return "edit_vessel"
    }
    if (lowerMessage.includes("vessel") && lowerMessage.includes("type")) {
      return "vessel_types"
    }
    if (lowerMessage.includes("trip") && (lowerMessage.includes("calculate") || lowerMessage.includes("cost"))) {
      return "trip_calculator"
    }
    if (lowerMessage.includes("trip") && lowerMessage.includes("save")) {
      return "save_trip"
    }
    if (lowerMessage.includes("report")) {
      return "reports"
    }
    if (lowerMessage.includes("export") || lowerMessage.includes("download")) {
      return "export_data"
    }
    if (lowerMessage.includes("statistic") || lowerMessage.includes("chart")) {
      return "statistics"
    }
    if (lowerMessage.includes("setting") || lowerMessage.includes("profile") || lowerMessage.includes("account")) {
      return "settings"
    }
    if (lowerMessage.includes("admin")) {
      return "admin_features"
    }
    if (lowerMessage.includes("lpg") || lowerMessage.includes("price")) {
      return "lpg_prices"
    }
    if (lowerMessage.includes("navigate") || lowerMessage.includes("menu")) {
      return "navigation"
    }
    if (lowerMessage.includes("search") || lowerMessage.includes("find")) {
      return "search"
    }

    return "default"
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      message: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate bot thinking time
    setTimeout(() => {
      const responseKey = processMessage(inputMessage)
      const response = botResponses[responseKey] || botResponses.default

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        message: response.message,
        followUp: response.followUp,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleQuickAction = (action) => {
    const response = botResponses[action] || botResponses.default

    const botMessage = {
      id: Date.now(),
      type: "bot",
      message: response.message,
      followUp: response.followUp,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
  }

  const handleFollowUp = (followUpText) => {
    setInputMessage(followUpText)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full bg-gradient-to-r from-[#2e1a47] to-[#3d2456] hover:from-[#3d2456] hover:to-[#4a2d5f] dark:from-[#4a2d5f] dark:to-[#5a3d6f] dark:hover:from-[#5a3d6f] dark:hover:to-[#6a4d7f] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
            size="icon"
          >
            <MessageCircle className="h-7 w-7 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2 h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card
            className={`w-96 shadow-2xl border-0 overflow-hidden transition-all duration-300 ${
              isMinimized ? "h-16" : "h-[600px]"
            } ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}
          >
            {/* Header */}
            <CardHeader
              className="bg-gradient-to-r from-[#2e1a47] to-[#3d2456] dark:from-[#4a2d5f] dark:to-[#5a3d6f] text-white p-4 cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="h-6 w-6" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Vamoil Assistant</CardTitle>
                    <p className="text-xs text-white/80">Online • Ready to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMinimized(!isMinimized)
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsOpen(false)
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Content */}
            {!isMinimized && (
              <CardContent className="flex flex-col p-0 h-[536px]">
                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent transition-colors duration-200 ${
                    isDark ? "bg-gray-800/50" : "bg-gray-50/50"
                  }`}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark ? "#4b5563 transparent" : "#cbd5e1 transparent",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div
                        className={`flex items-start gap-3 max-w-[85%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            msg.type === "user"
                              ? "bg-gradient-to-r from-[#2e1a47] to-[#3d2456] dark:from-[#4a2d5f] dark:to-[#5a3d6f]"
                              : isDark
                                ? "bg-gray-700 border-2 border-gray-600"
                                : "bg-white border-2 border-gray-200"
                          }`}
                        >
                          {msg.type === "user" ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className={`h-5 w-5 ${isDark ? "text-white" : "text-[#2e1a47]"}`} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm transition-colors duration-200 ${
                              msg.type === "user"
                                ? "bg-gradient-to-r from-[#2e1a47] to-[#3d2456] dark:from-[#4a2d5f] dark:to-[#5a3d6f] text-white rounded-br-md"
                                : isDark
                                  ? "bg-gray-700 text-white border border-gray-600 rounded-bl-md"
                                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                            }`}
                          >
                            <div className="whitespace-pre-line text-sm leading-relaxed">{msg.message}</div>
                            {msg.followUp && (
                              <div className="mt-3 space-y-2">
                                <div className="text-xs opacity-70 font-medium">Quick actions:</div>
                                <div className="flex flex-wrap gap-1">
                                  {msg.followUp.map((followUp, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleFollowUp(followUp)}
                                      className="text-xs bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 rounded-full px-3 py-1 transition-all duration-200 hover:scale-105"
                                    >
                                      {followUp}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            className={`text-xs mt-1 transition-colors duration-200 ${
                              msg.type === "user" ? "text-right" : "text-left"
                            } ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            isDark ? "bg-gray-700 border-2 border-gray-600" : "bg-white border-2 border-gray-200"
                          }`}
                        >
                          <Bot className={`h-5 w-5 ${isDark ? "text-white" : "text-[#2e1a47]"}`} />
                        </div>
                        <div
                          className={`rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border transition-colors duration-200 ${
                            isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#2e1a47] dark:bg-white rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-[#2e1a47] dark:bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-[#2e1a47] dark:bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div
                    className={`p-4 border-t transition-colors duration-200 ${
                      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Quick help topics:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.action)}
                          className={`flex items-center gap-3 text-left text-sm p-3 rounded-xl transition-all duration-200 border group ${
                            isDark
                              ? "hover:bg-gray-700 border-gray-600 hover:border-[#4a2d5f]/40"
                              : "hover:bg-gray-50 border-gray-100 hover:border-[#2e1a47]/20"
                          } hover:shadow-sm`}
                        >
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "bg-[#4a2d5f]/20 group-hover:bg-[#4a2d5f]/30"
                                : "bg-[#2e1a47]/10 group-hover:bg-[#2e1a47]/20"
                            }`}
                          >
                            <action.icon className={`h-4 w-4 ${isDark ? "text-white" : "text-[#2e1a47]"}`} />
                          </div>
                          <span
                            className={`font-medium transition-colors ${
                              isDark
                                ? "text-gray-300 group-hover:text-white"
                                : "text-gray-700 group-hover:text-[#2e1a47]"
                            }`}
                          >
                            {action.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div
                  className={`p-4 border-t transition-colors duration-200 ${
                    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        className={`w-full resize-none border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e1a47]/20 transition-all duration-200 pr-12 ${
                          isDark
                            ? "border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:border-[#4a2d5f]"
                            : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-[#2e1a47]"
                        }`}
                        rows="1"
                        style={{
                          minHeight: "48px",
                          maxHeight: "120px",
                          scrollbarWidth: "thin",
                          scrollbarColor: isDark ? "#4b5563 transparent" : "#cbd5e1 transparent",
                        }}
                      />
                      <div
                        className={`absolute right-3 bottom-3 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Press Enter to send
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-gradient-to-r from-[#2e1a47] to-[#3d2456] hover:from-[#3d2456] hover:to-[#4a2d5f] dark:from-[#4a2d5f] dark:to-[#5a3d6f] dark:hover:from-[#5a3d6f] dark:hover:to-[#6a4d7f] h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="icon"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-300 {
          scrollbar-color: ${isDark ? "#4b5563" : "#d1d5db"} transparent;
        }
        .scrollbar-track-transparent {
          scrollbar-track-color: transparent;
        }
        /* Webkit scrollbar styles */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${isDark ? "#4b5563" : "#d1d5db"};
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "#6b7280" : "#9ca3af"};
        }
      `}</style>
    </>
  )
}

export default ChatBot
