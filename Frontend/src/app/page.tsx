"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : process.env.NEXT_PUBLIC_BACKEND_URL;

// ── Types ──────────────────────────────────────────────────────────────────
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

const GENDER_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981"];

// ── Shared label style ─────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
      {children}
    </p>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="max-w-350 mx-auto px-5 py-8 space-y-3">
      <div className="space-y-1 mb-6">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="grid grid-cols-12 gap-3">
        <Skeleton className="col-span-12 lg:col-span-7 h-125 rounded-2xl" />
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
          <Skeleton className="flex-1 min-h-52 rounded-2xl" />
          <Skeleton className="flex-1 min-h-52 rounded-2xl" />
        </div>
        <Skeleton className="col-span-12 lg:col-span-5 h-64 rounded-2xl" />
        <Skeleton className="col-span-12 lg:col-span-7 h-64 rounded-2xl" />
        <Skeleton className="col-span-12 h-72 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
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
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 max-w-sm w-full text-center space-y-2">
          <p className="font-semibold text-destructive">Connection Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-350 mx-auto px-5 py-8">

        {/* Page title */}
        <div className="mb-7">
          <SectionLabel>Marketing Intelligence</SectionLabel>
          <h1 className="text-2xl font-bold tracking-tight">Ad Performance Overview</h1>
          {overview && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{overview.total_customers.toLocaleString()}</span> customers &middot;{" "}
              <span className="font-semibold text-foreground">{overview.total_conversions.toLocaleString()}</span> conversions &middot;{" "}
              <span className="font-semibold text-foreground">${overview.avg_ad_spend.toLocaleString()}</span> avg spend
            </p>
          )}
        </div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-12 gap-3">

          {/* ── Hero: Conversion by Channel ── */}
          <div className="col-span-12 lg:col-span-7 h-64 lg:h-125 rounded-2xl border border-border bg-card p-5 flex flex-col border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between shrink-0">
              <div>
                <SectionLabel>Channel Performance</SectionLabel>
                <p className="font-semibold text-sm">Conversion Rate by Channel</p>
              </div>
              {overview && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-500 tabular-nums leading-none">
                    {overview.conversion_rate}%
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">overall avg</p>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 mt-3">
              <ChartContainer
                config={{ conversion_rate: { label: "Conversion Rate (%)", color: "#3b82f6" } }}
                className="h-full w-full aspect-auto"
              >
                <BarChart data={byChannel} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="CampaignChannel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(val) => `${val}%`} />
                  <Bar dataKey="conversion_rate" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={72} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* ── Right column: Campaign Type + Gender ── */}
          <div className="col-span-12 lg:col-span-5 lg:h-125 flex flex-col gap-3">

            {/* Campaign Type — horizontal bars */}
            <div className="flex-1 min-h-52 rounded-2xl border border-border bg-card p-5 flex flex-col border-t-4 border-t-emerald-500">
              <SectionLabel>Campaign Objective</SectionLabel>
              <p className="font-semibold text-sm mb-2">Conversion by Type</p>
              <div className="flex-1 min-h-0">
                <ChartContainer
                  config={{ conversion_rate: { label: "Conversion Rate (%)", color: "#10b981" } }}
                  className="h-full w-full aspect-auto"
                >
                  <BarChart
                    data={byCampaignType}
                    layout="vertical"
                    margin={{ top: 0, right: 24, bottom: 0, left: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                    <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="CampaignType" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                    <ChartTooltip content={<ChartTooltipContent />} formatter={(val) => `${val}%`} />
                    <Bar dataKey="conversion_rate" fill="#10b981" radius={[0, 5, 5, 0]} maxBarSize={22} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>

            {/* Gender breakdown */}
            <div className="flex-1 min-h-52 rounded-2xl border border-border bg-card p-5 flex flex-col border-t-4 border-t-violet-500">
              <SectionLabel>Audience</SectionLabel>
              <p className="font-semibold text-sm mb-2">Conversions by Gender</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byGender}
                      dataKey="conversions"
                      nameKey="Gender"
                      cx="50%"
                      cy="48%"
                      outerRadius="65%"
                      innerRadius="35%"
                    >
                      {byGender.map((_, i) => (
                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} conversions`, name]}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Age Groups ── */}
          <div className="col-span-12 lg:col-span-5 h-64 rounded-2xl border border-border bg-card p-5 flex flex-col border-l-4 border-l-orange-500">
            <SectionLabel>Demographics</SectionLabel>
            <p className="font-semibold text-sm mb-2">Conversion by Age Group</p>
            <div className="flex-1 min-h-0">
              <ChartContainer
                config={{ conversion_rate: { label: "Conversion Rate (%)", color: "#f97316" } }}
                className="h-full w-full aspect-auto"
              >
                <BarChart data={byAge} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="age_group" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} formatter={(val) => `${val}%`} />
                  <Bar dataKey="conversion_rate" fill="#f97316" radius={[5, 5, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* ── Engagement Metrics ── */}
          <div className="col-span-12 lg:col-span-7 h-64 rounded-2xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-start justify-between shrink-0 mb-2">
              <div>
                <SectionLabel>Engagement</SectionLabel>
                <p className="font-semibold text-sm">Metrics by Channel</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-indigo-500 shrink-0" />
                  CTR %
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-teal-500 shrink-0" />
                  Pages / Visit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-amber-500 shrink-0" />
                  Social Shares
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ChartContainer
                config={{
                  avg_ctr: { label: "CTR (%)", color: "#6366f1" },
                  avg_pages: { label: "Pages / Visit", color: "#14b8a6" },
                  avg_social_shares: { label: "Social Shares", color: "#f59e0b" },
                }}
                className="h-full w-full aspect-auto"
              >
                <BarChart data={engagement} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="CampaignChannel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg_ctr" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="avg_pages" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="avg_social_shares" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* ── Top Combinations Table ── */}
          <div className="col-span-12 rounded-2xl border border-border bg-card p-5">
            <div className="mb-4">
              <SectionLabel>Recommendations</SectionLabel>
              <p className="font-semibold text-sm">Top Performing Ad Combinations</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Best channel + campaign type pairings — highest conversion rates from 8k records
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60">
                  <TableHead className="text-[10px] uppercase tracking-wider w-10">#</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Channel</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Conversion</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">CTR</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Avg Spend</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right">n</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCombos.map((combo, i) => (
                  <TableRow key={i} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                    <TableCell className="text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {combo.CampaignChannel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{combo.CampaignType}</TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          combo.conversion_rate >= 15 ? "text-emerald-600" : "text-foreground"
                        }`}
                      >
                        {combo.conversion_rate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">
                      {combo.avg_ctr}%
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">
                      ${combo.avg_ad_spend.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground text-right">
                      {combo.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 mt-6 uppercase tracking-widest">
          Kaggle · Digital Marketing Campaign Dataset · 8,000 records
        </p>
      </div>
    </div>
  );
}
