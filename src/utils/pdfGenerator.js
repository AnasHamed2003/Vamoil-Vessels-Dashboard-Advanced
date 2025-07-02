// PDF Generation utility using browser's built-in print functionality
export const generateTripReportPDF = (reports, includeStatistics = true) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new window for PDF generation
      const printWindow = window.open("", "_blank", "width=800,height=600")

      if (!printWindow) {
        reject(new Error("Popup blocked. Please allow popups for this site."))
        return
      }

      const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        } catch (error) {
          return "Invalid Date"
        }
      }

      const formatDateTime = (dateString) => {
        if (!dateString) return "N/A"
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        } catch (error) {
          return "Invalid Date"
        }
      }

      const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
      }

      const getFileIcon = (fileType) => {
        if (fileType && fileType.startsWith("image/")) return "🖼️"
        if (fileType === "application/pdf") return "📄"
        if (fileType && fileType.includes("word")) return "📝"
        if (fileType && (fileType.includes("excel") || fileType.includes("sheet"))) return "📊"
        if (fileType && fileType.includes("text")) return "📋"
        return "📁"
      }

      // Calculate statistics
      const calculateStatistics = () => {
        if (!reports.length) return null

        const totalCost = reports.reduce((sum, report) => sum + (report.summary?.totalCost || 0), 0)
        const totalRevenue = reports.reduce((sum, report) => sum + (report.summary?.totalRevenue || 0), 0)
        const totalProfit = totalRevenue - totalCost
        const totalDays = reports.reduce((sum, report) => sum + (report.summary?.totalDays || 0), 0)
        const totalCapacity = reports.reduce((sum, report) => sum + (report.summary?.vesselCapacityMT || 0), 0)

        const reportsWithMargin = reports.filter(
          (report) => report.summary && report.summary.totalProfitMargin !== undefined,
        )

        const averageProfitMargin =
          reportsWithMargin.length > 0
            ? reportsWithMargin.reduce((sum, report) => sum + report.summary.totalProfitMargin, 0) /
              reportsWithMargin.length
            : 0

        const profitableTrips = reports.filter((report) => report.summary && report.summary.totalProfit > 0).length

        return {
          totalTrips: reports.length,
          totalCost,
          totalRevenue,
          totalProfit,
          averageProfitMargin,
          totalDays,
          profitableTrips,
        }
      }

      const stats = calculateStatistics()

      // Generate HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>VAMOIL Trip Reports</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              body { margin: 0; }
              .no-print { display: none !important; }
              .page-break { page-break-before: always; }
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              margin: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .report-title {
              font-size: 18px;
              color: #374151;
              margin-bottom: 10px;
            }
            
            .export-info {
              font-size: 10px;
              color: #6b7280;
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
            }
            
            .creation-info {
              background-color: #f0f9ff;
              border: 1px solid #bfdbfe;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              font-size: 11px;
            }
            
            .creation-info h4 {
              margin: 0 0 10px 0;
              color: #1e40af;
              font-size: 13px;
              font-weight: bold;
            }
            
            .creation-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .creation-item {
              display: flex;
              align-items: center;
            }
            
            .creation-label {
              font-weight: bold;
              margin-right: 8px;
              color: #374151;
            }
            
            .attachments-section {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
              font-size: 11px;
            }
            
            .attachments-section h4 {
              margin: 0 0 10px 0;
              color: #92400e;
              font-size: 13px;
              font-weight: bold;
            }
            
            .file-list {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 8px;
            }
            
            .file-item {
              display: flex;
              align-items: center;
              padding: 8px;
              background-color: #fffbeb;
              border: 1px solid #fbbf24;
              border-radius: 4px;
            }
            
            .file-icon {
              margin-right: 8px;
              font-size: 14px;
            }
            
            .file-details {
              flex: 1;
            }
            
            .file-name {
              font-weight: bold;
              color: #92400e;
              font-size: 10px;
            }
            
            .file-meta {
              color: #a16207;
              font-size: 9px;
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            
            .stat-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            
            .stat-card.revenue { background-color: #f0fdf4; border-color: #22c55e; }
            .stat-card.cost { background-color: #fef2f2; border-color: #ef4444; }
            .stat-card.profit { background-color: #f0f9ff; border-color: #3b82f6; }
            .stat-card.trips { background-color: #fefce8; border-color: #eab308; }
            
            .stat-label {
              font-size: 11px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            
            .stat-value {
              font-size: 18px;
              font-weight: bold;
            }
            
            .stat-sub {
              font-size: 9px;
              color: #6b7280;
              margin-top: 3px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11px;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f9fafb;
              font-weight: bold;
              color: #374151;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .text-green { color: #059669; }
            .text-red { color: #dc2626; }
            .text-blue { color: #2563eb; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .report-detail {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background-color: #fafafa;
            }
            
            .detail-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }
            
            .detail-section h4 {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1f2937;
            }
            
            .detail-item {
              margin-bottom: 5px;
              font-size: 11px;
            }
            
            .detail-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
              display: flex;
              justify-content: space-between;
            }
            
            .print-button {
              background-color: #2563eb;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              margin: 20px 0;
            }
            
            .print-button:hover {
              background-color: #1d4ed8;
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-button" onclick="window.print()">Print/Save as PDF</button>
            <button class="print-button" onclick="window.close()" style="background-color: #6b7280;">Close</button>
          </div>
          
          <div class="header">
            <div class="company-name">VAMOIL SHIPPING</div>
            <div class="report-title">Trip Reports</div>
            <div class="export-info">
              <span>Generated on: ${formatDateTime(new Date().toISOString())}</span>
              <span>Total Reports: ${reports.length}</span>
            </div>
          </div>

          <!-- Report Generation Information -->
          <div class="creation-info">
            <h4>📋 Report Generation Details</h4>
            <div class="creation-grid">
              <div class="creation-item">
                <span class="creation-label">Generated on:</span>
                <span>${formatDateTime(new Date().toISOString())}</span>
              </div>
              <div class="creation-item">
                <span class="creation-label">Report Count:</span>
                <span>${reports.length} trip report${reports.length !== 1 ? "s" : ""}</span>
              </div>
              <div class="creation-item">
                <span class="creation-label">Date Range:</span>
                <span>${
                  reports.length > 0
                    ? `${formatDate(Math.min(...reports.map((r) => new Date(r.tripDate || r.createdAt))))} - ${formatDate(Math.max(...reports.map((r) => new Date(r.tripDate || r.createdAt))))}`
                    : "N/A"
                }</span>
              </div>
              <div class="creation-item">
                <span class="creation-label">Export Type:</span>
                <span>PDF Report</span>
              </div>
            </div>
          </div>

          ${
            includeStatistics && reports.length > 1 && stats
              ? `
            <div class="section">
              <div class="section-title">Financial Summary</div>
              <div class="stats-grid">
                <div class="stat-card trips">
                  <div class="stat-label">Total Trips</div>
                  <div class="stat-value">${stats.totalTrips}</div>
                  <div class="stat-sub">${stats.profitableTrips} profitable</div>
                </div>
                <div class="stat-card revenue">
                  <div class="stat-label">Total Revenue</div>
                  <div class="stat-value">$${stats.totalRevenue.toFixed(2)}</div>
                </div>
                <div class="stat-card cost">
                  <div class="stat-label">Total Cost</div>
                  <div class="stat-value">$${stats.totalCost.toFixed(2)}</div>
                </div>
                <div class="stat-card profit">
                  <div class="stat-label">Net Profit</div>
                  <div class="stat-value ${stats.totalProfit >= 0 ? "text-green" : "text-red"}">$${stats.totalProfit.toFixed(2)}</div>
                  <div class="stat-sub">${stats.averageProfitMargin.toFixed(2)}% avg margin</div>
                </div>
              </div>
            </div>
          `
              : ""
          }

          <div class="section">
            <div class="section-title">Trip Reports Summary</div>
            <table>
              <thead>
                <tr>
                  <th>Trip Name</th>
                  <th>Vessel</th>
                  <th>Trip Date</th>
                  <th>Created On</th>
                  <th>Created By</th>
                  <th class="text-center">Files</th>
                  <th class="text-right">Revenue</th>
                  <th class="text-right">Cost</th>
                  <th class="text-right">Profit</th>
                  <th class="text-center">Days</th>
                </tr>
              </thead>
              <tbody>
                ${reports
                  .map(
                    (report) => `
                  <tr>
                    <td>${report.tripName || "Unnamed Trip"}</td>
                    <td>${report.vesselName || "Unknown Vessel"}</td>
                    <td>${formatDate(report.tripDate)}</td>
                    <td>${formatDateTime(report.createdAt)}</td>
                    <td>${report.createdBy || report.userName || "Unknown User"}</td>
                    <td class="text-center">${report.fileCount || 0} 📎</td>
                    <td class="text-right text-green">$${(report.summary?.totalRevenue || 0).toFixed(2)}</td>
                    <td class="text-right text-red">$${(report.summary?.totalCost || 0).toFixed(2)}</td>
                    <td class="text-right ${(report.summary?.totalProfit || 0) >= 0 ? "text-green" : "text-red"}">$${(report.summary?.totalProfit || 0).toFixed(2)}</td>
                    <td class="text-center">${report.summary?.totalDays || 0}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          ${
            reports.length <= 3
              ? reports
                  .map(
                    (report, index) => `
            <div class="section ${index > 0 ? "page-break" : ""}">
              <div class="section-title">Detailed Report: ${report.tripName}</div>
              <div class="report-detail">
                <!-- Report Creation Information -->
                <div class="creation-info" style="margin-bottom: 20px;">
                  <h4>📝 Report Creation Details</h4>
                  <div class="creation-grid">
                    <div class="creation-item">
                      <span class="creation-label">Created on:</span>
                      <span>${formatDateTime(report.createdAt)}</span>
                    </div>
                    <div class="creation-item">
                      <span class="creation-label">Created by:</span>
                      <span>${report.createdBy || report.userName || "Unknown User"}</span>
                    </div>
                    <div class="creation-item">
                      <span class="creation-label">Trip Date:</span>
                      <span>${formatDate(report.tripDate)}</span>
                    </div>
                    <div class="creation-item">
                      <span class="creation-label">Report ID:</span>
                      <span>${report.id || "N/A"}</span>
                    </div>
                  </div>
                </div>

                ${
                  report.attachedFiles && report.attachedFiles.length > 0
                    ? `
                  <!-- Attached Files Section -->
                  <div class="attachments-section">
                    <h4>📎 Attached Files (${report.attachedFiles.length})</h4>
                    <div class="file-list">
                      ${report.attachedFiles
                        .map(
                          (file) => `
                        <div class="file-item">
                          <span class="file-icon">${getFileIcon(file.type)}</span>
                          <div class="file-details">
                            <div class="file-name">${file.originalName || file.filename}</div>
                            <div class="file-meta">${formatFileSize(file.size)} • ${formatDateTime(file.uploadedAt)}</div>
                          </div>
                        </div>
                      `,
                        )
                        .join("")}
                    </div>
                  </div>
                `
                    : ""
                }

                <div class="detail-grid">
                  <div class="detail-section">
                    <h4>Trip Information</h4>
                    <div class="detail-item">
                      <span class="detail-label">Vessel Name:</span>
                      ${report.vesselName}
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Trip Date:</span>
                      ${formatDate(report.tripDate)}
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Vessel Capacity:</span>
                      ${report.vesselCapacity || 0} MT
                    </div>
                  </div>
                  <div class="detail-section">
                    <h4>Financial Summary</h4>
                    <div class="detail-item">
                      <span class="detail-label">Total Revenue:</span>
                      <span class="text-green">$${(report.summary?.totalRevenue || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Total Cost:</span>
                      <span class="text-red">$${(report.summary?.totalCost || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Net Profit:</span>
                      <span class="${(report.summary?.totalProfit || 0) >= 0 ? "text-green" : "text-red"}">$${(report.summary?.totalProfit || 0).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Profit Margin:</span>
                      ${(report.summary?.totalProfitMargin || 0).toFixed(2)}%
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Total Days:</span>
                      ${report.summary?.totalDays || 0}
                    </div>
                  </div>
                </div>
                
                ${
                  report.results
                    ? `
                  <div class="detail-section">
                    <h4>Operations Breakdown</h4>
                    <table style="margin-top: 10px;">
                      <thead>
                        <tr>
                          <th>Operation</th>
                          <th class="text-right">Revenue</th>
                          <th class="text-right">Cost</th>
                          <th class="text-right">Profit</th>
                          <th class="text-center">Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Loading</td>
                          <td class="text-right text-green">$${report.results.loading.revenue.toFixed(2)}</td>
                          <td class="text-right text-red">$${report.results.loading.totalCost.toFixed(2)}</td>
                          <td class="text-right ${report.results.loading.profit >= 0 ? "text-green" : "text-red"}">$${report.results.loading.profit.toFixed(2)}</td>
                          <td class="text-center">${report.results.loading.totalDays}</td>
                        </tr>
                        <tr>
                          <td>Discharging</td>
                          <td class="text-right text-green">$${report.results.discharging.revenue.toFixed(2)}</td>
                          <td class="text-right text-red">$${report.results.discharging.totalCost.toFixed(2)}</td>
                          <td class="text-right ${report.results.discharging.profit >= 0 ? "text-green" : "text-red"}">$${report.results.discharging.profit.toFixed(2)}</td>
                          <td class="text-center">${report.results.discharging.totalDays}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          `,
                  )
                  .join("")
              : ""
          }

          <div class="footer">
            <span>VAMOIL SHIPPING - Confidential</span>
            <span>Generated: ${formatDateTime(new Date().toISOString())}</span>
          </div>
        </body>
        </html>
      `

      // Write content to the new window
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Focus the window and trigger print dialog
      printWindow.focus()

      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 500)

      resolve("PDF generation initiated")
    } catch (error) {
      reject(error)
    }
  })
}

// Alternative CSV export function
export const exportToCSV = (reports) => {
  const headers = [
    "Trip Name",
    "Vessel Name",
    "Trip Date",
    "Created On",
    "Created By",
    "Attached Files",
    "Total Revenue",
    "Total Cost",
    "Net Profit",
    "Profit Margin %",
    "Total Days",
    "Vessel Capacity",
  ]

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const csvData = reports.map((report) => [
    report.tripName || "Unnamed Trip",
    report.vesselName || "Unknown Vessel",
    new Date(report.tripDate).toLocaleDateString(),
    formatDateTime(report.createdAt),
    report.createdBy || report.userName || "Unknown User",
    report.fileCount || 0,
    (report.summary?.totalRevenue || 0).toFixed(2),
    (report.summary?.totalCost || 0).toFixed(2),
    (report.summary?.totalProfit || 0).toFixed(2),
    (report.summary?.totalProfitMargin || 0).toFixed(2),
    report.summary?.totalDays || 0,
    report.vesselCapacity || 0,
  ])

  const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `VAMOIL_Trip_Reports_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
