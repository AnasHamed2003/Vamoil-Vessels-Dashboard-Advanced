// EmailJS integration for real email sending
import emailjs from "@emailjs/browser"

// EmailJS configuration - replace with your actual values
const EMAILJS_CONFIG = {
  serviceId: "service_r3ygqcu", // Your EmailJS service ID
  templateId: "template_9em6jv5", // Your template ID
  publicKey: "ly4KczT0wFs4BJKH7", // Your EmailJS public key
  developmentMode: false, // Set to false to use real emails
}

// Initialize EmailJS (call this once when the app starts)
export const initializeEmailJS = () => {
  if (EMAILJS_CONFIG.publicKey !== "ly4KczT0wFs4BJKH7") {
    emailjs.init(EMAILJS_CONFIG.publicKey)
    console.log("📧 EmailJS initialized successfully")
  } else {
    console.warn("⚠️ EmailJS not configured - using development mode")
  }
}

// Function to send email via EmailJS
const sendEmailViaEmailJS = async (templateParams) => {
  try {
    console.log("📧 Sending email via EmailJS:", templateParams)

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey,
    )

    console.log("✅ EmailJS response:", response)

    return {
      success: true,
      messageId: response.text,
      status: response.status === 200 ? "sent" : "failed",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ EmailJS error:", error)
    throw new Error(`EmailJS failed: ${error.text || error.message}`)
  }
}

