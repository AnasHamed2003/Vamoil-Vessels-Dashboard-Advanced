"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

const Help = () => {
  const [activeSection, setActiveSection] = useState("faq")

  const faqs = [
    {
      question: "How do I track a vessel?",
      answer: "Navigate to the Vessels page, select a vessel, and click the Track button.",
    },
    {
      question: "How is the shipping cost calculated?",
      answer: "The shipping cost is calculated based on vessel type, distance, and cargo weight.",
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team at support@vamoil.com or call +1-234-567-8900.",
    },
    {
      question: "How do I generate reports?",
      answer: "Go to the Reports page, select the type of report you want to generate, and click Generate Report.",
    },
    {
      question: "What types of vessels does Vamoil manage?",
      answer: "Vamoil manages various types of vessels including tankers, cargo ships, and container ships.",
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-2xl font-bold mb-6">Help & Support</h1>

        <div className="flex gap-4 mb-6">
          <Button variant={activeSection === "faq" ? "default" : "outline"} onClick={() => setActiveSection("faq")}>
            FAQs
          </Button>
          <Button variant={activeSection === "guide" ? "default" : "outline"} onClick={() => setActiveSection("guide")}>
            User Guide
          </Button>
          <Button
            variant={activeSection === "contact" ? "default" : "outline"}
            onClick={() => setActiveSection("contact")}
          >
            Contact Support
          </Button>
        </div>

        {activeSection === "faq" && (
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-medium">{faq.question}</h3>
                    <p className="text-gray-600 mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "guide" && (
          <Card>
            <CardHeader>
              <CardTitle>User Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Getting Started</h3>
                  <p className="text-gray-600 mt-1">
                    Welcome to the Vamoil International vessel management dashboard. This guide will help you navigate
                    the system and use its features effectively.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Dashboard Overview</h3>
                  <p className="text-gray-600 mt-1">
                    The dashboard provides an overview of your vessels, notifications, and current LPG prices.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Managing Vessels</h3>
                  <p className="text-gray-600 mt-1">
                    Navigate to the Vessels page to view all vessels. Click on Details to see more information about a
                    specific vessel.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Generating Reports</h3>
                  <p className="text-gray-600 mt-1">
                    Use the Reports page to generate monthly, financial, and performance reports for your vessels.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Using the Calculator</h3>
                  <p className="text-gray-600 mt-1">
                    The Cost Calculator helps you estimate shipping costs based on vessel type, distance, and cargo
                    weight.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "contact" && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-gray-600 mt-1">
                    For general inquiries: info@vamoil.com
                    <br />
                    For technical support: support@vamoil.com
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Phone Support</h3>
                  <p className="text-gray-600 mt-1">
                    Customer Service: +1-234-567-8900
                    <br />
                    Technical Support: +1-234-567-8901
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Office Hours</h3>
                  <p className="text-gray-600 mt-1">
                    Monday - Friday: 9:00 AM - 5:00 PM (EST)
                    <br />
                    Saturday - Sunday: Closed
                  </p>
                </div>
                <div className="mt-6">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Your email"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows="4"
                        className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    <Button>Send Message</Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Help
