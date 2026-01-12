'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('loading')

      // 檢查環境變數
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!url || !key || url === 'your_supabase_project_url') {
        setStatus('error')
        setError('環境變數未設定或使用預設值')
        return
      }

      console.log('🔍 測試連線到:', url)

      // 測試連線 - 直接檢查 products 表格
      console.log('🔍 檢查 products 表格是否存在...')

      if (!supabase) {
        setStatus('error')
        setError('Supabase 客戶端未初始化')
        return
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1)

      let hasProductsTable = false
      let tables = []

      if (productsError) {
        if (productsError.code === 'PGRST116') {
          // 表格不存在
          console.log('ℹ️  products 表格不存在')
          hasProductsTable = false
          tables = []
        } else {
          console.log('❌ 連線或權限錯誤:', productsError)
          setStatus('error')
          setError(`連線測試失敗: ${productsError.message}`)
          return
        }
      } else {
        console.log('✅ 連線成功，products 表格存在')
        hasProductsTable = true
        // 設定表格列表
        tables = ['products']
      }

      if (hasProductsTable) {
        console.log('🔍 檢查 products 表格資料...')

        if (!supabase) {
          setStatus('error')
          setError('Supabase 客戶端未初始化')
          return
        }

        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(5)

        if (productsError) {
          setStatus('error')
          setError(`無法取得產品資料: ${productsError.message}`)
        } else {
          setStatus('success')
          setData({
            tables: ['products'],
            products: products || [],
            hasProductsTable: true
          })
        }
      } else {
        setStatus('success')
        setData({
          tables: [],
          products: [],
          hasProductsTable: false
        })
      }

    } catch (err) {
      console.log('❌ 連線測試失敗:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : '未知錯誤')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Supabase 連線測試
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">連線狀態</h2>

            {status === 'loading' && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                測試連線中...
              </div>
            )}

            {status === 'success' && (
              <div className="text-green-600">
                ✅ 連線成功！
              </div>
            )}

            {status === 'error' && (
              <div className="text-red-600">
                ❌ 連線失敗: {error}
              </div>
            )}
          </div>

          {data && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">資料庫表格</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2">找到 {data.tables.length} 個表格:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.tables.map((table: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          table === 'products'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Products 表格狀態
                </h3>
                <div className="bg-gray-50 p-4 rounded">
                  {data.hasProductsTable ? (
                    <div>
                      <p className="text-green-600 mb-2">✅ 找到 products 表格</p>
                      <p className="text-sm text-gray-600 mb-2">
                        找到 {data.products.length} 筆資料
                      </p>

                      {data.products.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">資料範例:</p>
                          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                            {JSON.stringify(data.products[0], null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600">❌ 沒有找到 products 表格</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-semibold text-blue-900 mb-2">下一步建議</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {data.hasProductsTable ? (
                    <>
                      <li>• ✅ 連線成功！products 表格存在</li>
                      <li>• 檢查資料結構是否符合我們的 TypeScript 介面</li>
                      <li>• 如需要調整，請修改 types/product.ts</li>
                      <li>• 返回首頁測試完整功能</li>
                    </>
                  ) : (
                    <>
                      <li>• ⚠️ products 表格不存在</li>
                      <li>• 在 Supabase 中建立 products 表格</li>
                      <li>• 定義適當的欄位結構</li>
                      <li>• 插入測試資料</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </a>
        </div>
      </div>
    </div>
  )
}