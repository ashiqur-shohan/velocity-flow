import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageShell from "@/components/layout/PageShell";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import SprintList from "@/pages/sprints/SprintList";
import SprintForm from "@/pages/sprints/SprintForm";
import SprintDetail from "@/pages/sprints/SprintDetail";
import Projects from "@/pages/projects/Projects";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import Resources from "@/pages/resources/Resources";
import ReportsHub from "@/pages/reports/ReportsHub";
import SprintReport from "@/pages/reports/SprintReport";
import ResourceReport from "@/pages/reports/ResourceReport";
import ProjectReport from "@/pages/reports/ProjectReport";
import OrgSettings from "@/pages/settings/OrgSettings";
import Members from "@/pages/settings/Members";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PageShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sprints" element={<SprintList />} />
            <Route path="/sprints/new" element={<SprintForm />} />
            <Route path="/sprints/:id" element={<SprintDetail />} />
            <Route path="/sprints/:id/edit" element={<SprintForm />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/reports" element={<ReportsHub />} />
            <Route path="/reports/sprint" element={<SprintReport />} />
            <Route path="/reports/resource" element={<ResourceReport />} />
            <Route path="/reports/project" element={<ProjectReport />} />
            <Route path="/settings" element={<OrgSettings />} />
            <Route path="/settings/members" element={<Members />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
