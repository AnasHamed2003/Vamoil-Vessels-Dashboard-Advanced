import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return ""

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Number formatting utilities
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number)
}

// String utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

export const capitalizeFirst = (str) => {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const sortBy = (array, key, direction = "asc") => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (direction === "asc") {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return defaultValue
  }
}

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error("Error writing to localStorage:", error)
    return false
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error("Error removing from localStorage:", error)
    return false
  }
}

// Color utilities
export const getStatusColor = (status) => {
  const colors = {
    active: "text-green-600 bg-green-100",
    inactive: "text-red-600 bg-red-100",
    pending: "text-yellow-600 bg-yellow-100",
    completed: "text-blue-600 bg-blue-100",
    cancelled: "text-gray-600 bg-gray-100",
  }

  return colors[status?.toLowerCase() || ""] || colors.pending
}

export const getVesselTypeColor = (type) => {
  const colors = {
    "oil tanker": "text-blue-600 bg-blue-100",
    "lpg carrier": "text-green-600 bg-green-100",
    "chemical tanker": "text-purple-600 bg-purple-100",
    "bulk carrier": "text-orange-600 bg-orange-100",
  }

  return colors[type?.toLowerCase() || ""] || "text-gray-600 bg-gray-100"
}

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Deep clone utility
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map((item) => deepClone(item))
  if (typeof obj === "object") {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Generate color from string
export const stringToColor = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}
