export function Footer({ lastUpdateTime }: { lastUpdateTime?: string }) {
    return (
        <footer className="w-full bg-[#f5f5f5] py-12 mt-12 flex justify-center">
            <div className="bg-header-bg text-header-fg rounded-full px-12 py-4 shadow-lg inline-flex flex-col items-center">
                <h3 className="font-serif text-2xl font-bold text-primary mb-1">
                    Japan Food Tracker
                </h3>
                <p className="text-xs text-gray-400">
                    日本美食新品追蹤
                </p>

                {lastUpdateTime && (
                    <p className="text-xs text-gray-500 mt-2">
                        最後更新: {lastUpdateTime}
                    </p>
                )}
                <p className="text-[10px] text-gray-600 mt-1">
                    © 2026 Japan Food Tracker.
                </p>
            </div>
        </footer>
    )
}