// Mock email sending function for development
const sendEmailViaMock = async (emailData) => {
  console.log("📧 Mock email sending:", {
    to: emailData.to,
    subject: emailData.subject,
    timestamp: new Date().toISOString(),
  })

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const messageId = `dev_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log("✅ Mock email sent successfully:", messageId)

  return {
    success: true,
    messageId,
    status: "sent",
    timestamp: new Date().toISOString(),
  }
}

// Function to prepare template parameters for EmailJS
const prepareEmailJSParams = (notification, recipientEmail, recipientName) => {
  const priorityText =
    notification.priority === "urgent"
      ? "🚨 URGENT"
      : notification.priority === "high"
        ? "⚠️ HIGH PRIORITY"
        : notification.priority === "low"
          ? "ℹ️ LOW PRIORITY"
          : "📢 NOTIFICATION"

  const params = {
    to_email: recipientEmail, // Try both formats
    to: recipientEmail,
    user_email: recipientEmail,
    recipient_email: recipientEmail,
    to_name: recipientName,
    user_name: recipientName,
    from_name: "Vamoil International",
    subject: `${priorityText} - Vamoil International Notification`,
    priority: notification.priority || "normal",
    priority_text: priorityText,
    message: notification.message,
    notification_message: notification.message,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    company_name: "Vamoil International",
    system_name: "Vessel Management System",
  }

  console.log("📧 EmailJS Template Parameters:", params)
  return params
}

// Function to send email to a single recipient
export const sendNotificationEmail = async (notification, recipientEmail, recipientName) => {
  console.log(`📧 Attempting to send email to: ${recipientEmail} (${recipientName})`)

  // Validate email address
  if (!recipientEmail || !recipientEmail.includes("@")) {
    console.error(`❌ Invalid email address: ${recipientEmail}`)
    return {
      success: false,
      error: "Invalid email address",
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
      service: "validation_failed",
    }
  }

  try {
    if (EMAILJS_CONFIG.developmentMode || !isEmailJSConfigured()) {
      // Use mock service in development mode or when EmailJS is not configured
      const mockData = {
        to: recipientEmail,
        subject: `Vamoil International Notification - ${notification.priority}`,
      }
      const result = await sendEmailViaMock(mockData)

      return {
        success: true,
        result,
        recipient: recipientEmail,
        timestamp: new Date().toISOString(),
        service: "mock",
      }
    } else {
      // Use real EmailJS service
      const templateParams = prepareEmailJSParams(notification, recipientEmail, recipientName)
      const result = await sendEmailViaEmailJS(templateParams)

      console.log(`✅ Real email sent to ${recipientEmail}:`, result)
      return {
        success: true,
        result,
        recipient: recipientEmail,
        timestamp: new Date().toISOString(),
        service: "emailjs",
      }
    }
  } catch (error) {
    console.error(`❌ Error sending email to ${recipientEmail}:`, error.message)
    return {
      success: false,
      error: error.message,
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
      service: EMAILJS_CONFIG.developmentMode ? "mock" : "emailjs",
    }
  }
}

// Function to send emails to multiple recipients with better error handling
export const sendNotificationToAllUsers = async (notification, users) => {
  console.log(`📧 Starting bulk email send to ${users.length} users...`)
  console.log(
    "📧 Users list:",
    users.map((u) => ({ email: u.email, name: u.fullName })),
  )

  if (users.length === 0) {
    console.warn("⚠️ No users provided for email sending")
    return {
      results: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        service: "no_users",
      },
    }
  }

  const results = []
  let successCount = 0
  let failureCount = 0

  for (const user of users) {
    if (user.email) {
      try {
        const result = await sendNotificationEmail(notification, user.email, user.fullName || user.email.split("@")[0])

        results.push({
          email: user.email,
          name: user.fullName || user.email.split("@")[0],
          ...result,
        })

        if (result.success) {
          successCount++
        } else {
          failureCount++
        }

        // Add a delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay for EmailJS
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error)
        results.push({
          email: user.email,
          name: user.fullName || user.email.split("@")[0],
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
          service: EMAILJS_CONFIG.developmentMode ? "mock" : "emailjs",
        })
        failureCount++
      }
    } else {
      console.warn(`⚠️ User ${user.id} has no email address`)
      results.push({
        email: "No email",
        name: user.fullName || "Unknown",
        success: false,
        error: "No email address provided",
        timestamp: new Date().toISOString(),
        service: "none",
      })
      failureCount++
    }
  }

  console.log(`📊 Bulk email send completed: ${successCount} successful, ${failureCount} failed`)

  return {
    results,
    summary: {
      total: users.length,
      successful: successCount,
      failed: failureCount,
      successRate: users.length > 0 ? ((successCount / users.length) * 100).toFixed(1) : 0,
      service: EMAILJS_CONFIG.developmentMode ? "mock" : "emailjs",
    },
  }
}

// Function to check if EmailJS is properly configured
export const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.serviceId !== "YOUR_SERVICE_ID" &&
    EMAILJS_CONFIG.publicKey !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_CONFIG.templateId === "template_9em6jv5"
  )
}

// Function to validate email configuration
export const validateEmailConfig = () => {
  if (EMAILJS_CONFIG.developmentMode) {
    return true // Always valid in development mode
  }
  return isEmailJSConfigured()
}

// Alternative: Use mailto links for simple email notifications
export const createMailtoLink = (notification, users) => {
  const emails = users
    .filter((user) => user.email)
    .map((user) => user.email)
    .join(",")
  const subject = encodeURIComponent(`Vamoil International Notification - ${notification.priority.toUpperCase()}`)
  const body = encodeURIComponent(
    `${notification.message}\n\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\n\n---\nVamoil International\nVessel Management System`,
  )

  return `mailto:${emails}?subject=${subject}&body=${body}`
}

// Function to get email service status
export const getEmailServiceStatus = () => {
  return {
    configured: isEmailJSConfigured(),
    developmentMode: EMAILJS_CONFIG.developmentMode,
    service: EMAILJS_CONFIG.developmentMode ? "Mock Service" : isEmailJSConfigured() ? "EmailJS" : "Not Configured",
    templateId: EMAILJS_CONFIG.templateId,
    status: EMAILJS_CONFIG.developmentMode
      ? "Development Mode (Mock)"
      : isEmailJSConfigured()
        ? "Production Mode (EmailJS)"
        : "Not Configured",
  }
}

// Function to toggle development mode (useful for testing)
export const setDevelopmentMode = (enabled) => {
  EMAILJS_CONFIG.developmentMode = enabled
  console.log(`📧 Email service ${enabled ? "switched to development mode" : "switched to production mode"}`)
}
