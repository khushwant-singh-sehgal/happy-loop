# Happy Loop 🎮 - Build Better Habits, One Loop at a Time

A gamified habit-building web application where kids earn points for completing real-world tasks. AI helps verify efforts, parents stay in control, and positive routines are reinforced.

**Live Application:** [https://happy-loop.onrender.com/](https://happy-loop.onrender.com/)
*(Note: The free tier may take 30-60s to wake up on first load)*

## How It Works

1.  **Complete Fun Tasks:** Kids engage with daily activities (chores, homework, etc.) in a structured environment.
2.  **Upload Quick Proof:** Submit a short video or photo as evidence of task completion (Feature potentially in future versions, MVP relies on marking done).
3.  **Earn Rewards:** AI assists verification (future goal), parents provide final approval, and kids earn points towards rewards.

## Core Features

-   **Engaging Interface:** A bright, easy-to-use interface designed for kids to see tasks, track points, and view rewards.
-   **Parent Dashboard:** Comprehensive dashboard for parents to add children, define/assign tasks, review pending approvals, define rewards, and monitor progress.
-   **Task Management:** Parents can create custom tasks with names, icons, points, and frequencies (daily, weekly, etc.).
-   **Points & Rewards System:** Children earn points for approved tasks, which can be tracked towards custom rewards set by parents.
-   **AI + Parent Verification:** The system supports parent approval for task completions. (AI verification is a future goal).
-   **Custom Avatars:** Children can have fun avatars associated with their profiles.
-   *(Potential Future Features from Website):* Family Leaderboards, Monthly Physical Rewards.
-   **Safe & Secure:** Built with user privacy in mind using secure backend services (Supabase).

## Tech Stack

-   **Frontend:** Next.js 14 (React Framework), TypeScript, Tailwind CSS
-   **Backend:** Supabase (Database, Authentication, Backend-as-a-Service)
-   **Development:** Developed with AI assistance using Cursor.

## Getting Started (Local Development)

Follow these steps to run the project locally:

*(Setup instructions remain the same as before - using run.sh or npm)*

### Using the Run Script

1. Clone the repository
2. Make the run script executable (if needed):
   ```bash
   chmod +x run.sh
   ```
3. Install dependencies:
   ```bash
   ./run.sh install
   ```
4. Set up your Supabase environment variables (create a `.env.local` file - see `.env.example`).
5. Start the development server:
   ```bash
   ./run.sh dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

Available commands:
- `./run.sh install` - Install dependencies
- `./run.sh dev` - Start development server
- `./run.sh build` - Build for production
- `./run.sh start` - Start production server
- `./run.sh lint` - Run linter
- `./run.sh help` - Show help

### Manual Setup

Alternatively, you can use npm directly:

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up your Supabase environment variables (create a `.env.local` file - see `.env.example`).
4. Run the development server
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app`: Main application code (using Next.js App Router)
  - `/api`: API route handlers
  - `/dashboard`: Parent/Child dashboard components and pages
  - `/components`: Shared UI components
  - `/lib`: Utility functions, Supabase client setup
  - `/context`: React context providers (e.g., Auth)
- `/public`: Static assets (images, fonts)
- `/scripts`: Helper scripts (e.g., seeding)

## Development Notes

This project utilizes Supabase for its backend, providing authentication and database services. Ensure your environment variables are correctly configured for local development.

## License

MIT
