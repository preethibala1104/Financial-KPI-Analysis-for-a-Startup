import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Zap, 
  Layers, 
  CheckCircle2, 
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { PROCESSED_FINANCIAL_DATA } from '../data/financialData';
import { ChannelCacData } from '../types';

export const CacReportView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'analysis' | 'channels' | 'ledger' | 'simulator' | 'playbook' | 'python'>('analysis');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Simulator state
  const [simSpend, setSimSpend] = useState<number>(30000);
  const [simNewCustomers, setSimNewCustomers] = useState<number>(150);
  const [simArpu, setSimArpu] = useState<number>(155);
  const [simGrossMargin, setSimGrossMargin] = useState<number>(80);
  const [simChurnRate, setSimChurnRate] = useState<number>(2.9);

  // Calculated CAC metrics from 18-month financial data
  const cacLedgerData = PROCESSED_FINANCIAL_DATA.map((row) => {
    const grossMargin = 0.80;
    const monthlyGrossProfit = row.arpu * grossMargin;
    const paybackMonths = Number((row.cac / monthlyGrossProfit).toFixed(2));
    const smPercentOfRevenue = Number(((row.marketingSalesSpend / row.totalRevenue) * 100).toFixed(1));
    const magicNumber = row.month > 1 
      ? Number(((row.runRate - PROCESSED_FINANCIAL_DATA[row.month - 2].runRate) / row.marketingSalesSpend).toFixed(2))
      : 1.05;

    return {
      month: row.month,
      monthLabel: row.monthLabel,
      shortMonth: `M${row.month}`,
      newCustomers: row.newCustomers,
      totalCustomers: row.totalActiveCustomers,
      spend: row.marketingSalesSpend,
      revenue: row.totalRevenue,
      cac: row.cac,
      arpu: row.arpu,
      monthlyGrossProfit: Number(monthlyGrossProfit.toFixed(2)),
      paybackMonths,
      smPercentOfRevenue,
      magicNumber,
      ltv: row.ltv,
      ltvCac: row.ltvCacRatio,
      churnRate: Number((row.churnRate * 100).toFixed(1)),
    };
  });

  // Acquisition Channel Attribution Data (Month 18 snapshot: $27,600 spend, 138 customers, $200 Blended CAC)
  const channelData: ChannelCacData[] = [
    {
      channel: 'Product-Led Organic & SEO',
      category: 'Organic',
      spendMonthly: 3510,
      customersAcquired: 45,
      cac: 78.00,
      arpu: 146.00,
      paybackMonths: 0.67,
      conversionRate: 8.8,
      ltvCac: 10.42,
      notes: 'Developer documentation, self-serve interactive sandbox, freemium viral loops',
    },
    {
      channel: 'Customer Referrals & Marketplace',
      category: 'Referral',
      spendMonthly: 2600,
      customersAcquired: 23,
      cac: 113.04,
      arpu: 155.00,
      paybackMonths: 0.91,
      conversionRate: 16.2,
      ltvCac: 7.73,
      notes: 'Customer advocacy incentive credits and app integration directory partnerships',
    },
    {
      channel: 'Paid Search & B2B Social Ads',
      category: 'Paid',
      spendMonthly: 11970,
      customersAcquired: 42,
      cac: 285.00,
      arpu: 152.00,
      paybackMonths: 2.34,
      conversionRate: 2.6,
      ltvCac: 2.98,
      notes: 'Google high-intent search ads, LinkedIn sponsored content, Meta retargeting',
    },
    {
      channel: 'Outbound & Inside SDR Sales',
      category: 'Outbound',
      spendMonthly: 9520,
      customersAcquired: 28,
      cac: 340.00,
      arpu: 185.00,
      paybackMonths: 2.30,
      conversionRate: 6.4,
      ltvCac: 3.65,
      notes: 'Targeted mid-market account prospecting with multi-seat contract expansion',
    },
  ];

  // Simulator computed values
  const simCac = Number((simSpend / (simNewCustomers || 1)).toFixed(2));
  const simMonthlyGrossProfit = simArpu * (simGrossMargin / 100);
  const simPaybackMonths = Number((simCac / (simMonthlyGrossProfit || 1)).toFixed(2));
  const simLtv = Number(((simMonthlyGrossProfit) / ((simChurnRate / 100) || 0.03)).toFixed(2));
  const simLtvCac = Number((simLtv / (simCac || 1)).toFixed(2));

  // CSV download function
  const handleDownloadCsv = () => {
    const headers = [
      'Month',
      'New_Customers',
      'Total_Active_Customers',
      'Marketing_Sales_Spend',
      'Total_Revenue',
      'Blended_CAC',
      'ARPU',
      'Monthly_Gross_Profit_Per_Customer',
      'CAC_Payback_Months',
      'SM_Percent_Revenue',
      'Magic_Number',
      'LTV',
      'LTV_CAC_Ratio',
    ].join(',');

    const rows = cacLedgerData.map((r) =>
      [
        r.monthLabel,
        r.newCustomers,
        r.totalCustomers,
        r.spend,
        r.revenue,
        r.cac,
        r.arpu,
        r.monthlyGrossProfit,
        r.paybackMonths,
        r.smPercentOfRevenue,
        r.magicNumber,
        r.ltv,
        r.ltvCac,
      ].join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'saas_cac_and_payback_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const pythonCacScript = `# SaaS CAC & Payback Analysis Script
# Python 3.10+ (Pandas, Matplotlib, Seaborn)

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Configure visual styling
sns.set_theme(style="whitegrid", palette="deep")
plt.rcParams['figure.dpi'] = 300
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'

# 1. Load Financial Dataset
data = {
    'month': list(range(1, 19)),
    'new_customers': [18, 22, 26, 31, 37, 43, 50, 58, 66, 74, 82, 90, 98, 106, 114, 122, 130, 138],
    'active_customers': [18, 39, 63, 91, 124, 162, 206, 257, 314, 377, 446, 521, 602, 689, 781, 878, 980, 1086],
    'mrr': [2160, 4758, 7812, 11466, 15872, 21060, 27192, 34438, 42704, 52026, 62440, 73982, 86688, 100594, 115588, 131700, 148960, 167244],
    'sm_spend': [7200, 8360, 9620, 11160, 12950, 14620, 16250, 17980, 19470, 20720, 22140, 23400, 24500, 25440, 26220, 26840, 27300, 27600],
    'churned': [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 13, 15, 17, 19, 22, 25, 28, 32]
}

df = pd.DataFrame(data)
GROSS_MARGIN = 0.80

# 2. Vectorized Metric Calculations
df['cac'] = df['sm_spend'] / df['new_customers']
df['arpu'] = df['mrr'] / df['active_customers']
df['monthly_gp'] = df['arpu'] * GROSS_MARGIN
df['cac_payback_months'] = df['cac'] / df['monthly_gp']

# Churn rate & LTV
df['prev_active'] = df['active_customers'].shift(1).fillna(df['active_customers'].iloc[0])
df['churn_rate'] = df['churned'] / df['prev_active']
df['churn_rate'] = df['churn_rate'].replace(0, 0.04)
df['ltv'] = (df['arpu'] * GROSS_MARGIN) / df['churn_rate']
df['ltv_cac_ratio'] = df['ltv'] / df['cac']

# Sales Efficiency (Magic Number)
df['arr'] = df['mrr'] * 12
df['net_new_arr'] = df['arr'].diff().fillna(df['arr'].iloc[0])
df['magic_number'] = df['net_new_arr'] / df['sm_spend']

# 3. Print Executive Summary
print("=" * 60)
print("     SAAS CUSTOMER ACQUISITION COST (CAC) REPORT")
print("=" * 60)
print(f"Initial CAC (Month 1):       \${df['cac'].iloc[0]:.2f}")
print(f"Ending CAC (Month 18):        \${df['cac'].iloc[-1]:.2f} (Compression: {((df['cac'].iloc[-1] - df['cac'].iloc[0])/df['cac'].iloc[0])*100:.1f}%)")
print(f"Initial Payback:             {df['cac_payback_months'].iloc[0]:.2f} Months")
print(f"Ending Payback:              {df['cac_payback_months'].iloc[-1]:.2f} Months (Compression: {((df['cac_payback_months'].iloc[-1] - df['cac_payback_months'].iloc[0])/df['cac_payback_months'].iloc[0])*100:.1f}%)")
print(f"Ending LTV:CAC Multiple:     {df['ltv_cac_ratio'].iloc[-1]:.2f}x (Benchmark: >= 3.0x)")
print(f"Ending Magic Number:         {df['magic_number'].iloc[-1]:.2f}x (SaaS benchmark: >= 0.75x)")
print("=" * 60)

# 4. Visualization: 2-Panel Plot
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Panel 1: CAC Compression vs ARPU Expansion
ax1.plot(df['month'], df['cac'], color='#0284c7', marker='o', linewidth=2.5, label='Blended CAC (\$)')
ax1.plot(df['month'], df['arpu'], color='#10b981', marker='s', linewidth=2, linestyle='--', label='ARPU (\$/mo)')
ax1.set_title('CAC Compression vs. ARPU Expansion', fontsize=12, fontweight='bold', pad=12)
ax1.set_xlabel('Month Elapsed')
ax1.set_ylabel('USD (\$)')
ax1.legend(loc='upper right')
ax1.grid(True, linestyle=':', alpha=0.6)

# Panel 2: CAC Payback Period
ax2.plot(df['month'], df['cac_payback_months'], color='#8b5cf6', marker='^', linewidth=2.5, label='CAC Payback (Months)')
ax2.axhline(y=12.0, color='#ef4444', linestyle='--', linewidth=1.5, label='B2B SaaS Ceiling (12 Mo)')
ax2.set_title('CAC Payback Period Trajectory', fontsize=12, fontweight='bold', pad=12)
ax2.set_xlabel('Month Elapsed')
ax2.set_ylabel('Months to Cash Recovery')
ax2.set_ylim(0, 6)
ax2.legend(loc='upper right')
ax2.grid(True, linestyle=':', alpha=0.6)

plt.tight_layout()
plt.savefig('cac_and_payback_trajectory.png', dpi=300)
plt.show()
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCacScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md">
                Unit Economics Diagnostic
              </span>
              <span className="text-xs text-slate-400">Executive S&M Efficiency & Payback Report</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
              Customer Acquisition Cost (CAC) & Payback Analysis
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Longitudinal analysis of blended customer acquisition cost ($400 → $200), payback period compression 
              (4.2 → 1.6 months), acquisition channel attribution, and sales efficiency modeling for Seed-to-Series A expansion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={handleDownloadCsv}
              id="btn-download-cac-csv"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 shadow-xs transition"
              title="Download CAC and Payback Dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download CAC CSV</span>
            </button>

            <button
              onClick={handlePrint}
              id="btn-print-cac-report"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 shadow-xs transition"
              title="Print or Export as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleCopyCode}
              id="btn-copy-cac-code"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.25)] transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5 text-slate-950" />}
              <span>{copiedCode ? 'Python Copied!' : 'Copy CAC Script'}</span>
            </button>
          </div>
        </div>

        {/* Executive CAC Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10 font-mono text-xs">
          <div className="glass-panel-subtle p-3 border border-white/10 shadow-xl">
            <div className="text-slate-400 font-sans flex items-center justify-between">
              <span>Ending CAC (M18)</span>
              <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">$200.00</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium flex items-center space-x-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>-50.0% vs M1 ($400)</span>
            </div>
          </div>

          <div className="glass-panel-subtle p-3 border border-white/10 shadow-xl">
            <div className="text-slate-400 font-sans flex items-center justify-between">
              <span>CAC Payback Period</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">1.62 Months</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              <span>Top 5% SaaS (&lt;12 mo)</span>
            </div>
          </div>

          <div className="glass-panel-subtle p-3 border border-white/10 shadow-xl">
            <div className="text-slate-400 font-sans flex items-center justify-between">
              <span>LTV : CAC Multiple</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-indigo-300 mt-1">4.24x</div>
            <div className="text-[11px] text-indigo-300 mt-0.5 font-medium">
              <span>Optimal (&gt;3.0x benchmark)</span>
            </div>
          </div>

          <div className="glass-panel-subtle p-3 border border-white/10 shadow-xl">
            <div className="text-slate-400 font-sans flex items-center justify-between">
              <span>S&M % of Revenue</span>
              <Target className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">16.0%</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              <span>Compressed from 333%</span>
            </div>
          </div>

          <div className="glass-panel-subtle p-3 border border-white/10 shadow-xl">
            <div className="text-slate-400 font-sans flex items-center justify-between">
              <span>Magic Number (Sales)</span>
              <Zap className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-sky-300 mt-1">1.34x</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              <span>&gt;0.75x High Efficiency</span>
            </div>
          </div>

          <div className="glass-panel-subtle p-3 border border-white/10 shadow-xl">
            <div className="text-slate-400 font-sans flex items-center justify-between">
              <span>Acquisition Pace</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white mt-1">138 / mo</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-medium flex items-center space-x-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+666% volume growth</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveSection('analysis')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === 'analysis'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Trajectory & Visual Charts
          </button>
          <button
            onClick={() => setActiveSection('channels')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === 'channels'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Acquisition Channel Attribution
          </button>
          <button
            onClick={() => setActiveSection('ledger')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === 'ledger'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            18-Month CAC Ledger Table
          </button>
          <button
            onClick={() => setActiveSection('simulator')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === 'simulator'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Interactive CAC Simulator
          </button>
          <button
            onClick={() => setActiveSection('playbook')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === 'playbook'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Strategic Optimization Playbook
          </button>
          <button
            onClick={() => setActiveSection('python')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeSection === 'python'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Python CAC Script
          </button>
        </div>
      </div>

      {/* SECTION 1: Trajectory & Visual Charts */}
      {activeSection === 'analysis' && (
        <div className="space-y-6">
          {/* Key Insights Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-sky-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Halving of Acquisition Costs</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Blended CAC fell from <strong>$400.00</strong> in Month 1 to <strong>$200.00</strong> in Month 18. 
                Initial customer acquisition relied heavily on unoptimized paid search; as organic inbound content, SEO, 
                and word-of-mouth referral loops matured, acquisition efficiency doubled.
              </p>
            </div>

            <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Rapid 1.6-Month Cash Payback</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                At Month 18 ARPU of <strong>$154.00</strong> and 80% SaaS gross margin ($123.20/mo gross profit), 
                new customers repay their full acquisition cost in just <strong>1.62 months (49 days)</strong>, 
                far outperforming the 12-month B2B SaaS benchmark and fueling self-funded growth.
              </p>
            </div>

            <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
              <div className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Massive S&M Operating Leverage</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Sales & Marketing spend scaled 3.8x (from $7,200 to $27,600/mo) while Monthly Recurring Revenue expanded 77.4x 
                (from $2,160 to $167,244). Consequently, S&M contracted from <strong>333% of revenue to 16.0%</strong>, enabling cashflow breakeven.
              </p>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: CAC vs ARPU */}
            <div className="glass-panel p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">CAC Compression vs. ARPU Expansion</h3>
                  <p className="text-xs text-slate-400">Unit margin widens as CAC halves and ARPU rises +28%</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30">
                  Spread: +$46/mo
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cacLedgerData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="shortMonth" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} domain={[0, 450]} />
                    <Tooltip
                      formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="cac" name="Blended CAC ($)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 3, fill: '#38bdf8' }} />
                    <Line type="monotone" dataKey="arpu" name="ARPU ($/Month)" stroke="#34d399" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3, fill: '#34d399' }} />
                    <Line type="monotone" dataKey="monthlyGrossProfit" name="Gross Profit/Cust ($/mo)" stroke="#818cf8" strokeWidth={2} dot={{ r: 2, fill: '#818cf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: CAC Payback Period */}
            <div className="glass-panel p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">CAC Payback Period Trajectory</h3>
                  <p className="text-xs text-slate-400">Months required for customer gross profit to cover CAC</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-medium border border-sky-500/30">
                  Current: 1.62 mo
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cacLedgerData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="shortMonth" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}m`} domain={[0, 5]} />
                    <Tooltip
                      formatter={(val: number) => [`${val.toFixed(2)} Months`, 'Payback Period']}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#94a3b8' }} />
                    <ReferenceLine y={3.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target: 3.0 Mo', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
                    <Area type="monotone" dataKey="paybackMonths" name="CAC Payback (Months)" stroke="#a855f7" strokeWidth={3} fill="rgba(168, 85, 247, 0.2)" dot={{ r: 3, fill: '#a855f7' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: S&M Spend vs New Customers */}
            <div className="glass-panel p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">Monthly S&M Budget vs. New Customer Volume</h3>
                  <p className="text-xs text-slate-400">Diminishing cost per acquisition as customer output surges</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30">
                  +666% Customers
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cacLedgerData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="shortMonth" stroke="#94a3b8" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={11} />
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        name.includes('Spend') ? `$${val.toLocaleString()}` : `${val} logos`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#94a3b8' }} />
                    <Bar yAxisId="left" dataKey="spend" name="S&M Spend ($)" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.8} />
                    <Line yAxisId="right" type="monotone" dataKey="newCustomers" name="New Customers Acquired" stroke="#34d399" strokeWidth={3} dot={{ r: 3, fill: '#34d399' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: S&M Spend as % of Revenue */}
            <div className="glass-panel p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">S&M Spend as % of Total Revenue</h3>
                  <p className="text-xs text-slate-400">Dramatic operating leverage from early high burn to sustainable scale</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium border border-indigo-500/30">
                  Operating Leverage
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cacLedgerData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="shortMonth" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                    <Tooltip
                      formatter={(val: number) => [`${val.toFixed(1)}%`, 'S&M % of Revenue']}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#94a3b8' }} />
                    <ReferenceLine y={25.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Target Max: 25%', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                    <Area type="monotone" dataKey="smPercentOfRevenue" name="S&M % of Revenue" stroke="#f43f5e" strokeWidth={2.5} fill="rgba(244, 63, 94, 0.2)" dot={{ r: 3, fill: '#f43f5e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Acquisition Channel Attribution */}
      {activeSection === 'channels' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Acquisition Channel Economics (Month 18 Snapshot)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Granular unit economics across 4 primary acquisition funnels totaling $27,600 spend and 138 customer acquisitions
                </p>
              </div>
              <div className="text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
                Blended CAC: <span className="text-sky-400 font-bold">$200.00</span> • Blended Payback: <span className="text-emerald-400 font-bold">1.62 Mo</span>
              </div>
            </div>

            {/* Channel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channelData.map((ch) => (
                <div key={ch.channel} className="glass-panel-subtle p-5 border border-white/10 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                        ch.category === 'Organic' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        ch.category === 'Referral' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                        ch.category === 'Paid' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {ch.category} Funnel
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{ch.channel}</h4>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-lg font-bold text-white">${ch.cac.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">CAC per Customer</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Monthly Spend</div>
                      <div className="font-semibold text-slate-200">${ch.spendMonthly.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Logos / Month</div>
                      <div className="font-semibold text-slate-200">{ch.customersAcquired} accounts</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Payback Period</div>
                      <div className="font-semibold text-emerald-400">{ch.paybackMonths} Months</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Avg Contract ARPU</div>
                      <div className="font-semibold text-slate-200">${ch.arpu}/mo</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Conversion Rate</div>
                      <div className="font-semibold text-sky-300">{ch.conversionRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-sans">Channel LTV:CAC</div>
                      <div className="font-semibold text-indigo-300">{ch.ltvCac}x</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {ch.notes}
                  </p>
                </div>
              ))}
            </div>

            {/* Visual Channel Comparison Chart */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-sm font-bold text-white mb-1">Acquisition Cost & Payback by Channel</h4>
              <p className="text-xs text-slate-400 mb-4">Comparing channel efficiency to identify capital re-allocation opportunities</p>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis dataKey="channel" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={11} tickFormatter={(val) => `${val}m`} />
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        name.includes('CAC') ? `$${val.toFixed(2)}` : `${val} Months`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10, color: '#94a3b8' }} />
                    <Bar yAxisId="left" dataKey="cac" name="Channel CAC ($)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="paybackMonths" name="Payback Period (Months)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 18-Month CAC Ledger Table */}
      {activeSection === 'ledger' && (
        <div className="space-y-4">
          <div className="glass-panel overflow-hidden border border-white/10 shadow-2xl">
            <div className="px-6 py-4 bg-slate-900/80 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-white">18-Month CAC & Payback Ledger (Vectorized Dataset)</h3>
                <p className="text-xs text-slate-400">Monthly S&M budget, logo acquisition count, unit cost, and cash payback velocity</p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Formula:</span>
                <span className="bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded border border-sky-500/20">Payback = CAC / (ARPU × 80% Margin)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/90 text-slate-300 font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-3 text-right">New Logos</th>
                    <th className="py-3 px-3 text-right">S&M Spend</th>
                    <th className="py-3 px-3 text-right text-sky-300 font-bold">Blended CAC</th>
                    <th className="py-3 px-3 text-right">ARPU</th>
                    <th className="py-3 px-3 text-right">Mo. GP / Cust</th>
                    <th className="py-3 px-3 text-right text-emerald-400 font-bold">Payback</th>
                    <th className="py-3 px-3 text-right">S&M % Rev</th>
                    <th className="py-3 px-3 text-right">LTV</th>
                    <th className="py-3 px-3 text-right text-indigo-300">LTV:CAC</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {cacLedgerData.map((row) => (
                    <tr key={row.month} className="hover:bg-sky-500/5 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-white whitespace-nowrap">
                        {row.monthLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.newCustomers}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">${row.spend.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-sky-400">${row.cac.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">${row.arpu.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400">${row.monthlyGrossProfit.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{row.paybackMonths.toFixed(2)} mo</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.smPercentOfRevenue}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">${row.ltv.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-300">{row.ltvCac.toFixed(2)}x</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-semibold ${
                          row.paybackMonths <= 2.0 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : row.paybackMonths <= 3.5 
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {row.paybackMonths <= 2.0 ? 'Elite (<2m)' : row.paybackMonths <= 3.5 ? 'Optimal' : 'Standard'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Interactive CAC Simulator */}
      {activeSection === 'simulator' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Interactive CAC & Payback Sensitivity Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Model hypothetical shifts in monthly S&M budget, customer conversion volume, pricing ARPU, gross margin, 
              and churn rate to evaluate forward-looking unit economics and cash recovery speeds.
            </p>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
              {/* Slider 1: S&M Budget */}
              <div className="glass-panel-subtle p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Monthly S&M Spend</span>
                  <span className="font-mono text-sky-400 font-bold">${simSpend.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={simSpend}
                  onChange={(e) => setSimSpend(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$5,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Slider 2: New Customers Acquired */}
              <div className="glass-panel-subtle p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">New Customers / Mo</span>
                  <span className="font-mono text-sky-400 font-bold">{simNewCustomers} logos</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={simNewCustomers}
                  onChange={(e) => setSimNewCustomers(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              {/* Slider 3: ARPU */}
              <div className="glass-panel-subtle p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">ARPU ($/Month)</span>
                  <span className="font-mono text-sky-400 font-bold">${simArpu}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="5"
                  value={simArpu}
                  onChange={(e) => setSimArpu(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$50</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Slider 4: Gross Margin */}
              <div className="glass-panel-subtle p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Gross Margin %</span>
                  <span className="font-mono text-sky-400 font-bold">{simGrossMargin}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="1"
                  value={simGrossMargin}
                  onChange={(e) => setSimGrossMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50%</span>
                  <span>95%</span>
                </div>
              </div>

              {/* Slider 5: Monthly Churn */}
              <div className="glass-panel-subtle p-4 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Monthly Logo Churn %</span>
                  <span className="font-mono text-sky-400 font-bold">{simChurnRate}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={simChurnRate}
                  onChange={(e) => setSimChurnRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.0%</span>
                  <span>8.0%</span>
                </div>
              </div>

              {/* Quick Reset */}
              <div className="glass-panel-subtle p-4 border border-white/10 flex flex-col justify-center items-center">
                <button
                  onClick={() => {
                    setSimSpend(27600);
                    setSimNewCustomers(138);
                    setSimArpu(154);
                    setSimGrossMargin(80);
                    setSimChurnRate(2.9);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition"
                >
                  Reset to Month 18 Actuals
                </button>
              </div>
            </div>

            {/* Simulator Output Summary */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Simulated Unit Economics Result</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
                  <div className="text-slate-400 font-sans">Simulated CAC</div>
                  <div className="text-2xl font-bold text-sky-300 mt-1">${simCac.toFixed(2)}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">Spend ÷ New Logos</div>
                </div>

                <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
                  <div className="text-slate-400 font-sans">Payback Period</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{simPaybackMonths.toFixed(2)} Mo</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">
                    {simPaybackMonths <= 12 ? '✓ Meets SaaS Benchmark' : '⚠️ Exceeds 12-Month Target'}
                  </div>
                </div>

                <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
                  <div className="text-slate-400 font-sans">Customer LTV</div>
                  <div className="text-2xl font-bold text-indigo-300 mt-1">${simLtv.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">Gross Margin / Churn</div>
                </div>

                <div className="glass-panel-subtle p-4 border border-white/10 shadow-xl">
                  <div className="text-slate-400 font-sans">LTV : CAC Multiple</div>
                  <div className="text-2xl font-bold text-white mt-1">{simLtvCac.toFixed(2)}x</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">
                    {simLtvCac >= 3.0 ? '✓ Healthy (>3.0x)' : '⚠️ Sub-optimal (<3.0x)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Strategic Optimization Playbook */}
      {activeSection === 'playbook' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/10 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Actionable Leadership Roadmap</span>
              <h3 className="text-lg font-bold text-white mt-1">4-Point CAC & Payback Optimization Playbook</h3>
              <p className="text-xs text-slate-300 mt-1">
                Strategic initiatives designed to compress CAC below $160, reduce cash payback to zero via upfront prepayments, 
                and scale customer acquisition velocity toward Series A targets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Play 1 */}
              <div className="glass-panel-subtle p-5 border border-white/10 shadow-xl space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs flex items-center justify-center border border-sky-500/40">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Shift Paid Ad Budget to Product-Led Inbound & Content</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Paid search CAC stands at <strong>$285.00</strong> compared to organic content CAC of <strong>$78.00</strong>. 
                  Reallocating $5,000/month from general PPC toward developer documentation, technical benchmarks, and interactive sandbox tooling 
                  will increase organic logo share by 35%, lowering company-wide blended CAC by $32/customer.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-1">
                  Expected Impact: Blended CAC &lt;$170 • Annual S&M Savings: $58,000
                </div>
              </div>

              {/* Play 2 */}
              <div className="glass-panel-subtle p-5 border border-white/10 shadow-xl space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Incentivize Annual Upfront Contracts for 0-Month Payback</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Offer a 15% discount for annual upfront billing. For a contract with $154/mo ARPU ($1,570/yr prepaid), 
                  the company collects $1,570 on Day 1 against a $200 CAC. This immediately transforms CAC payback from 
                  <strong> 1.62 months to Day 0 cash positive</strong>, generating non-dilutive working capital.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-1">
                  Expected Impact: Immediate Working Capital • Elimination of Runway Drag
                </div>
              </div>

              {/* Play 3 */}
              <div className="glass-panel-subtle p-5 border border-white/10 shadow-xl space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Institutionalize Customer Referral & Integration Loops</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Customer referrals currently yield the highest conversion rate (16.2%) and lowest churn (&lt;1.8%). 
                  Implement an in-app two-sided reward program ($50 platform credits for both parties upon referral activation) 
                  and expand native integrations with popular tech stacks to leverage partner marketplace discovery.
                </p>
                <div className="text-[11px] font-mono text-indigo-300 pt-1">
                  Expected Impact: +20 Referral Logos/mo • Viral Coefficient from 0.12 to 0.28
                </div>
              </div>

              {/* Play 4 */}
              <div className="glass-panel-subtle p-5 border border-white/10 shadow-xl space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/40">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-white">Automate Sales Qualification to Compress Outbound CAC</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Outbound sales carries the highest CAC ($340.00). Deploy automated enrichment (Clearbit/Apollo) and in-app usage signals 
                  (Product-Qualified Leads / PQLs) so sales representatives only engage accounts with demonstrated high intent. 
                  This cuts SDR sales cycle duration from 32 days down to 14 days.
                </p>
                <div className="text-[11px] font-mono text-amber-300 pt-1">
                  Expected Impact: Outbound CAC reduced from $340 to $225 • Rep Quota Attainment: +40%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: Python CAC Script */}
      {activeSection === 'python' && (
        <div className="glass-panel-subtle p-5 border border-white/10 text-slate-200 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-slate-200">cac_payback_analysis.py (Pandas, Matplotlib, Seaborn)</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 text-slate-950 text-xs font-sans font-semibold transition shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5 text-slate-950" />}
              <span>{copiedCode ? 'Copied Code!' : 'Copy CAC Script'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-300 max-h-[540px]">
            {pythonCacScript}
          </pre>
        </div>
      )}
    </div>
  );
};
