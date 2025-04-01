import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ServicePage from "@/pages/service-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/admin/dashboard";
import Orders from "@/pages/admin/orders";
import Pricing from "@/pages/admin/pricing";
import Settings from "@/pages/admin/settings";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/services/:type" component={ServicePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes - Protected */}
      <ProtectedRoute path="/admin" component={Dashboard} />
      <ProtectedRoute path="/admin/orders" component={Orders} />
      <ProtectedRoute path="/admin/pricing" component={Pricing} />
      <ProtectedRoute path="/admin/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
