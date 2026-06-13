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
          style={{background: '#050b14', borderRight: '1px solid rgba(77,184,255,0.15)', boxShadow: '2px 0 20px rgba(77,184,255,0.06)'}}
        >
          <SidebarHeader className="h-16 justify-center" style={{borderBottom: '1px solid rgba(255,153,0,0.25)', background: 'rgba(5,11,20,0.98)'}}>
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center rounded transition-colors focus:outline-none shrink-0"
                style={{color: '#4db8ff'}}
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="h-5 w-5 shrink-0" style={{color: '#ff9900', filter: 'drop-shadow(0 0 6px rgba(255,153,0,0.8))'}} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm truncate tracking-widest" style={{fontFamily: "'Orbitron', monospace", color: '#ff9900', textShadow: '0 0 10px rgba(255,153,0,0.7), 0 0 24px rgba(255,153,0,0.3)'}}>OMNIMATRIX</span>
                    <span className="text-xs truncate font-mono tracking-wider" style={{color: '#4db8ff', textShadow: '0 0 6px rgba(77,184,255,0.5)'}}>// QA AUTOMATION CORE</span>
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
                      className="h-9 transition-all"
                      style={isActive ? {
                        background: 'rgba(255,153,0,0.12)',
                        borderLeft: '3px solid #ff9900',
                        borderRadius: '0 6px 6px 0',
                        color: '#ff9900',
                        textShadow: '0 0 8px rgba(255,153,0,0.5)',
                        boxShadow: 'inset 0 0 12px rgba(255,153,0,0.06)'
                      } : {
                        borderLeft: '3px solid transparent',
                        borderRadius: '0 6px 6px 0',
                        color: '#99ccff'
                      }}
                    >
                      <item.icon
                        className="h-4 w-4"
                        style={isActive ? {color: '#ff9900', filter: 'drop-shadow(0 0 4px rgba(255,153,0,0.7))'} : {color: '#4db8ff'}}
                      />
                      <span style={{fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, letterSpacing: '0.04em'}}>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <AIAssistant />

          <SidebarFooter className="p-3" style={{borderTop: '1px solid rgba(77,184,255,0.15)'}}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded px-1 py-1 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none" style={{background: 'rgba(77,184,255,0.05)'}}>
                  <Avatar className="h-9 w-9 shrink-0" style={{border: '1px solid rgba(255,153,0,0.4)', boxShadow: '0 0 8px rgba(255,153,0,0.25)'}}>
                    <AvatarFallback className="text-xs font-bold" style={{background: 'rgba(255,153,0,0.15)', color: '#ff9900', fontFamily: "'Orbitron', monospace"}}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold truncate leading-none" style={{color: '#ff9900', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em'}}>
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs truncate mt-1" style={{color: '#4db8ff'}}>
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
        {/* LCARS Main top header bar */}
        <div className="flex h-12 items-center px-3 sticky top-0 z-40 gap-2"
          style={{
            background: 'rgba(5,11,20,0.97)',
            borderBottom: '1px solid rgba(255,153,0,0.25)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(77,184,255,0.08)'
          }}
        >
          {/* Mobile: sidebar trigger + page label */}
          {isMobile && (
            <>
              <SidebarTrigger className="h-8 w-8 rounded shrink-0" style={{color: '#4db8ff'}} />
              <span className="text-sm font-semibold truncate shrink-0 mr-2" style={{color: '#ff9900', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em'}}>
                {activeMenuItem?.label ?? "Menu"}
              </span>
            </>
          )}
          {/* LCARS time display */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-mono font-bold tabular-nums" style={{color: '#ffcc00', textShadow: '0 0 8px rgba(255,204,0,0.6)'}}>
              {format(currentTime, "HH:mm:ss")}
            </span>
            <span className="text-xs font-mono hidden xl:block" style={{color: '#4db8ff'}}>
              {format(currentTime, "EEE dd.MM")}
            </span>
          </div>
          {/* LCARS divider */}
          <div className="w-px h-5 shrink-0" style={{background: 'rgba(255,153,0,0.3)'}} />
          {/* Quick actions — LCARS styled */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setMindMapOpen(true)} className="h-8 px-2 gap-1 text-xs font-semibold" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em'}}>
              <Network className="h-3.5 w-3.5" />
              <span className="hidden md:inline">MIND MAP</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCalendarOpen(true)} className="h-8 px-2 gap-1 text-xs font-semibold" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em'}}>
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">CALENDAR</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setTodoOpen(true)} className="h-8 px-2 gap-1 text-xs font-semibold" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.05em'}}>
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="hidden md:inline">TO-DO</span>
            </Button>
          </div>
          {/* Spacer */}
          <div className="flex-1" />
          {/* LCARS status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 h-6 rounded shrink-0" style={{background: 'rgba(77,184,255,0.08)', border: '1px solid rgba(77,184,255,0.2)'}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{background: '#4db8ff', boxShadow: '0 0 6px rgba(77,184,255,0.8)'}} />
            <span className="text-xs font-mono font-bold" style={{color: '#4db8ff', letterSpacing: '0.1em'}}>LCARS ONLINE</span>
          </div>
          {/* Right: widgets row */}
          <div className="flex items-center gap-0.5 shrink-0">
            <MessagingDropdown />
            <EarningsWidget totalEarningsCZK={12500} />
            <LanguageSwitcher />
            <ThemeSwitcher />
            <NotificationCenter />
          </div>
        </div>
        <main className="flex-1 p-6" style={{background: 'rgba(4,8,16,0.6)'}}>{children}</main>
        <MindMapDialog open={mindMapOpen} onOpenChange={setMindMapOpen} />
      </SidebarInset>
    </>
  );
}
