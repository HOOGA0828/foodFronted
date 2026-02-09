import Link from 'next/link'

export function Header() {
    return (
        <header className="w-full bg-header-bg text-header-fg py-8 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Link href="/" className="inline-block group">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-primary mb-2 group-hover:opacity-90 transition-opacity">
                        Japan Food Tracker
                    </h1>
                    <p className="text-sm md:text-base text-gray-300 font-light tracking-widest uppercase">
                        日本美食新品追蹤
                    </p>
                </Link>
            </div>
        </header>
    )
}
