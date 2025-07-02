// Import images
import oilTerminal from "../assets/images/oil-terminal.png"
import vlccTanker from "../assets/images/vlcc-tanker.png"
import lpgCarrier from "../assets/images/lpg-carrier.png"
import ceoPortrait from "../assets/images/ceo-portrait.png"
import cooPortrait from "../assets/images/coo-portrait.png"
import cfoPortrait from "../assets/images/cfo-portrait.png"

const About = () => {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto max-w-6xl w-full">
        <h1 className="text-2xl font-bold mb-6">About Vamoil International</h1>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
            <div className="md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">Our Company</h2>
              <p className="text-gray-600 mb-4">
                Vamoil International is a leading global shipping and logistics company specializing in the
                transportation of oil, gas, and other petroleum products. With over 20 years of experience in the
                industry, we have established ourselves as a reliable partner for energy companies worldwide.
              </p>
              <p className="text-gray-600">
                Our fleet of modern vessels ensures safe, efficient, and environmentally responsible transportation of
                valuable cargo across international waters.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src={oilTerminal || "/placeholder.svg"}
                alt="Vamoil Oil Terminal Facility"
                className="rounded-md w-full h-auto shadow-lg object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=300&width=500&text=Modern+Oil+Terminal+Facility"
                  e.target.onerror = null
                }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              At Vamoil International, our mission is to provide exceptional maritime transportation services while
              maintaining the highest standards of safety, reliability, and environmental stewardship. We are committed
              to delivering value to our clients, employees, and stakeholders through operational excellence and
              continuous innovation.
            </p>
          </div>

          {/* Fleet Images */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <img
                  src={vlccTanker || "/placeholder.svg"}
                  alt="VLCC Oil Tanker"
                  className="rounded-md w-full h-auto shadow-md object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=250&width=400&text=VLCC+Oil+Tanker+at+Sea"
                    e.target.onerror = null
                  }}
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                  VLCC Oil Tanker
                </div>
              </div>
              <div className="relative">
                <img
                  src={lpgCarrier || "/placeholder.svg"}
                  alt="LPG Carrier"
                  className="rounded-md w-full h-auto shadow-md object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=250&width=400&text=LPG+Carrier+Ship"
                    e.target.onerror = null
                  }}
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                  LPG Carrier
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Safety First</h3>
              <p className="text-gray-600 text-sm">
                We prioritize the safety of our crew, vessels, and cargo above all else, implementing rigorous safety
                protocols and regular training.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Environmental Responsibility</h3>
              <p className="text-gray-600 text-sm">
                We are committed to minimizing our environmental footprint through sustainable practices and compliance
                with international regulations.
              </p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Operational Excellence</h3>
              <p className="text-gray-600 text-sm">
                We strive for excellence in all aspects of our operations, from vessel management to customer service
                and logistics coordination.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Our Leadership Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <img
                src={ceoPortrait || "/placeholder.svg"}
                alt="John Smith - CEO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=150&width=150&text=CEO+Portrait"
                  e.target.onerror = null
                }}
              />
              <h3 className="font-semibold">John Smith</h3>
              <p className="text-gray-600 text-sm">Chief Executive Officer</p>
            </div>
            <div className="text-center">
              <img
                src={cooPortrait || "/placeholder.svg"}
                alt="Sarah Johnson - COO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=150&width=150&text=COO+Portrait"
                  e.target.onerror = null
                }}
              />
              <h3 className="font-semibold">Sarah Johnson</h3>
              <p className="text-gray-600 text-sm">Chief Operations Officer</p>
            </div>
            <div className="text-center">
              <img
                src={cfoPortrait || "/placeholder.svg"}
                alt="Michael Chen - CFO"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=150&width=150&text=CFO+Portrait"
                  e.target.onerror = null
                }}
              />
              <h3 className="font-semibold">Michael Chen</h3>
              <p className="text-gray-600 text-sm">Chief Financial Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
