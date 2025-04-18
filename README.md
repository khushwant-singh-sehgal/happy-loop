# Happy Loop - Gamified Behavior-Building App for Kids

Happy Loop is a modern web application that helps children build positive habits through gamification, rewards, and AI verification.

## Features

- **Marketing Site**: Visually appealing website showcasing the app's features and benefits
- **Parent Dashboard**: Comprehensive dashboard for parents to monitor and approve their children's activities
- **Task Management**: Create, assign, and review tasks for children
- **Rewards System**: Redeem points earned from completed tasks for physical and digital rewards
- **AI Verification**: Smart verification of task completion with parent final approval
- **Family Leaderboard**: Friendly competition to motivate consistent progress

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React

## Getting Started

### Using the Run Script

For convenience, we've included a run script that makes it easy to manage the application:

1. Clone the repository
2. Make the run script executable (if needed):
```bash
chmod +x run.sh
```
3. Install dependencies:
```bash
./run.sh install
```
4. Start the development server:
```bash
./run.sh dev
```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

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
3. Run the development server
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Account

For demo purposes, you can log in to the dashboard with any email and password combination.

## Project Structure

- `/src/app`: Main application code
  - `/dashboard`: Parent dashboard components and pages
  - `/components`: Shared UI components
- `/public`: Static assets

## Usage Guide

1. Browse the marketing site to learn about Happy Loop's features
2. Click "Join Now" to access the parent dashboard
3. Use the dashboard to:
   - Monitor children's progress
   - Approve or decline completed tasks
   - Redeem rewards
   - Manage settings and preferences

## Development Notes

This project is a prototype with mock data stored in memory. In a production version, it would be connected to a database and include user authentication.

## License

MIT
