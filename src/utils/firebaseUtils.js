import { db, auth, storage } from "../lib/firebase"
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { sendNotificationToAllUsers, validateEmailConfig } from "./emailService"

// Function to create a new user with email and password
export const createUser = async (email, password, additionalData = {}) => {
  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update user profile (e.g., display name)
    if (additionalData.fullName) {
      await updateProfile(user, { displayName: additionalData.fullName })
    }

    // Create a user document in Firestore
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, {
      email: user.email,
      fullName: additionalData.fullName || "",
      role: additionalData.role || "user", // Default role
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.displayName || auth.currentUser?.email || "System",
      emailNotifications: true, // Default to receiving email notifications
      ...additionalData,
    })

    return { uid: user.uid, email: user.email, ...additionalData }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

// Function to get all users from Firestore
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection)
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return usersList
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Function to get users who want to receive email notifications
export const getUsersForEmailNotifications = async () => {
  try {
    const users = await getAllUsers()
    // Filter users who have email notifications enabled (default to true if not set)
    return users.filter((user) => user.emailNotifications !== false && user.email)
  } catch (error) {
    console.error("Error fetching users for email notifications:", error)
    throw error
  }
}

// Function to get all vessels from Firestore
export const getAllVessels = async () => {
  try {
    const vesselsCollection = collection(db, "vessels")
    const vesselsSnapshot = await getDocs(vesselsCollection)
    const vesselsList = vesselsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return vesselsList
  } catch (error) {
    console.error("Error fetching vessels:", error)
    throw error
  }
}

// Function to update a user's data in Firestore
export const updateUser = async (userId, data) => {
  try {
    const userDocRef = doc(db, "users", userId)
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.displayName || auth.currentUser?.email || "System",
    })
    return true
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Function to delete a user from Firestore
export const deleteUser = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId)
    await deleteDoc(userDocRef)
    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

