import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    return (
        <header className="w-full border-b bg-white">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="text-primary">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6"
                            >
                                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                                <circle cx="20" cy="10" r="2" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold">New Life</span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        Home
                    </Link>
                    <Link href="/explore" className="text-sm font-medium text-primary hover:text-primary/80">
                        Explore Campaigns
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        About
                    </Link>
                    <Link href="/faq" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                        FAQ
                    </Link>
                </nav>
                <div>
                    <Button variant="outline" className="rounded-md">
                        Connect Wallet
                    </Button>
                </div>
            </div>
        </header>
    )
}
