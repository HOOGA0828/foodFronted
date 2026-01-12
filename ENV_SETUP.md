# 環境變數設定指南

## 必要環境變數

請複製 `.env.local.example` 並重新命名為 `.env.local`，然後填入以下變數：

```bash
# Supabase 設定
# 請從 Supabase 專案設定中複製這些值
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 取得 Supabase 設定值

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 前往 Settings > API
4. 複製以下值：
   - **Project URL**: 作為 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: 作為 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 範例

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```