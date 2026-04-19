import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import ScriptBuilder from "./pages/ScriptBuilder";
import Profiles from "./pages/Profiles";
import CodeGenerator from "./pages/CodeGenerator";
import Recorder from "./pages/Recorder";
import DockerManager from "./pages/DockerManager";
import SocialTemplates from "./pages/SocialTemplates";
import BDDIntegration from "./pages/BDDIntegration";
import LiveMonitor from "./pages/LiveMonitor";
import MacOSIntegration from "./pages/MacOSIntegration";
import Collaboration from "./pages/Collaboration";
import Marketplace from "./pages/Marketplace";
import Documentation from "./pages/Documentation";
import AIGenerator from "./pages/AIGenerator";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import SecurityTesting from "./pages/SecurityTesting";
import DataConverter from "./pages/DataConverter";
import RemoteJobBoard from "./pages/RemoteJobBoard";
import ArchitectureWhiteboard from "./pages/ArchitectureWhiteboard";
import AIPDFSummarizer from "./pages/AIPDFSummarizer";
import TestCaseGenerator from "./pages/TestCaseGenerator";
import XMLValidator from "./pages/XMLValidator";
import HermesPage from "./pages/Hermes";
import { Onboarding } from "./components/Onboarding";
import { AnimatedBackground } from "./components/AnimatedBackground";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/scripts" component={ScriptBuilder} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/codegen" component={CodeGenerator} />
        <Route path="/recorder" component={Recorder} />
        <Route path="/docker" component={DockerManager} />
        <Route path="/templates" component={SocialTemplates} />
        <Route path="/bdd" component={BDDIntegration} />
        <Route path="/collaboration" component={Collaboration} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/documentation" component={Documentation} />
        <Route path="/ai-generator" component={AIGenerator} />
        <Route path="/monitor" component={LiveMonitor} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/security" component={SecurityTesting} />
        <Route path="/converter" component={DataConverter} />
        <Route path="/macos" component={MacOSIntegration} />
        <Route path="/jobs" component={RemoteJobBoard} />
        <Route path="/whiteboard" component={ArchitectureWhiteboard} />
        <Route path="/ai-pdf" component={AIPDFSummarizer} />
        <Route path="/test-generator" component={TestCaseGenerator} />
        <Route path="/xml-validator" component={XMLValidator} />
        <Route path="/hermes" component={HermesPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
          <AnimatedBackground />
          <Toaster />
          <Onboarding />
          <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
