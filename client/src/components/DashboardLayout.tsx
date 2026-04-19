import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Workflow,
  Users,
  Code2,
  Circle,
  Container,
  Share2,
  TestTube,
  Monitor,
  Apple,
  Zap,
  UserPlus,
  Store,
  FileText,
  Sparkles,
  BookOpen,
  Shield,
  FileJson,
  Link,
  TrendingUp as TrendingUpIcon,
  Briefcase,
  GitBranch,
  FlaskConical,
  CheckSquare,
  Brain,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { NotificationCenter } from "./NotificationCenter";
import { AIAssistant } from "./AIAssistant";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { EarningsWidget } from "./EarningsWidget";
import { MindMapDialog } from "./MindMapDialog";
import { MessagingDropdown } from "./MessagingDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Network, Calendar as CalendarIcon } from "lucide-react";

const menuItemDefs = [
  { icon: LayoutDashboard, key: "menu.dashboard", path: "/" },
  { icon: Workflow, key: "menu.scriptBuilder", path: "/scripts" },
  { icon: Users, key: "menu.profiles", path: "/profiles" },
  { icon: Code2, key: "menu.codeGenerator", path: "/codegen" },
  { icon: Circle, key: "menu.recorder", path: "/recorder" },
  { icon: Container, key: "menu.dockerManager", path: "/docker" },
  { icon: Share2, key: "menu.socialTemplates", path: "/templates" },
  { icon: TestTube, key: "menu.bddIntegration", path: "/bdd" },
  { icon: Monitor, key: "menu.liveMonitor", path: "/monitor" },
  { icon: Apple, key: "menu.macosIntegration", path: "/macos" },
  { icon: UserPlus, key: "menu.collaboration", path: "/collaboration" },
  { icon: Store, key: "menu.marketplace", path: "/marketplace" },
  { icon: FileText, key: "menu.documentation", path: "/documentation" },
  { icon: BookOpen, key: "menu.blog", path: "/blog" },
  { icon: Sparkles, key: "menu.aiGenerator", path: "/ai-generator" },
  { icon: Shield, key: "menu.securityTesting", path: "/security" },
  { icon: FileJson, key: "menu.dataConverter", path: "/converter" },
  { icon: Link, key: "menu.backlinkChecker", path: "/backlinks" },
  { icon: TrendingUpIcon, key: "menu.domainAuthority", path: "/domain-authority" },
  { icon: Briefcase, key: "menu.remoteJobs", path: "/jobs" },
  { icon: GitBranch, key: "menu.architecture", path: "/whiteboard" },
  { icon: FileText, key: "menu.aiPdfSummarizer", path: "/ai-pdf" },
  { icon: FlaskConical, key: "menu.testCaseGenerator", path: "/test-generator" },
  { icon: CheckSquare, key: "menu.xmlValidator", path: "/xml-validator" },
  { icon: Brain, key: "menu.hermes", path: "/hermes" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 220;
const MAX_WIDTH = 360;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Zap className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight gradient-text">
                QA Automation - AI ToolKit
              </h1>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Ultimátní multiplatformní automatizační engine. Přihlaste se pro přístup k vašemu automatizačnímu kokpitu.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg"
          >
            Přihlásit se
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const menuItems = menuItemDefs.map(item => ({ ...item, label: t(item.key) }));
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const [mindMapOpen, setMindMapOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [todoOpen, setTodoOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft =
        sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH)
        setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight truncate text-foreground tracking-widest" style={{fontFamily: "'Orbitron', 'Share Tech Mono', monospace"}}>OMNIMATRIX</span>
                  <span className="text-xs text-muted-foreground truncate font-mono tracking-wider">// QA AUTOMATION CORE</span>
                  </div>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 overflow-y-auto">
            <SidebarMenu className="px-2 py-1 flex flex-col gap-0.5">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className="h-10 transition-all font-normal"
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <AIAssistant />

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Odhlásit se</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {/* Main top header bar - clean single row */}
        <div className="flex border-b h-12 items-center bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40 gap-2">
          {/* Mobile: sidebar trigger + page label */}
          {isMobile && (
            <>
              <SidebarTrigger className="h-8 w-8 rounded-lg bg-background shrink-0" />
              <span className="text-sm font-medium text-foreground truncate shrink-0 mr-2">
                {activeMenuItem?.label ?? "Menu"}
              </span>
            </>
          )}
          {/* Time (always visible, compact) */}
          <span className="text-sm font-mono font-semibold tabular-nums shrink-0">
            {format(currentTime, "HH:mm")}
          </span>
          <span className="text-xs text-muted-foreground hidden xl:block shrink-0">
            {format(currentTime, "EEE d. MMM")}
          </span>
          {/* Divider */}
          <div className="w-px h-5 bg-border shrink-0" />
          {/* Quick actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setMindMapOpen(true)} className="h-8 px-2 gap-1 text-xs">
              <Network className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Mind Map</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCalendarOpen(true)} className="h-8 px-2 gap-1 text-xs">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Calendar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTodoOpen(true)} className="h-8 px-2 gap-1 text-xs">
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="hidden md:inline">To-Do</span>
            </Button>
          </div>
          {/* Spacer */}
          <div className="flex-1" />
          {/* Right: widgets row */}
          <div className="flex items-center gap-0.5 shrink-0">
            <MessagingDropdown />
            <EarningsWidget totalEarningsCZK={12500} />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationCenter />
          </div>
        </div>
        <main className="flex-1 p-6">{children}</main>
        <MindMapDialog open={mindMapOpen} onOpenChange={setMindMapOpen} />
      </SidebarInset>
    </>
  );
}
