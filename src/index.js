import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { FirebaseProvider } from "./components/FirebaseProvider"

// Clear all authentication data on app initialization
const clearAllAuthData = () => {
  try {
    // Clear localStorage
    const localKeys = Object.keys(localStorage)
    localKeys.forEach((key) => {
      if (
        key.startsWith("firebase:") ||
        key.startsWith("CachedAuthUser") ||
        key.includes("auth") ||
        key.includes("user")
      ) {
        localStorage.removeItem(key)
      }
    })

    // Clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach((key) => {
      if (
        key.startsWith("firebase:") ||
        key.startsWith("CachedAuthUser") ||
        key.includes("auth") ||
        key.includes("user")
      ) {
        sessionStorage.removeItem(key)
      }
    })

    // Clear any cookies related to authentication
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    console.log("All authentication data cleared on app start")
  } catch (error) {
    console.log("Error clearing auth data:", error)
  }
}

// Clear auth data immediately when the app starts
clearAllAuthData()

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
