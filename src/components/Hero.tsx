'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowDown } from 'lucide-react'

export function Hero() {
    const scrollToContent = () => {
        const content = document.getElementById('product-grid')
        if (content) {
            content.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-white">
            {/* Background Decor - Vibrant Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] mix-blend-multiply animate-blob" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[80px] mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-pink-300/30 rounded-full blur-[60px] mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-bold tracking-wide mb-6">
                        <Sparkles className="w-4 h-4 mr-2" />
                        日本同步・每日更新
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter sm:leading-[1.1] mb-6 font-serif"
                >
                    探索<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">日本最前線</span><br />
                    美味零時差
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    全台最快！即時追蹤日本超商、連鎖餐廳的最新發售資訊。
                    <br className="hidden sm:inline" />
                    從季節限定甜點到人氣聯名商品，第一手情報掌握手中。
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                >
                    <button
                        onClick={scrollToContent}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-foreground rounded-full hover:bg-primary hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-sans"
                    >
                        開始探索
                        <ArrowDown className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
