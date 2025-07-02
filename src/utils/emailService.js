// EmailJS integration for real email sending
import emailjs from "@emailjs/browser"

// EmailJS configuration - replace with your actual values
const EMAILJS_CONFIG = {
  serviceId: "service_r3ygqcu", // Your EmailJS service ID
  templateId: "template_9em6jv5", // Your template ID
  publicKey: "ly4KczT0wFs4BJKH7", // Your EmailJS public key
}

// Initialize EmailJS (call this once when the app starts)
export const initializeEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.publicKey)
}

// Function to send email via EmailJS
const sendEmailViaEmailJS = async (templateParams) => {
  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey,
    )

    return {
      success: true,
      messageId: response.text,
      status: response.status === 200 ? "sent" : "failed",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    throw new Error(`EmailJS failed: ${error.text || error.message}`)
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

  return {
    to_email: recipientEmail,
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
}

// Function to send email to a single recipient
export const sendNotificationEmail = async (notification, recipientEmail, recipientName) => {
  // Validate email address
  if (!recipientEmail || !recipientEmail.includes("@")) {
    return {
      success: false,
      error: "Invalid email address",
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const templateParams = prepareEmailJSParams(notification, recipientEmail, recipientName)
    const result = await sendEmailViaEmailJS(templateParams)

    return {
      success: true,
      result,
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
    }
  }
}

// Function to send emails to multiple recipients
export const sendNotificationToAllUsers = async (notification, users) => {
  if (users.length === 0) {
    return {
      results: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
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
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        results.push({
          email: user.email,
          name: user.fullName || user.email.split("@")[0],
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        })
        failureCount++
      }
    } else {
      results.push({
        email: "No email",
        name: user.fullName || "Unknown",
        success: false,
        error: "No email address provided",
        timestamp: new Date().toISOString(),
      })
      failureCount++
    }
  }

  return {
    results,
    summary: {
      total: users.length,
      successful: successCount,
      failed: failureCount,
      successRate: users.length > 0 ? ((successCount / users.length) * 100).toFixed(1) : 0,
    },
  }
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
