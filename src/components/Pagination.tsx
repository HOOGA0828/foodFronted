'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    // 產生頁碼陣列
    const getPageNumbers = () => {
        const pages = []
        const showMax = 5 // 最多顯示幾個頁碼按鈕

        let start = Math.max(1, currentPage - 2)
        let end = Math.min(totalPages, start + showMax - 1)

        if (end - start + 1 < showMax) {
            start = Math.max(1, end - showMax + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
    }

    const pages = getPageNumbers()

    return (
        <div className="flex justify-center items-center gap-2 my-6">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* 第一頁與省略號 */}
            {pages[0] > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        className="w-9 h-9 p-0 cursor-pointer"
                    >
                        1
                    </Button>
                    {pages[0] > 2 && <span className="text-gray-400">...</span>}
                </>
            )}

            {/* 頁碼列表 */}
            {pages.map(page => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 p-0 font-medium cursor-pointer ${currentPage === page
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {page}
                </Button>
            ))}

            {/* 最後一頁與省略號 */}
            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-400">...</span>}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        className="w-9 h-9 p-0 cursor-pointer"
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 cursor-pointer"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    )
}
