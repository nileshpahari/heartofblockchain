import { Filter, Search, SlidersHorizontal } from "lucide-react"
import Navbar from "@/components/navbar"
import CampaignCard from "@/components/campaign-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const campaigns = [
    {
        id: "1",
        name: "Monthly Medications",
        age: 56,
        location: "Idris",
        description:
            "Idris has been diagnosed with a chronic condition requiring ongoing monthly medication and treatment. He needs financial support to maintain his health and quality of life.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 1924,
        goal: 3000,
        percentFunded: 64,
        tags: ["Chronic", "Medicine"],
        urgency: "Urgent",
    },
    {
        id: "2",
        name: "Hassan",
        age: 42,
        location: "Turkey",
        description:
            "Hassan is a father of three who urgently needs lifesaving heart surgery. His family needs financial support and relies heavily on local care.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 10305,
        goal: 20000,
        percentFunded: 52,
        tags: ["Heart Surgery", "Low Funded"],
        urgency: "SOS",
    },
    {
        id: "3",
        name: "Mirela",
        age: 36,
        location: "Ghana",
        description:
            "Mirela needs urgent surgery to remove a tumor. The surgery is funded but post-op care and therapy is unfunded. Your support is critical for her recovery.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 10700,
        goal: 15000,
        percentFunded: 71,
        tags: ["Surgery", "Therapy"],
        urgency: "Urgent",
    },
    {
        id: "4",
        name: "Amal",
        age: 6,
        location: "Romania",
        description:
            "Amal needs medication for a rare form of leukemia. Her condition is worsening and she must receive treatment within 3 weeks. Only available abroad.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 16000,
        goal: 20000,
        percentFunded: 75,
        tags: ["Cancer", "Child"],
        urgency: "Urgent",
    },
    {
        id: "5",
        name: "Urgent Spinal Surgery",
        age: 29,
        location: "Turkey",
        description:
            "Following a young teacher with a life-threatening condition affecting the spine. Has had a partial fracture and requires immediate surgery to heal and prevent permanent paralysis.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 11700,
        goal: 18000,
        percentFunded: 65,
        tags: ["Urgent", "Low Funded"],
        urgency: "SOS",
    },
    {
        id: "6",
        name: "Equip Local Medics",
        age: 0,
        location: "Hatay, Turkey",
        description:
            "Following devastating 9.1 magnitude earthquake, local hospitals are overwhelmed. Your donation will help equip medical response teams in the affected area.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 42500,
        goal: 50000,
        percentFunded: 81,
        tags: ["Relief", "Medical"],
        urgency: "SOS",
    },
    {
        id: "7",
        name: "Emilia",
        age: 28,
        location: "Ukraine",
        description:
            "Emilia was diagnosed with Stage 3 ovarian cancer and needs urgent treatment. She requires chemotherapy and targeted radiation available in Germany.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 9500,
        goal: 15000,
        percentFunded: 63,
        tags: ["Cancer", "Treatment"],
        urgency: "Urgent",
    },
    {
        id: "8",
        name: "Yusuf",
        age: 55,
        location: "Kenya",
        description:
            "Yusuf suffered a sudden cardiac event and now requires immediate bypass surgery. Currently, the surgery is scheduled at a regional facility.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 5800,
        goal: 15000,
        percentFunded: 39,
        tags: ["Heart", "Low Funded"],
        urgency: "SOS",
    },
    {
        id: "9",
        name: "Adama",
        age: 36,
        location: "Nigeria",
        description:
            "Born with a congenital heart defect, Adama has lived with symptoms her whole life. She now needs a life-saving heart surgery at a hospital in India.",
        image: "/placeholder.svg?height=200&width=400",
        raised: 3300,
        goal: 8000,
        percentFunded: 40,
        tags: ["Heart Surgery", "Critical"],
        urgency: "Urgent",
    },
]

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-blue-50 border-b border-blue-100">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="bg-yellow-200 h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold">
                                R
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Explore Life-Saving Campaigns</h1>
                            <p className="text-gray-600">Real causes. Verified needs. Powered by blockchain transparency.</p>
                            <div className="text-xs text-gray-500 mt-1">Built on Trust. Powered by Blockchain.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input placeholder="Search cases" className="pl-9 pr-4 py-2 w-full" />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="sr-only">Sort</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Filter</span>
                    </Button>
                </div>

                <h2 className="text-xl font-bold mb-6">Urgent Cases You Can Help</h2>

                {/* Campaign Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} {...campaign} />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">New Life</h3>
                            <div className="flex space-x-4 mt-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                            <p className="text-sm text-gray-400 mt-4">© NewLife 2023</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        About us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        How it Works
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Team Members
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Terms of Use
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Privacy Policy
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Stay Updated</h4>
                            <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter</p>
                            <div className="flex">
                                <Input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="rounded-r-none bg-gray-800 border-gray-700 text-white"
                                />
                                <Button className="rounded-l-none">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
