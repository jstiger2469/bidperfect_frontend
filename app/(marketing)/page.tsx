'use client'

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, ArrowRight, Building2, FileText, Users, Shield, BarChart3, Sparkles, Network,
  Rocket, Timer, ListChecks, Lock, DollarSign, PlugZap, GaugeCircle, Package, BookOpen,
  FileSignature, Calculator, MessageSquare, GitPullRequest, Mail, Folder, Cloud, Target,
  Zap, UserCheck, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const features = [
  {
    icon: <Network className="h-5 w-5"/>,
    gradient: "from-blue-500 to-indigo-600",
    title: "Unified RFP Workspace",
    desc: "One command center for the entire lifecycle—capture, parse, collaborate, redline, submit, and audit in one place.",
  },
  {
    icon: <Sparkles className="h-5 w-5"/>,
    gradient: "from-purple-500 to-pink-600",
    title: "AI-Powered Intelligence",
    desc: "Agent-driven parsing, gap analysis, proposal drafting, and scoring suggestions aligned to evaluation criteria.",
  },
  {
    icon: <ListChecks className="h-5 w-5"/>,
    gradient: "from-emerald-500 to-teal-600",
    title: "Compliance Matrix",
    desc: "Notion-style matrix with clause mapping, evidence links, and real‑time readiness scoring (FAR-aligned).",
  },
  {
    icon: <UserCheck className="h-5 w-5"/>,
    gradient: "from-orange-500 to-red-600",
    title: "Subcontractor Portal",
    desc: "Invite subs, collect certs & pricing, track readiness, and consolidate quotes with built‑in approval workflows.",
  },
  {
    icon: <TrendingUp className="h-5 w-5"/>,
    gradient: "from-cyan-500 to-blue-600",
    title: "Pricing & Cost Modeling",
    desc: "G&A/Overhead, fee guidance, wage determinations, CLIN mapping, and margin intelligence—export to PDF/DOCX.",
  },
  {
    icon: <FileSignature className="h-5 w-5"/>,
    gradient: "from-violet-500 to-purple-600",
    title: "Post‑Award Contract Admin",
    desc: "Mods, deliverables, GFP logs, invoice builder, CPARS prep, closeout checklists—all tightly integrated.",
  },
];

const pillars = [
  { icon: <Zap className="h-5 w-5"/>, gradient: "from-yellow-500 to-orange-600", title: "Speed", desc: "Days to hours—automate parsing, drafting, routing, and approvals." },
  { icon: <Shield className="h-5 w-5"/>, gradient: "from-green-500 to-emerald-600", title: "Compliance", desc: "Stay aligned to clauses and instructions; fix risks before submission." },
  { icon: <Target className="h-5 w-5"/>, gradient: "from-blue-500 to-cyan-600", title: "Accuracy", desc: "Structured data + agent checks increase win probability and quality." },
  { icon: <Users className="h-5 w-5"/>, gradient: "from-indigo-500 to-purple-600", title: "Collaboration", desc: "One hub for primes, subs, SMEs, and reviewers with audit trails." },
];

const methodology = [
  {
    step: "01",
    title: "Capture & Parse",
    copy: "Upload RFPs, amendments, and attachments. Agents extract scope, instructions, evaluation factors, and compliance requirements into structured objects.",
    icon: <FileText className="h-5 w-5"/>,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    step: "02",
    title: "Assess & Plan",
    copy: "Gap analysis flags missing certifications, staff, and documents; generate a pursuit plan with tasks, owners, and due dates.",
    icon: <ListChecks className="h-5 w-5"/>,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    step: "03",
    title: "Assemble & Price",
    copy: "Subcontractor onboarding, scope confirmation, CLIN mapping, wage determinations, and cost modeling with margin guidance.",
    icon: <Package className="h-5 w-5"/>,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    step: "04",
    title: "Draft & Review",
    copy: "AI proposal builder crafts tailored content; reviewers redline in context while the compliance matrix stays in sync.",
    icon: <BookOpen className="h-5 w-5"/>,
    gradient: "from-orange-500 to-red-600",
  },
  {
    step: "05",
    title: "Submit & Manage",
    copy: "Export to agency formats and track post‑award performance: mods, deliverables, invoices, and CPARS—end to end.",
    icon: <GitPullRequest className="h-5 w-5"/>,
    gradient: "from-cyan-500 to-blue-600",
  },
];

const badges = ['SAM Registered', 'LaGov Ready', 'QuickBooks Ready', 'Clerk SSO', 'FAR‑Aligned', 'SOC 2 (in progress)'];

