"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : process.env.NEXT_PUBLIC_BACKEND_URL;

type Overview = {
  total_customers: number;
  total_conversions: number;
  conversion_rate: number;
  avg_ctr: number;
  avg_ad_spend: number;
  avg_time_on_site: number;
  avg_pages_per_visit: number;
};
type ChannelData = {
  CampaignChannel: string;
  conversion_rate: number;
  avg_ctr: number;
  avg_ad_spend: number;
  total: number;
  conversions: number;
};
type CampaignTypeData = {
  CampaignType: string;
  conversion_rate: number;
  avg_ctr: number;
  avg_ad_spend: number;
  total: number;
  conversions: number;
};
type AgeData = {
  age_group: string;
  conversion_rate: number;
  avg_ad_spend: number;
  total: number;
  conversions: number;
};
type GenderData = {
  Gender: string;
  conversion_rate: number;
  total: number;
  conversions: number;
};
type EngagementData = {
  CampaignChannel: string;
  avg_ctr: number;
  avg_pages: number;
  avg_time: number;
  avg_visits: number;
  avg_social_shares: number;
};
type CombinationData = {
  CampaignChannel: string;
  CampaignType: string;
  conversion_rate: number;
  avg_ad_spend: number;
  avg_ctr: number;
  total: number;
};
type StatCfg = { from: string; color: string };

const GENDER_COLORS = ["#4f8ef7", "#f472b6", "#a78bfa", "#34d399"];

const TIP: React.CSSProperties = {
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  backgroundColor: "#fff",
  boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  fontSize: 12,
  padding: "8px 12px",
};

const GRID = { strokeDasharray: "4 4", stroke: "#e5e7eb" };
const AXIS = { fontSize: 11, fill: "#9ca3af" };

// ── Plain card (used for table + error state) ──────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

// ── Glowing chart card ─────────────────────────────────────────────────────
function GlowCard({
  children,
  className = "",
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-2xl relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl ${className}`}
      style={{
        background: "#ffffff",
        border: `1px solid ${color}28`,
        boxShadow: `0 0 0 1px ${color}10, 0 4px 28px ${color}12, 0 1px 4px rgba(0,0,0,0.06)`,
      }}
    >
      {/* Shimmer top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}99 35%, ${color} 50%, ${color}99 65%, transparent 100%)`,
        }}
      />
      {/* Blob — top right */}
      <div
        className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: color, opacity: 0.08 }}
      />
      {/* Blob — bottom left */}
      <div
        className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: color, opacity: 0.05 }}
      />
      {children}
    </div>
  );
}

// ── Card header with z-index so it sits above blobs ────────────────────────
function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pt-5 pb-3 border-b border-gray-200/70 relative z-10">
      {children}
    </div>
  );
}

