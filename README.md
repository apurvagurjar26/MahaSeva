# MahaSeva - Social Intervention Management System (SIMS) 🚀

MahaSeva is an intelligent platform designed to bridge the gap between community-reported issues and organized social action. Using Gemini AI, the system analyzes raw data from citizens, categorizes interventions by urgency and field, and intelligently matches them with the most suitable volunteers and NGOs.

## 🌟 Key Features

- **Intelligence Feed**: Real-time analysis of reported problems using Gemini AI to detect field, severity, and urgency.
- **Vibrant NGO Dashboard**: Centralized command center for NGOs to manage field deployments.
- **Smart Matching Engine**: Ranks and recommends volunteers based on skill-match, location proximity, and years of experience.
- **Volunteer Portal**: personalized mission control for registered volunteers to track their active assignments and impact.
- **Impact Metrics**: Automatic tracking of community impact once missions are completed.

## 💻 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Motion
- **Database / Auth**: Firebase (Firestore & Authentication)
- **Intelligence**: Google Gemini AI (via @google/genai)
- **Deployment**: Optimized for Vercel / Cloud Run

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18+)
- Firebase Project
- Google AI Studio (Gemini) API Key

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd mahaseva
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```

## 🔒 Security Note

This project uses environment variables for all sensitive credentials. Never commit your `.env` file to version control. The `.gitignore` is pre-configured to prevent this.

## 🚀 Vercel Deployment

This project is pre-configured for one-click deployment on Vercel. 
- Ensure you add all environment variables listed in `.env.example` to your Vercel Project Settings.
- The `vercel.json` provides standard SPA routing support.

---
Built with ❤️ for social impact.
