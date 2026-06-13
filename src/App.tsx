import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SplashPage from "@/pages/SplashPage";
import MenuPage from "@/pages/MenuPage";
import ArchivePage from "@/pages/ArchivePage";
import GlitchTransition from "@/components/GlitchTransition";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashPage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/archive" component={ArchivePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="dark min-h-screen text-foreground bg-background font-sans relative">
            <div className="scanline-effect" />
            <Router />
            <GlitchTransition />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
