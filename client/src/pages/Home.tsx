import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Workflow,
  Users,
  Play,
  CheckCircle,
  Cpu,
  HardDrive,
  Activity,
  TrendingUp,
  Clock,
  FileDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMemo, useState, useEffect } from "react";
import { FuturisticBanner } from "@/components/FuturisticBanner";
import { useLanguage } from "@/contexts/LanguageContext";

// Simulated performance data for resource visualization
const performanceData = [
  { time: "00:00", cpu: 12, gpu: 8, neural: 5, memory: 34 },
  { time: "04:00", cpu: 18, gpu: 15, neural: 22, memory: 38 },
  { time: "08:00", cpu: 45, gpu: 35, neural: 48, memory: 52 },
  { time: "12:00", cpu: 62, gpu: 55, neural: 72, memory: 61 },
  { time: "16:00", cpu: 78, gpu: 68, neural: 85, memory: 72 },
  { time: "20:00", cpu: 35, gpu: 28, neural: 32, memory: 45 },
  { time: "Now", cpu: 42, gpu: 38, neural: 41, memory: 48 },
];

const executionHistory = [
  { day: "Mon", completed: 24, failed: 2 },
  { day: "Tue", completed: 31, failed: 1 },
  { day: "Wed", completed: 28, failed: 3 },
  { day: "Thu", completed: 42, failed: 0 },
  { day: "Fri", completed: 38, failed: 2 },
  { day: "Sat", completed: 15, failed: 1 },
  { day: "Sun", completed: 8, failed: 0 },
];

