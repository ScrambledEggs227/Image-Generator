# 🍳 AI Dish Visualizer

A modern web application that turns dish names into professional, appetizing food photography using **Imagen 4 Fast** and **Gemini 2.5**.

## 🚀 How it Works
1. **The Scanner (Coming Soon):** Uses Gemini 1.5 Flash to read menu photos and suggest dishes.
2. **The Artist:** Uses Imagen 4 Fast to generate 8k-resolution commercial-grade food photography based on dish descriptions.

## 🛠️ Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase Edge Functions (Deno)
- **AI Models:** - `imagen-4.0-fast-generate-001` (Image Generation)
  - `gemini-2.5-flash-lite` (Translation/Analysis)

## 📦 Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
   cd your-repo-name
   
2. **Setup Secrets:**
   - Copy `supabase/functions/.env.example` to `supabase/functions/.env`
   - Copy `.env.example` to `.env`
   - Add your **Google AI Studio API Key** and **Supabase Keys** to these new files.

3. **Install Dependencies:**
   ```bash
   npm install