function KPI({value, label}:{value:string; label:string}){
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ROIBlock(){
  const [hourly, setHourly] = useState(85);
  const [hours, setHours] = useState(40);
  const [bids, setBids] = useState(12);

  const savings = useMemo(() => hourly * hours * bids * 0.35, [hourly, hours, bids]);
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white/70 via-indigo-50/60 to-fuchsia-50/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
      <CardHeader>
        <CardTitle>Quick ROI Estimator</CardTitle>
        <CardDescription>Estimate time-savings with automation (assumes 35% efficiency gain).</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-4 gap-4">
        <div>
          <Label>Avg. Hourly Cost ($)</Label>
          <Input type="number" value={hourly} onChange={(e)=>setHourly(Number(e.target.value)||0)} />
        </div>
        <div>
          <Label>Hours per Bid</Label>
          <Input type="number" value={hours} onChange={(e)=>setHours(Number(e.target.value)||0)} />
        </div>
        <div>
          <Label>Bids / Quarter</Label>
          <Input type="number" value={bids} onChange={(e)=>setBids(Number(e.target.value)||0)} />
        </div>
        <div className="flex items-end">
          <div className="w-full p-4 rounded-xl border border-white/40 bg-gradient-to-br from-white/60 to-indigo-50/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
            <div className="text-xs text-muted-foreground">Projected Savings</div>
            <div className="text-2xl font-semibold">${savings.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BidPerfectHome() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const sections = document.querySelectorAll('section');
      console.assert(sections.length >= 7, `Expected at least 7 <section> elements, found ${sections.length}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white grid place-content-center font-bold text-sm shadow-md">
              BP
            </div>
            <span className="font-bold text-lg text-slate-900">BidPerfect</span>
            <Badge variant="secondary" className="ml-2 hidden md:inline-flex bg-blue-50 text-blue-700 border-blue-200">
              Enterprise
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#faqs" className="hover:text-blue-600 transition-colors">Resources</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="hidden md:inline-flex hover:bg-slate-100">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="group bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform"/>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}}>
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Rocket className="h-3.5 w-3.5 mr-1.5"/> Win more, with less effort
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Automate the RFP lifecycle—from pursuit to post‑award
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-xl leading-relaxed">
              BidPerfect unifies parsing, compliance, pricing, subcontractors, proposal drafting, and contract admin into a single, AI‑assisted platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all text-base px-8">
                  Start Free Trial
                </Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-700 text-base px-8">
                  See how it works
                </Button>
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-3 items-center">
              {badges.map(b => (
                <div key={b} className="h-12 rounded-lg border border-slate-200 bg-white grid place-content-center text-xs text-slate-600 font-medium shadow-sm hover:shadow-md transition-shadow">
                  {b}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.7, delay:0.1}} className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-5">
              <div className="rounded-xl h-72 md:h-96 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center text-white/80 text-sm font-medium">
                <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">Product Demo</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="py-10 md:py-14 border-t">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pillars.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border border-white/40 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`p-2 rounded-lg bg-gradient-to-br ${p.gradient} text-white shadow-md`}
                      >
                        {p.icon}
                      </motion.div>
                      <div className="font-medium">{p.title}</div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline"><Sparkles className="h-3.5 w-3.5 mr-1"/> Platform</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">Everything you need to go from RFP to award.</h2>
            <p className="mt-3 text-slate-600">A unified system for teams that can’t afford guesswork—centralize requirements, automate drafting, and keep compliance airtight.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="hover:shadow-xl transition-all border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 text-slate-700">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg`}
                      >
                        {f.icon}
                      </motion.div>
                      <CardTitle className="text-lg">{f.title}</CardTitle>
                    </div>
                    <CardDescription className="pt-2">{f.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY / HOW IT WORKS */}
      <section id="how" className="py-16 bg-slate-50 border-y">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline"><Network className="h-3.5 w-3.5 mr-1"/> Methodology</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">A proven, enterprise sales flow—clear, intuitive, complete.</h2>
            <p className="mt-3 text-slate-600">We follow a classic conversion narrative: identify pain → quantify impact → demonstrate solution → prove value → invite action.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4 mt-8">
            {methodology.map((m, idx) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="p-5 rounded-2xl bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40 h-full hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-500">{m.step}</div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className={`p-2 rounded-lg bg-gradient-to-br ${m.gradient} text-white shadow-md`}
                  >
                    {m.icon}
                  </motion.div>
                </div>
                <div className="mt-3 font-medium">{m.title}</div>
                <p className="mt-2 text-sm text-slate-600">{m.copy}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <KPI value="35%" label="Avg. time saved per bid"/>
            <KPI value="+22%" label="Modeled win‑rate lift"/>
            <KPI value=">99.9%" label="Uptime & auditability"/>
          </div>
        </div>
      </section>

      {/* SOLUTIONS BY ROLE */}
      <section id="solutions" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline"><Building2 className="h-3.5 w-3.5 mr-1"/> Solutions</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">Built for primes, subs, and public‑sector teams.</h2>
            <p className="mt-3 text-slate-600">Whether you’re a growing contractor or an enterprise capture team, BidPerfect adapts to how you work.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <Card className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40">
              <CardHeader>
                <CardTitle>Prime Contractors</CardTitle>
                <CardDescription>Orchestrate pursuits, coordinate subs, and submit airtight proposals—fast.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Gap analysis & compliance matrix</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Pricing models with CLIN mapping</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Proposal generator with reviewer redlines</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40">
              <CardHeader>
                <CardTitle>Subcontractors</CardTitle>
                <CardDescription>Simple invites, certificate intake, and scope confirmation—no chaos.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Portal for certs, pricing, and timelines</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Readiness scoring and reminders</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Scope & deliverable alignment</div>
              </CardContent>
            </Card>
            <Card className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40">
              <CardHeader>
                <CardTitle>Executives & Capture</CardTitle>
                <CardDescription>See the pipeline, forecast revenue, and enforce best practices.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Portfolio views & status dashboards</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Cost & margin insights with guardrails</div>
                <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Audit trails and policy controls</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI + SOCIAL PROOF */}
      <section className="py-16 bg-slate-50 border-y">
        <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <Badge variant="outline"><DollarSign className="h-3.5 w-3.5 mr-1"/> Outcomes</Badge>
            <h3 className="text-2xl md:text-4xl font-semibold tracking-tight mt-3">Proven savings and better wins.</h3>
            <p className="mt-3 text-slate-600">Teams cut cycle time by a third and ship higher‑quality proposals with fewer late‑night scrambles. Use the estimator to see your impact.</p>
            <div className="mt-6">
              <ROIBlock />
            </div>
            <div className="mt-6 text-sm text-slate-500">* Estimates are illustrative; actuals vary by industry and team maturity.</div>
          </div>
          <div>
            <div className="grid gap-4">
              <Card className="border border-white/40 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 shadow-md">
                <CardContent className="p-6">
                  <div className="text-slate-700">“Gap to submission in 9 days—without sacrificing compliance. BidPerfect replaced six tools for us.”</div>
                  <div className="mt-3 text-sm text-slate-500">Director of Capture, Regional Contractor</div>
                </CardContent>
              </Card>
              <Card className="border border-white/40 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 shadow-md">
                <CardContent className="p-6">
                  <div className="text-slate-700">“The subcontractor portal finally gave us real visibility into readiness and pricing.”</div>
                  <div className="mt-3 text-sm text-slate-500">VP Operations, Construction Services</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & INTEGRATIONS */}
      <section id="security" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline"><Lock className="h-3.5 w-3.5 mr-1"/> Security</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">Enterprise‑grade security, governance, and control.</h2>
            <p className="mt-3 text-slate-600">SSO (SAML), role‑based access, encryption in transit and at rest, and comprehensive audit trails. Built for regulated workflows.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <Card className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40">
              <CardHeader>
                <CardTitle>Access & Identity</CardTitle>
                <CardDescription>SSO/SAML, SCIM provisioning, role & project scopes.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40">
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>Encryption at rest & in transit, granular retention controls.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 border border-white/40">
              <CardHeader>
                <CardTitle>Auditability</CardTitle>
                <CardDescription>Immutable logs for submissions, edits, and approvals.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* INTEGRATIONS GRID */}
          <div className="mt-10">
            <Badge variant="outline"><PlugZap className="h-3.5 w-3.5 mr-1"/> Integrations</Badge>
            <p className="mt-2 text-slate-600 max-w-3xl">Connect the tools you already use—sync documents, capture emails, and collect signatures without breaking your flow.</p>
            <div className="grid md:grid-cols-3 gap-6 mt-6" data-testid="integrations-grid">
              <Card className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-2 rounded-lg bg-slate-50 border"><Folder className="h-5 w-5"/></div>
                    <CardTitle data-testid="integration-title">Drive & Docs</CardTitle>
                  </div>
                  <CardDescription>Google Drive • OneDrive • SharePoint</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Two‑way sync & versioning</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Map files to compliance items</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Inline previews & evidence links</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-2 rounded-lg bg-slate-50 border"><Mail className="h-5 w-5"/></div>
                    <CardTitle data-testid="integration-title">Email</CardTitle>
                  </div>
                  <CardDescription>Gmail • Microsoft 365</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Convert RFP notices into pursuits</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Auto‑file attachments to the Document Vault</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Thread sync to proposal timelines</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-2 rounded-lg bg-slate-50 border"><FileSignature className="h-5 w-5"/></div>
                    <CardTitle data-testid="integration-title">e‑Sign</CardTitle>
                  </div>
                  <CardDescription>DocuSign • Adobe Acrobat Sign</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> LOIs, NDAs, subcontractor agreements</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Templates with merge fields</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Signed docs auto‑vaulted with audit trail</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-2 rounded-lg bg-slate-50 border"><DollarSign className="h-5 w-5"/></div>
                    <CardTitle data-testid="integration-title">Accounting</CardTitle>
                  </div>
                  <CardDescription>QuickBooks Online</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Invoice export with CLIN matching</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> AR sync & status visibility</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Cost centers & approval routing</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-2 rounded-lg bg-slate-50 border"><Cloud className="h-5 w-5"/></div>
                    <CardTitle data-testid="integration-title">Storage</CardTitle>
                  </div>
                  <CardDescription>AWS S3 • Azure Blob</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Evidence storage with retention controls</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Regional data residency</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Checksums & version history</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50">
                <CardHeader>
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="p-2 rounded-lg bg-slate-50 border"><Lock className="h-5 w-5"/></div>
                    <CardTitle data-testid="integration-title">Identity</CardTitle>
                  </div>
                  <CardDescription>Clerk SSO • SCIM (provisioning)</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Role-based & project-scoped access</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Just‑in‑time user provisioning</div>
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5"/> Audit logs for sign‑ins & changes</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6 text-xs text-slate-500">* Availability varies by plan and region. Contact sales for the latest connector list.</div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-16 md:py-24 border-t">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <Badge variant="outline"><MessageSquare className="h-3.5 w-3.5 mr-1"/> FAQs</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mt-3">Questions, meet answers.</h2>
            <p className="mt-3 text-slate-600">The essentials teams ask before standardizing their RFP workflow on BidPerfect.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {[
              "Does BidPerfect replace my proposal team?",
              "Can we invite subcontractors securely?",
              "How do you handle wage determinations & CLINs?",
              "Do you support post‑award management?",
              "Is our data isolated?",
              "What’s the rollout time?",
            ].map((q) => (
              <Card key={q} className="border-slate-200 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50" data-testid="faq-card">
                <CardHeader><CardTitle>{q}</CardTitle></CardHeader>
                <CardContent className="text-slate-600 text-sm">Details available on request.</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-2">
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Ready to win more bids with less chaos?
              </h3>
              <p className="mt-4 text-xl text-blue-100 max-w-2xl leading-relaxed">
                See how BidPerfect streamlines your entire pursuit—from the first read to award and beyond.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-200" />
                  <span className="text-blue-100">Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-200" />
                  <span className="text-blue-100">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-200" />
                  <span className="text-blue-100">Cancel anytime</span>
                </div>
              </div>
            </div>
            <div className="md:justify-self-end flex flex-col sm:flex-row md:flex-col gap-4 w-full md:w-auto">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all text-base font-semibold px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white grid place-content-center text-xs shadow-md">BP</div>
              BidPerfect
            </div>
            <p className="mt-3 text-slate-600 leading-relaxed">Procurement intelligence for modern contractors and capture teams.</p>
          </div>
          <div>
            <div className="text-slate-900 font-semibold mb-3">Product</div>
            <ul className="space-y-2.5 text-slate-600" data-testid="footer-product-links">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#how" className="hover:text-blue-600 transition-colors">How it works</a></li>
              <li><a href="#security" className="hover:text-blue-600 transition-colors">Security</a></li>
              <li><a href="#faqs" className="hover:text-blue-600 transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 font-semibold mb-3">Company</div>
            <ul className="space-y-2.5 text-slate-600">
              <li><a className="hover:text-blue-600 transition-colors cursor-pointer">About</a></li>
              <li><a className="hover:text-blue-600 transition-colors cursor-pointer">Careers</a></li>
              <li><a className="hover:text-blue-600 transition-colors cursor-pointer">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-slate-900 font-semibold mb-3">Get in touch</div>
            <div className="space-y-2 text-slate-600">
              <div>sales@bidperfect.ai</div>
              <div>New Orleans, LA</div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link href="/sign-up">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} BidPerfect. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