const platformDistribution = [
  { name: "Twitter/X", value: 35, color: "#6366f1" },
  { name: "Instagram", value: 25, color: "#8b5cf6" },
  { name: "Facebook", value: 15, color: "#a78bfa" },
  { name: "TikTok", value: 15, color: "#c4b5fd" },
  { name: "YouTube", value: 10, color: "#ddd6fe" },
];

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10,24,40,0.95) 0%, rgba(7,14,26,0.98) 100%)',
      border: '1px solid rgba(77,184,255,0.18)',
      borderTop: '2px solid #ff9900',
      borderRadius: '4px',
      boxShadow: '0 0 20px rgba(77,184,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
      padding: '16px'
    }}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif"}}>{title}</p>
          <p className="text-2xl font-bold" style={{color: '#ffcc00', fontFamily: "'Orbitron', monospace", textShadow: '0 0 12px rgba(255,204,0,0.5)'}}>{value}</p>
          {trendLabel && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" style={{color: trend === 'up' ? '#4db8ff' : '#99ccff'}} />
              <span className="text-xs" style={{color: '#4db8ff'}}>{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="h-10 w-10 flex items-center justify-center" style={{background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', borderRadius: '4px', boxShadow: '0 0 10px rgba(255,153,0,0.15)'}}>
          <Icon className="h-5 w-5" style={{color: '#ff9900', filter: 'drop-shadow(0 0 4px rgba(255,153,0,0.6))'}} />
        </div>
      </div>
    </div>
  );
}

function ResourceGauge({
  label,
  value,
  color,
  sublabel,
}: {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}) {
  const size = 100;
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  // Wave fill height (bottom of circle = 100%, top = 0%)
  const waveY = size - (value / 100) * size;
  const waveId = `wave-clip-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer glow pulse */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
            animation: 'gauge-glow 3s ease-in-out infinite',
          }}
        />
        {/* SVG radial gauge */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
          {/* Defs for wave clip */}
          <defs>
            <clipPath id={waveId}>
              <rect x="0" y={waveY} width={size} height={size} />
            </clipPath>
          </defs>
          {/* Background track */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          {/* Wave fill circle (clipped from bottom) */}
          <circle
            cx={size/2} cy={size/2} r={radius - strokeWidth/2 - 1}
            fill={`${color}22`}
            clipPath={`url(#${waveId})`}
            style={{ transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Progress arc */}
          <circle
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
              filter: `drop-shadow(0 0 5px ${color}99)`,
            }}
          />
          {/* Tick marks at 25%, 50%, 75% */}
          {[0.25, 0.5, 0.75].map((pct) => {
            const angle = pct * 2 * Math.PI;
            const x1 = size/2 + (radius - strokeWidth) * Math.cos(angle);
            const y1 = size/2 + (radius - strokeWidth) * Math.sin(angle);
            const x2 = size/2 + (radius + 2) * Math.cos(angle);
            const y2 = size/2 + (radius + 2) * Math.sin(angle);
            return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${color}55`} strokeWidth="1.5" />;
          })}
        </svg>
        {/* Center value text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{ color, fontFamily: 'var(--font-mono, monospace)', fontSize: '1.1rem' }}
          >
            {value}%
          </span>
          {sublabel && (
            <span className="text-[9px] mt-0.5" style={{ color: `${color}99`, fontFamily: 'monospace' }}>{sublabel}</span>
          )}
        </div>
        {/* Wave pulse rings */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1.5px solid ${color}55`,
            animation: 'wave-ring-1 3s ease-out infinite',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px solid ${color}33`,
            animation: 'wave-ring-2 3s ease-out infinite 1s',
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight font-medium">{label}</span>
      <style>{`
        @keyframes wave-ring-1 {
          0% { transform: scale(0.9); opacity: 0.8; }
          60% { transform: scale(1.12); opacity: 0.15; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes wave-ring-2 {
          0% { transform: scale(0.95); opacity: 0.5; }
          60% { transform: scale(1.18); opacity: 0.1; }
          100% { transform: scale(1.28); opacity: 0; }
        }
        @keyframes gauge-glow {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function detectCpuLabel(): string {
  const ua = navigator.userAgent;
  // Detect Apple Silicon
  if (/Mac/.test(ua) && /AppleWebKit/.test(ua)) {
    // Try to detect M-series via platform hints
    const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? "";
    if (/macOS/.test(platform) || /Mac/.test(ua)) {
      // Check for Apple Silicon via hardwareConcurrency heuristic
      const cores = navigator.hardwareConcurrency || 0;
      if (cores >= 10) return `Apple Silicon (${cores}-core)`;
      return `Apple Mac (${cores}-core)`;
    }
  }
  // Detect Windows
  if (/Win/.test(ua)) {
    const cores = navigator.hardwareConcurrency || 0;
    // Try to extract CPU from user agent on Windows
    const intelMatch = ua.match(/Intel[^;)]+/i);
    if (intelMatch) return intelMatch[0].trim();
    const amdMatch = ua.match(/AMD[^;)]+/i);
    if (amdMatch) return amdMatch[0].trim();
    return `Windows CPU (${cores}-core)`;
  }
  // Detect Linux
  if (/Linux/.test(ua)) {
    const cores = navigator.hardwareConcurrency || 0;
    return `Linux CPU (${cores}-core)`;
  }
  // Fallback
  const cores = navigator.hardwareConcurrency || 0;
  return cores > 0 ? `CPU (${cores}-core)` : "System CPU";
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [cpuLabel, setCpuLabel] = useState("System CPU");

  useEffect(() => {
    setCpuLabel(detectCpuLabel());
  }, []);
  const { data: stats } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: recentExecutions } = trpc.executions.list.useQuery(
    { limit: 10 },
    { enabled: !!user }
  );

  const currentMetrics = useMemo(
    () => performanceData[performanceData.length - 1],
    []
  );

  // Live server metrics (CPU, memory) from Node.js os module
  const { data: liveMetrics } = trpc.metrics.system.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const exportPDF = trpc.reports.exportPDF.useMutation();

  const handleExportPDF = async (executionId: number) => {
    try {
      toast.info('Generating PDF report...');
      const result = await exportPDF.mutateAsync({ executionId });
      
      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF report');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* LCARS Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{fontFamily: "'Orbitron', monospace", color: '#ff9900', textShadow: '0 0 14px rgba(255,153,0,0.6), 0 0 32px rgba(255,153,0,0.2)'}}>
            {t('dashboard.welcome')}, {user?.name || "User"}
          </h1>
          <p className="mt-1 text-sm" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.06em'}}>
            {t('dashboard.overview')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5" style={{background: 'rgba(77,184,255,0.08)', border: '1px solid rgba(77,184,255,0.25)', borderRadius: '4px'}}>
          <Activity className="h-3.5 w-3.5" style={{color: '#4db8ff', filter: 'drop-shadow(0 0 4px rgba(77,184,255,0.8))'}} />
          <span className="text-xs font-bold tracking-widest" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif"}}>{t('status.systemOnline')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t('dashboard.totalScripts')}
          value={stats?.totalScripts ?? 0}
          icon={Workflow}
          trend="up"
          trendLabel={`+3 ${t('dashboard.thisWeek')}`}
        />
        <StatCard
          title={t('dashboard.activeProfiles')}
          value={stats?.totalProfiles ?? 0}
          icon={Users}
          trend="up"
          trendLabel={`+2 ${t('dashboard.new')}`}
        />
        <StatCard
          title={t('dashboard.totalExecutions')}
          value={stats?.totalExecutions ?? 0}
          icon={Play}
          trend="up"
          trendLabel={`186 ${t('dashboard.thisWeek')}`}
        />
        <StatCard
          title={t('dashboard.runningNow')}
          value={stats?.runningInstances ?? 0}
          icon={Zap}
        />
        <StatCard
          title={t('dashboard.successRate')}
          value={`${stats?.successRate ?? 0}%`}
          icon={CheckCircle}
          trend="up"
          trendLabel={t('dashboard.stable')}
        />
      </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dynamic Resource Monitor */}
          <div className="lg:col-span-2" style={{background: 'linear-gradient(135deg, rgba(10,24,40,0.95) 0%, rgba(7,14,26,0.98) 100%)', border: '1px solid rgba(77,184,255,0.18)', borderLeft: '3px solid #ff9900', borderRadius: '4px', boxShadow: '0 0 20px rgba(77,184,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'}}>
            <div className="px-5 pt-4 pb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4" style={{color: '#ff9900', filter: 'drop-shadow(0 0 4px rgba(255,153,0,0.7))'}} />
              <span className="text-sm font-bold tracking-wider" style={{color: '#ff9900', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em'}}>{cpuLabel} {t('dashboard.resourceMonitor')}</span>
            </div>
          <div className="px-5 pb-4">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    name="CPU"
                  />
                  <Area
                    type="monotone"
                    dataKey="gpu"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                    name="GPU"
                  />
                  <Area
                    type="monotone"
                    dataKey="neural"
                    stroke="#a78bfa"
                    fill="#a78bfa"
                    fillOpacity={0.08}
                    name="Neural Engine"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around items-center mt-4 gap-2">
              <ResourceGauge
                label={t('dashboard.cpuCores')}
                value={liveMetrics?.cpu?.loadPercent ?? currentMetrics?.cpu ?? 0}
                color="#6366f1"
                sublabel={liveMetrics?.cpu?.cores ? `${liveMetrics.cpu.cores}c` : undefined}
              />
              <ResourceGauge
                label={t('dashboard.gpu')}
                value={currentMetrics?.gpu ?? 0}
                color="#8b5cf6"
              />
              <ResourceGauge
                label={t('dashboard.neuralEngine')}
                value={currentMetrics?.neural ?? 0}
                color="#a78bfa"
              />
              <ResourceGauge
                label={t('dashboard.memory')}
                value={liveMetrics?.memory?.usedPercent ?? currentMetrics?.memory ?? 0}
                color="#c4b5fd"
                sublabel={liveMetrics?.memory ? `${Math.round((liveMetrics.memory.usedMB ?? 0) / 1024)}GB` : undefined}
              />
            </div>
          </div>
          </div>

          {/* Platform Distribution */}
          <div style={{background: 'linear-gradient(135deg, rgba(7,18,36,0.95) 0%, rgba(5,12,24,0.98) 100%)', border: '1px solid rgba(77,184,255,0.18)', borderTop: '3px solid #4db8ff', borderRadius: '4px', boxShadow: '0 0 20px rgba(77,184,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'}}>
            <div className="px-5 pt-4 pb-2 flex items-center gap-2">
              <HardDrive className="h-4 w-4" style={{color: '#4db8ff', filter: 'drop-shadow(0 0 4px rgba(77,184,255,0.7))'}} />
              <span className="text-sm font-bold tracking-wider" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em'}}>{t('dashboard.platformDistribution')}</span>
            </div>
          <div className="px-5 pb-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {platformDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {platformDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Execution History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{background: 'linear-gradient(135deg, rgba(10,24,40,0.95) 0%, rgba(7,14,26,0.98) 100%)', border: '1px solid rgba(77,184,255,0.18)', borderLeft: '3px solid #4db8ff', borderRadius: '4px', boxShadow: '0 0 20px rgba(77,184,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'}}>
          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{color: '#4db8ff', filter: 'drop-shadow(0 0 4px rgba(77,184,255,0.7))'}} />
            <span className="text-sm font-bold tracking-wider" style={{color: '#4db8ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em'}}>{t('dashboard.weeklyHistory')}</span>
          </div>
          <div className="px-5 pb-4">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={executionHistory}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name={t('dashboard.completed')}
                  />
                  <Bar
                    dataKey="failed"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name={t('dashboard.failed')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{background: 'linear-gradient(135deg, rgba(10,24,40,0.95) 0%, rgba(7,14,26,0.98) 100%)', border: '1px solid rgba(77,184,255,0.18)', borderLeft: '3px solid #ffcc00', borderRadius: '4px', boxShadow: '0 0 20px rgba(77,184,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'}}>
          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" style={{color: '#ffcc00', filter: 'drop-shadow(0 0 4px rgba(255,204,0,0.7))'}} />
            <span className="text-sm font-bold tracking-wider" style={{color: '#ffcc00', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em'}}>{t('dashboard.recentExecutions')}</span>
          </div>
          <div className="px-5 pb-4">
            <div className="space-y-3">
              {recentExecutions && recentExecutions.length > 0 ? (
                recentExecutions.slice(0, 6).map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          exec.status === "completed"
                            ? "bg-green-500"
                            : exec.status === "running"
                              ? "bg-blue-500"
                              : exec.status === "failed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-sm text-foreground">
                        Script #{exec.scriptId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs capitalize ${
                          exec.status === "completed"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                            : exec.status === "running"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                              : exec.status === "failed"
                                ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {exec.status}
                      </Badge>
                      {(exec.status === 'completed' || exec.status === 'failed') && (
                        <button
                          onClick={() => handleExportPDF(exec.id)}
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Export PDF Report"
                        >
                          <FileDown className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Zatím žádná spuštění</p>
                  <p className="text-xs mt-1">
                    Vytvořte skript a spusťte ho pro zobrazení aktivity
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Banner */}
      <FuturisticBanner />
    </div>
  );
}
