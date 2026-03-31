# VeloTrack (VelocityFlow)

VeloTrack is a comprehensive Project Velocity & Productivity Management application designed to track sprint velocity, team productivity, and project delivery efficiently.

## 🚀 Features

- **Authentication:** Secure login and registration.
- **Dashboard:** At-a-glance view of current sprint velocity and team performance.
- **Sprint Management:** Create, edit, and track individual sprints and their progress.
- **Project Tracking:** Manage multiple projects seamlessly.
- **Resource Allocation:** Monitor and allocate team resources effectively.
- **Comprehensive Reporting:** Generate detailed reports for sprints, resources, and overall projects using interactive charts.
- **Organization Settings:** Manage team members and organizational configurations securely.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (built on Radix UI) & Ant Design
- **State Management:** Zustand
- **Data Fetching & Caching:** TanStack Query (React Query)
- **Routing:** React Router DOM (v6)
- **Forms & Validation:** React Hook Form, Zod
- **Backend/Database:** Local Mock Data
- **Data Visualization (Charts):** Recharts
- **Testing:** Playwright (E2E) & Vitest (Unit)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd velocity-flow
   ```

2. **Install dependencies:**
   Ensure you have Node.js installed. Then, run:
   ```bash
   npm install
   ```
   *(Note: The project also includes a `bun.lock` file, meaning you could also use [bun](https://bun.sh/) via `bun install`)*

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` by default.

## 📂 Project Structure Overview

- `src/components/` - Reusable UI components including layouts, core shadcn components, and custom widgets.
- `src/pages/` - Core application pages mapped to specific routes (`auth`, `dashboard`, `sprints`, `projects`, `resources`, `reports`, `settings`).
- `src/lib/` or `dist/utils` - Useful helper utilities.
- `src/App.tsx` - The main application entry point defining all internal app routes and major context providers.
- `public/` - Static files and assets.

## 🧪 Testing

- **Unit Tests:** Execute tests with `npm run test` or dynamically with `npm run test:watch` using Vitest.
- **E2E Tests:** Setup with Playwright.

## 📜 Available Scripts

- `npm run dev`: Start the Vite development server.
- `npm run build`: Transpile and build the project for production.
- `npm run lint`: Run ESLint code quality checks.
- `npm run preview`: Serve the built production application locally.