// Function to get a vessel by ID from Firestore
export const getVesselById = async (vesselId) => {
  try {
    const vesselDocRef = doc(db, "vessels", vesselId)
    const vesselDoc = await getDoc(vesselDocRef)

    if (vesselDoc.exists()) {
      return { id: vesselDoc.id, ...vesselDoc.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching vessel:", error)
    throw error
  }
}

// Helper function to generate a unique filename
const generateUniqueFilename = (file) => {
  const extension = file.name.split(".").pop()
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`
}

// Function to upload an image to Firebase Storage with better error handling
const uploadImage = async (file, path) => {
  try {
    // Check if storage is available
    if (!storage) {
      throw new Error("Firebase Storage is not configured")
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to upload images")
    }

    const filename = generateUniqueFilename(file)
    const storageRef = ref(storage, `${path}/${filename}`)

    console.log("Uploading image to:", `${path}/${filename}`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    console.log("Image uploaded successfully")

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("Download URL obtained:", downloadURL)

    return {
      url: downloadURL,
      path: `${path}/${filename}`,
      filename,
    }
  } catch (error) {
    console.error("Error uploading image:", error)

    // Provide more specific error messages
    if (error.code === "storage/unauthorized") {
      throw new Error("Permission denied: Please check Firebase Storage security rules")
    } else if (error.code === "storage/quota-exceeded") {
      throw new Error("Storage quota exceeded")
    } else if (error.code === "storage/unauthenticated") {
      throw new Error("User not authenticated")
    } else {
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }
}

// Function to upload any file to Firebase Storage
const uploadFile = async (file, path) => {
  try {
    // Check if storage is available
    if (!storage) {
      throw new Error("Firebase Storage is not configured")
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to upload files")
    }

    const filename = generateUniqueFilename(file)
    const storageRef = ref(storage, `${path}/${filename}`)

    console.log("Uploading file to:", `${path}/${filename}`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    console.log("File uploaded successfully")

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("Download URL obtained:", downloadURL)

    return {
      url: downloadURL,
      path: `${path}/${filename}`,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error("Error uploading file:", error)

    // Provide more specific error messages
    if (error.code === "storage/unauthorized") {
      throw new Error("Permission denied: Please check Firebase Storage security rules")
    } else if (error.code === "storage/quota-exceeded") {
      throw new Error("Storage quota exceeded")
    } else if (error.code === "storage/unauthenticated") {
      throw new Error("User not authenticated")
    } else {
      throw new Error(`File upload failed: ${error.message}`)
    }
  }
}

// Function to delete an image from Firebase Storage
const deleteImage = async (imagePath) => {
  try {
    // If the image is a placeholder or doesn't exist, don't try to delete
    if (!imagePath || imagePath.includes("placeholder")) {
      return
    }

    // Extract the path from the URL if it's a full URL
    const path = imagePath
    if (imagePath.startsWith("http")) {
      // This is a simplified approach - in a real app, you'd need a more robust way to get the path
      // For Firebase Storage URLs, you might need to decode the URL or store the path separately
      console.log("Cannot delete image by URL. Path needed.")
      return
    }

    const imageRef = ref(storage, path)
    await deleteObject(imageRef)
    console.log("Image deleted successfully")
  } catch (error) {
    console.error("Error deleting image:", error)
    // Don't throw the error to prevent blocking other operations
  }
}

// Function to delete a file from Firebase Storage
const deleteFile = async (filePath) => {
  try {
    if (!filePath) {
      return
    }

    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
    console.log("File deleted successfully")
  } catch (error) {
    console.error("Error deleting file:", error)
    // Don't throw the error to prevent blocking other operations
  }
}

// Function to create a vessel with an image (with fallback for storage issues)
export const createVesselWithImage = async (vesselData, imageFile) => {
  try {
    // Get current user info for tracking
    const currentUser = auth.currentUser
    const createdBy = currentUser?.displayName || currentUser?.email || "Unknown User"

    // First, create the vessel document without image
    const vesselsCollection = collection(db, "vessels")
    const vesselRef = await addDoc(vesselsCollection, {
      ...vesselData,
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: createdBy,
    })

    console.log("Vessel document created with ID:", vesselRef.id)

    // If there's an image file, try to upload it
    if (imageFile) {
      try {
        console.log("Attempting to upload image...")
        const imageInfo = await uploadImage(imageFile, `vessels/${vesselRef.id}`)

        // Update the vessel document with the image URL
        await updateDoc(vesselRef, {
          image: imageInfo.url,
          imagePath: imageInfo.path,
          updatedAt: new Date().toISOString(),
          updatedBy: createdBy,
        })

        console.log("Vessel updated with image URL")
      } catch (imageError) {
        console.error("Image upload failed, but vessel was created:", imageError)

        // Update the vessel with a placeholder image and error info
        await updateDoc(vesselRef, {
          image: "/placeholder.svg",
          imageUploadError: imageError.message,
          imageUploadAttempted: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: createdBy,
        })

        // Don't throw the error - vessel creation succeeded even if image upload failed
        console.warn("Vessel created successfully but image upload failed. Using placeholder image.")
      }
    }

    return vesselRef.id
  } catch (error) {
    console.error("Error creating vessel:", error)
    throw error
  }
}

// Function to update a vessel with a new image (with fallback for storage issues)
export const updateVesselWithImage = async (vesselId, vesselData, newImageFile, currentImagePath) => {
  try {
    const currentUser = auth.currentUser
    const updatedBy = currentUser?.displayName || currentUser?.email || "Unknown User"

    const vesselRef = doc(db, "vessels", vesselId)

    // If there's a new image file, try to upload it
    if (newImageFile) {
      try {
        console.log("Attempting to upload new image...")

        // Upload the new image
        const imageInfo = await uploadImage(newImageFile, `vessels/${vesselId}`)

        // Delete the old image if it exists and isn't a placeholder
        if (currentImagePath && !currentImagePath.includes("placeholder")) {
          await deleteImage(currentImagePath)
        }

        // Update vessel data with new image info
        await updateDoc(vesselRef, {
          ...vesselData,
          image: imageInfo.url,
          imagePath: imageInfo.path,
          updatedAt: new Date().toISOString(),
          updatedBy: updatedBy,
          imageUploadError: null, // Clear any previous upload errors
        })

        console.log("Vessel updated with new image")
      } catch (imageError) {
        console.error("Image upload failed during update:", imageError)

        // Update vessel data without changing the image
        await updateDoc(vesselRef, {
          ...vesselData,
          updatedAt: new Date().toISOString(),
          updatedBy: updatedBy,
          imageUploadError: imageError.message,
          imageUploadAttempted: new Date().toISOString(),
        })

        // Throw the error for image upload failures during updates
        throw new Error(`Vessel updated but image upload failed: ${imageError.message}`)
      }
    } else {
      // Just update the vessel data without changing the image
      await updateDoc(vesselRef, {
        ...vesselData,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy,
      })
    }

    return true
  } catch (error) {
    console.error("Error updating vessel with image:", error)
    throw error
  }
}

// Function to delete a vessel and its associated image
export const deleteVessel = async (vesselId) => {
  try {
    // Get the vessel to find the image path
    const vesselData = await getVesselById(vesselId)

    // Delete the vessel document
    const vesselRef = doc(db, "vessels", vesselId)
    await deleteDoc(vesselRef)

    // If the vessel has an image, delete it too
    if (vesselData && vesselData.imagePath) {
      await deleteImage(vesselData.imagePath)
    }

    return true
  } catch (error) {
    console.error("Error deleting vessel:", error)
    throw error
  }
}

// Function to get all notifications
export const getAllNotifications = async () => {
  try {
    const notificationsCollection = collection(db, "notifications")
    const notificationsSnapshot = await getDocs(notificationsCollection)
    const notificationsList = notificationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Sort by createdAt (newest first)
    return notificationsList.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }
}

// Function to add a new notification with improved email handling
export const addNotification = async (notificationData, sendEmails = true) => {
  try {
    const currentUser = auth.currentUser
    const createdBy = currentUser?.displayName || currentUser?.email || "System"

    // Make sure we have all required fields
    const notification = {
      message: notificationData.message || "",
      priority: notificationData.priority || "normal",
      createdAt: notificationData.createdAt || new Date().toISOString(),
      createdBy: createdBy,
      emailsSent: false,
      emailResults: [],
    }

    // Add to Firestore
    const notificationsCollection = collection(db, "notifications")
    const notificationRef = await addDoc(notificationsCollection, notification)

    

    // Send emails if requested and EmailJS is configured
    if (sendEmails ) {
      try {
        

        // Get users who want to receive email notifications
        const users = await getUsersForEmailNotifications()

        if (users.length > 0) {
          // Send emails to all users
          const emailResult = await sendNotificationToAllUsers(notification, users)

          // Update the notification with email results
          await updateDoc(notificationRef, {
            emailsSent: true,
            emailResults: emailResult.results,
            emailSummary: emailResult.summary,
            emailSentAt: new Date().toISOString(),
            emailCount: emailResult.summary.total,
            successfulEmails: emailResult.summary.successful,
            failedEmails: emailResult.summary.total,
          })

          
        } else {
          

          await updateDoc(notificationRef, {
            emailsSent: false,
            emailError: "No users found for email notifications",
            emailAttemptedAt: new Date().toISOString(),
          })
        }
      } catch (emailError) {
        

        // Update notification to indicate email failure
        await updateDoc(notificationRef, {
          emailsSent: false,
          emailError: emailError.message,
          emailAttemptedAt: new Date().toISOString(),
        })
      }
    } else if (sendEmails ) {
      

      await updateDoc(notificationRef, {
        emailsSent: false,
        emailError: "Email service not configured",
      })
    }

    return notificationRef.id
  } catch (error) {
    
    // Log more details about the error
    if (error.code) {
      console.error("Error code:", error.code)
    }
    throw error
  }
}

// Function to update a notification
export const updateNotification = async (notificationId, data) => {
  try {
    const currentUser = auth.currentUser
    const updatedBy = currentUser?.displayName || currentUser?.email || "System"

    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy,
    })
    return true
  } catch (error) {
    console.error("Error updating notification:", error)
    throw error
  }
}

// Function to delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await deleteDoc(notificationRef)
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

// Function to get all LPG price data
export const getAllLPGPrices = async () => {
  try {
    const lpgCollection = collection(db, "lpgPrices")
    const lpgSnapshot = await getDocs(lpgCollection)
    const lpgList = lpgSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Sort by date (newest first)
    return lpgList.sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0)
    })
  } catch (error) {
    console.error("Error fetching LPG prices:", error)
    throw error
  }
}

// Function to add a new LPG price entry
export const addLPGPrice = async (lpgData) => {
  try {
    const currentUser = auth.currentUser
    const createdBy = currentUser?.displayName || currentUser?.email || "System"

    console.log("Adding LPG price:", lpgData)

    // Ensure we have a valid lpgPrices collection reference
    const lpgCollection = collection(db, "lpgPrices")

    // Add timestamp if not provided
    const dataToAdd = {
      ...lpgData,
      createdAt: lpgData.createdAt || new Date().toISOString(),
      createdBy: createdBy,
    }

    // Add the document to Firestore
    const docRef = await addDoc(lpgCollection, dataToAdd)
    console.log("LPG price added with ID:", docRef.id)

    return docRef.id
  } catch (error) {
    console.error("Error adding LPG price:", error)
    // Log more details about the error
    if (error.code) {
      console.error("Error code:", error.code)
    }
    throw error
  }
}

// Function to update an LPG price entry
export const updateLPGPrice = async (lpgId, data) => {
  try {
    const currentUser = auth.currentUser
    const updatedBy = currentUser?.displayName || currentUser?.email || "System"

    console.log("Updating LPG price:", lpgId, data)

    // Get a reference to the document
    const lpgRef = doc(db, "lpgPrices", lpgId)

    // Update the document
    await updateDoc(lpgRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy,
    })

    console.log("LPG price updated successfully")
    return true
  } catch (error) {
    console.error("Error updating LPG price:", error)
    throw error
  }
}

// Function to delete an LPG price entry
export const deleteLPGPrice = async (lpgId) => {
  try {
    const lpgRef = doc(db, "lpgPrices", lpgId)
    await deleteDoc(lpgRef)
    return true
  } catch (error) {
    console.error("Error deleting LPG price:", error)
    throw error
  }
}

// Function to save a trip report with file attachments
export const saveTripReport = async (reportData, attachmentFiles = []) => {
  try {
    const currentUser = auth.currentUser
    const createdBy = currentUser?.displayName || currentUser?.email || "Unknown User"

    // Upload files first if any
    const uploadedFiles = []
    if (attachmentFiles && attachmentFiles.length > 0) {
      console.log(`Uploading ${attachmentFiles.length} files...`)

      for (const file of attachmentFiles) {
        try {
          const fileInfo = await uploadFile(file, `trip-reports/${Date.now()}`)
          uploadedFiles.push({
            ...fileInfo,
            uploadedAt: new Date().toISOString(),
            uploadedBy: createdBy,
          })
          console.log(`File uploaded: ${file.name}`)
        } catch (fileError) {
          console.error(`Failed to upload file ${file.name}:`, fileError)
          // Continue with other files even if one fails
        }
      }
    }

    // Add to Firestore with file information
    const tripReportsCollection = collection(db, "tripReports")
    const reportRef = await addDoc(tripReportsCollection, {
      ...reportData,
      attachedFiles: uploadedFiles,
      fileCount: uploadedFiles.length,
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
    })

    console.log("Trip report saved successfully with ID:", reportRef.id)
    console.log(`${uploadedFiles.length} files attached to the report`)

    return reportRef.id
  } catch (error) {
    console.error("Error saving trip report:", error)

    // Provide more helpful error messages for permission issues
    if (error.code === "permission-denied") {
      throw new Error(
        "Permission denied: Please update your Firestore security rules to allow access to the tripReports collection.",
      )
    }

    throw error
  }
}

// Function to get all trip reports
export const getAllTripReports = async () => {
  try {
    const tripReportsCollection = collection(db, "tripReports")
    const reportsSnapshot = await getDocs(tripReportsCollection)
    const reportsList = reportsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Sort by date (newest first)
    return reportsList.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  } catch (error) {
    console.error("Error fetching trip reports:", error)

    // If it's a permission error, return empty array instead of throwing
    if (error.code === "permission-denied") {
      console.warn("Permission denied for tripReports collection. Please update Firestore security rules.")
      return []
    }

    throw error
  }
}

// Function to get a trip report by ID
export const getTripReportById = async (reportId) => {
  try {
    const reportRef = doc(db, "tripReports", reportId)
    const reportDoc = await getDoc(reportRef)

    if (reportDoc.exists()) {
      return { id: reportDoc.id, ...reportDoc.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error fetching trip report:", error)
    throw error
  }
}

// Function to delete a trip report and its attached files
export const deleteTripReport = async (reportId) => {
  try {
    // Get the report to find attached files
    const report = await getTripReportById(reportId)

    // Delete attached files from storage
    if (report && report.attachedFiles && report.attachedFiles.length > 0) {
      for (const file of report.attachedFiles) {
        if (file.path) {
          await deleteFile(file.path)
        }
      }
    }

    // Delete the report document
    const reportRef = doc(db, "tripReports", reportId)
    await deleteDoc(reportRef)

    return true
  } catch (error) {
    console.error("Error deleting trip report:", error)
    throw error
  }
}

// Function to get trip reports for a specific vessel
export const getTripReportsByVessel = async (vesselId) => {
  try {
    const tripReportsCollection = collection(db, "tripReports")
    const reportsSnapshot = await getDocs(tripReportsCollection)
    const reportsList = reportsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((report) => report.vesselId === vesselId)

    // Sort by date (newest first)
    return reportsList.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  } catch (error) {
    console.error("Error fetching trip reports by vessel:", error)
    throw error
  }
}

// Function to get trip reports for a specific month and year
export const getTripReportsByMonth = async (month, year) => {
  try {
    const tripReportsCollection = collection(db, "tripReports")
    const reportsSnapshot = await getDocs(tripReportsCollection)

    // Filter reports by month and year
    const reportsList = reportsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((report) => {
        const reportDate = new Date(report.date)
        return reportDate.getMonth() === month && reportDate.getFullYear() === year
      })

    // Sort by date (newest first)
    return reportsList.sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  } catch (error) {
    console.error("Error fetching trip reports by month:", error)
    throw error
  }
}
