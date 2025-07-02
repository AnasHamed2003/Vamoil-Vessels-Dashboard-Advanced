"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [formStatus, setFormStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate form submission
    setFormStatus("submitting")

    setTimeout(() => {
      console.log("Form submitted:", formData)
      setFormStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-2xl font-bold mb-6">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>

            {formStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full rounded-md border px-3 py-2"
                  required
                ></textarea>
              </div>

              <Button type="submit" disabled={formStatus === "submitting"}>
                {formStatus === "submitting" ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Headquarters</h3>
                  <p className="text-gray-600">
                    Port of Rotterdam
                    <br />
                    Wilhelminakade 909
                    <br />
                    3072 AP Rotterdam, Netherlands
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-gray-600">
                    Main Office: +31 10 123 4567
                    <br />
                    Customer Support: +31 10 123 4568
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">
                    General Inquiries: info@vamoil.com
                    <br />
                    Support: support@vamoil.com
                    <br />
                    Careers: careers@vamoil.com
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Hours of Operation</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 6:00 PM (CET)
                    <br />
                    Saturday - Sunday: Emergency Only
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Our Location</h2>
              <div className="relative">
                {/* Interactive Map */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2461.8234567890123!2d4.4777!3d51.9225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b7605f3c1234%3A0x1234567890abcdef!2sPort%20of%20Rotterdam!5e0!3m2!1sen!2snl!4v1234567890123!5m2!1sen!2snl"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-md"
                  title="Vamoil International Location - Port of Rotterdam"
                ></iframe>
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                  📍 Port of Rotterdam, Netherlands
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Strategic Location</p>
                <p>
                  Located at Europe's largest port, providing optimal access to global shipping routes and inland
                  transportation networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
