import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/Toaster";
import { TooltipProvider } from "@/components/ui/tooltip"; 
import { useAuth } from "@/hooks/UseAuth";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/Not_Found";

function LoginRedirect() {
  const [, navigate] = useLocation();
  // If authenticated user hits /login, push them to dashboard
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Dashboard is the initial page */}
      <Route path="/" component={DashboardPage} />
      <Route path="/dashboard" component={DashboardPage} />

      {/* Login page on /login; redirect to dashboard if already authenticated */}
      {/* {!isAuthenticated ? (
        <Route path="/login" component={LoginPage} />
      ) : (
        <Route path="/login" component={LoginRedirect} />
      )} */}
      <Route component={NotFound} /> 
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