function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 relative z-10 ${className}`}>{children}</div>;
}

function CardTitle({ label, title, color }: { label: string; title: string; color?: string }) {
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-1.5 mb-0.5">
        {color && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      </div>
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
    </div>
  );
}

// ── Stat card — gradient bg, glow shadow, blobs, pulse dot ────────────────
function StatCard({
  label,
  value,
  accent = "text-gray-900",
  sub,
  cfg,
}: {
  label: string;
  value: string;
  accent?: string;
  sub?: string;
  cfg: StatCfg;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden cursor-default transition-all duration-200"
      style={{
        border: `1px solid ${cfg.color}22`,
        background: "#ffffff",
        boxShadow: `0 0 0 1px ${cfg.color}12, 0 4px 22px ${cfg.color}14, 0 1px 3px rgba(0,0,0,0.05)`,
      }}
    >
      {/* Shimmer top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}cc, transparent)` }}
      />
      {/* Main blob */}
      {/* <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: cfg.color, opacity: 0.2 }}
      /> */}
      {/* Secondary blob */}
      <div
        className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: cfg.color, opacity: 0.08 }}
      />
      <p className="text-xs text-gray-500 font-medium mb-1 relative z-10">{label}</p>
      <p className={`text-2xl font-bold tabular-nums relative z-10 ${accent}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1.5 relative z-10">{sub}</p>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-4">
        <div className="space-y-1 mb-4">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-12 gap-3">
          <Skeleton className="col-span-12 lg:col-span-7 h-96 rounded-2xl" />
          <Skeleton className="col-span-12 lg:col-span-5 h-96 rounded-2xl" />
          <Skeleton className="col-span-12 lg:col-span-5 h-72 rounded-2xl" />
          <Skeleton className="col-span-12 lg:col-span-7 h-72 rounded-2xl" />
          <Skeleton className="col-span-12 h-72 rounded-2xl" />
          <Skeleton className="col-span-12 h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [byChannel, setByChannel] = useState<ChannelData[]>([]);
  const [byCampaignType, setByCampaignType] = useState<CampaignTypeData[]>([]);
  const [byAge, setByAge] = useState<AgeData[]>([]);
  const [byGender, setByGender] = useState<GenderData[]>([]);
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [topCombos, setTopCombos] = useState<CombinationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, ch, ct, ag, gn, en, tc] = await Promise.all([
          fetch(`${BACKEND_URL}/api/overview`).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/by-channel`).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/by-campaign-type`).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/by-age`).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/by-gender`).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/engagement`).then((r) => r.json()),
          fetch(`${BACKEND_URL}/api/top-combinations`).then((r) => r.json()),
        ]);
        setOverview(ov);
        setByChannel(ch);
        setByCampaignType(ct);
        setByAge(ag);
        setByGender(gn);
        setEngagement(en);
        setTopCombos(tc);
      } catch {
        setError("Backend not reachable — make sure it's running on port 3001.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <Card className="p-8 max-w-sm w-full text-center space-y-2">
          <p className="font-semibold text-red-500">Connection Error</p>
          <p className="text-sm text-gray-400">{error}</p>
        </Card>
      </div>
    );
  }

  const statCfgs: StatCfg[] = [
    { from: "#f8fafc", color: "#64748b" },
    { from: "#eff6ff", color: "#3b82f6" },
    { from: "#f0fdf4", color: "#22c55e" },
    { from: "#eef2ff", color: "#6366f1" },
    { from: "#fffbeb", color: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Marketing Intelligence
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Ad Performance Overview</h1>
          <p className="text-sm text-gray-400 mt-1">
            Kaggle Digital Marketing Campaign Dataset · 8,000 records
          </p>
        </div>

        {/* Stat Cards */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <StatCard label="Total Customers" value={overview.total_customers.toLocaleString()} sub="in the dataset" cfg={statCfgs[0]} />
            <StatCard label="Total Conversions" value={overview.total_conversions.toLocaleString()} accent="text-blue-500" sub={`of ${overview.total_customers.toLocaleString()} customers`} cfg={statCfgs[1]} />
            <StatCard label="Conversion Rate" value={`${overview.conversion_rate}%`} accent="text-emerald-500" sub="across all channels" cfg={statCfgs[2]} />
            <StatCard label="Avg Click-Through Rate" value={`${overview.avg_ctr}%`} accent="text-indigo-500" sub="per campaign" cfg={statCfgs[3]} />
            <StatCard label="Avg Ad Spend" value={`$${overview.avg_ad_spend.toLocaleString()}`} sub="per customer" cfg={statCfgs[4]} />
          </div>
        )}

        {/* Chart Grid */}
        <div className="grid grid-cols-12 gap-3">

          {/* Row 1 */}

          <GlowCard color="#3b82f6" className="col-span-12 lg:col-span-7 h-96">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle label="Channel Performance" title="Conversion Rate by Channel" color="#3b82f6" />
                {overview && (
                  <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-3 py-1 rounded-full shrink-0">
                    {overview.conversion_rate}% overall avg
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byChannel} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="channelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} {...GRID} />
                  <XAxis dataKey="CampaignChannel" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [`${val}%`, "Conversion Rate"]} contentStyle={TIP} cursor={{ fill: "#f0f4ff" }} />
                  <Bar dataKey="conversion_rate" fill="url(#channelGrad)" radius={[6, 6, 0, 0]} maxBarSize={72} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </GlowCard>

          <GlowCard color="#7c3aed" className="col-span-12 lg:col-span-5 h-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle label="Audience" title="Conversions by Gender" color="#7c3aed" />
                {byGender.length > 0 && (
                  <span className="text-xs text-gray-400">{byGender.length} segments</span>
                )}
              </div>
            </CardHeader>
            <CardBody className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <Pie
                    data={byGender}
                    dataKey="conversions"
                    nameKey="Gender"
                    cx="50%"
                    cy="46%"
                    outerRadius="60%"
                    innerRadius="32%"
                    filter="url(#pieShadow)"
                  >
                    {byGender.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} conversions`, name]} contentStyle={TIP} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </GlowCard>

          {/* Row 2 */}

          <GlowCard color="#10b981" className="col-span-12 lg:col-span-5 h-72">
            <CardHeader>
              <CardTitle label="Campaign Objective" title="Conversion by Type" color="#10b981" />
            </CardHeader>
            <CardBody className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCampaignType} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="typeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={false} {...GRID} />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="CampaignType" tick={AXIS} axisLine={false} tickLine={false} width={88} />
                  <Tooltip formatter={(val) => [`${val}%`, "Conversion Rate"]} contentStyle={TIP} cursor={{ fill: "#f0fdf4" }} />
                  <Bar dataKey="conversion_rate" fill="url(#typeGrad)" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </GlowCard>

          <GlowCard color="#f97316" className="col-span-12 lg:col-span-7 h-72">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle label="Demographics" title="Conversion Rate by Age Group" color="#f97316" />
                {byAge.length > 0 && (
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full shrink-0">
                    {byAge.length} age groups
                  </span>
                )}
              </div>
            </CardHeader>
            <CardBody className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={byAge} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="ageGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} {...GRID} />
                  <XAxis dataKey="age_group" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [`${val}%`, "Conversion Rate"]} contentStyle={TIP} cursor={{ stroke: "#fed7aa", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="conversion_rate" stroke="#f97316" strokeWidth={2.5} fill="url(#ageGrad)" dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0, fill: "#ea580c" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </GlowCard>

          {/* Row 3 — Engagement full width */}

          <GlowCard color="#6366f1" className="col-span-12 h-72">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle label="Engagement" title="Metrics by Channel" color="#6366f1" />
                <div className="flex items-center gap-4 text-[10px] text-gray-400 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-indigo-400 shrink-0" />CTR %
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-teal-400 shrink-0" />Pages / Visit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-amber-400 shrink-0" />Social Shares
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagement} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="ctrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="pagesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={1} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="sharesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} {...GRID} />
                  <XAxis dataKey="CampaignChannel" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TIP} cursor={{ fill: "#f0f0ff" }} />
                  <Bar dataKey="avg_ctr" fill="url(#ctrGrad)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="avg_pages" fill="url(#pagesGrad)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="avg_social_shares" fill="url(#sharesGrad)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </GlowCard>

          {/* Table — unchanged plain card */}
          <Card className="col-span-12">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle label="Recommendations" title="Top Performing Ad Combinations" color="#22c55e" />
                <span className="text-xs text-gray-400 shrink-0">ranked by conversion rate</span>
              </div>
            </CardHeader>
            <CardBody>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400 w-10">#</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400">Channel</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400">Type</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400">Conversion</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400">CTR</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400">Avg Spend</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-gray-400 text-right">Records</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCombos.map((combo, i) => (
                    <TableRow key={i} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                      <TableCell className="text-xs text-gray-300 font-mono">{i + 1}</TableCell>
                      <TableCell>
                        <span className="text-xs font-medium bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full">
                          {combo.CampaignChannel}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{combo.CampaignType}</TableCell>
                      <TableCell>
                        <span className={`text-sm font-semibold tabular-nums ${combo.conversion_rate >= 15 ? "text-emerald-500" : "text-gray-700"}`}>
                          {combo.conversion_rate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-gray-400">{combo.avg_ctr}%</TableCell>
                      <TableCell className="text-sm tabular-nums text-gray-400">${combo.avg_ad_spend.toLocaleString()}</TableCell>
                      <TableCell className="text-xs tabular-nums text-gray-300 text-right">{combo.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

        </div>

        <p className="text-center text-[10px] text-gray-300 mt-8 uppercase tracking-widest">
          Kaggle · Digital Marketing Campaign Dataset · 8,000 records
        </p>
      </div>
    </div>
  );
}
