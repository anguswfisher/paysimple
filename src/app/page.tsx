import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, FileText, Calendar, Shield, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-3.5 bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="font-bold text-lg text-navy tracking-tight">
          Pay<span className="text-steel">Simple</span>
        </div>
        <div className="flex items-center gap-7">
          <a href="#features" className="text-sm text-neutral-500 font-medium hover:text-slate cursor-pointer transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-neutral-500 font-medium hover:text-slate cursor-pointer transition-colors">
            How It Works
          </a>
                    <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-slate hover:bg-slate/10">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-navy hover:bg-navy/90">
              Create Account
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy py-16 text-center">
        <div className="absolute inset-0 opacity-[4%] bg-grid-white"></div>
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-radial-blue opacity-20 pointer-events-none"></div>
        
        <div className="relative max-w-4xl mx-auto px-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-steel/15 rounded-full mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
            <span className="text-xs font-semibold text-white/80 tracking-wide">
              AI-Powered Construction Payments
            </span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight max-w-2xl mx-auto mb-4">
            Automate <span className="text-steel">AIA Contract</span> Payment Schedules
          </h1>
          
          <p className="text-base text-white/60 max-w-lg mx-auto mb-7 leading-relaxed">
            Upload your AIA contract documents and let AI extract payment terms, generate compliant schedules, and flag compliance risks in minutes.
          </p>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-navy hover:bg-neutral-100 font-semibold px-7 py-3">
                Create Account
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white/25 text-white/80 hover:border-white/50 hover:text-white">
                View Demo
            </Button>
          </div>
          
          <p className="text-xs text-white/35">
            Educational Demo • Portfolio Project
          </p>
        </div>
      </section>

      
      {/* Steps Section */}
      <section id="how-it-works" className="py-12 bg-warm-white text-center">
        <div className="text-xs font-bold text-steel uppercase tracking-widest mb-2">
          How It Works
        </div>
        <h2 className="text-2xl font-extrabold text-slate tracking-tight mb-9">
          Three Simple Steps to Perfect Payment Schedules
        </h2>
        
        <div className="flex gap-4 max-w-5xl mx-auto">
          <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-6 text-left hover:border-steel hover:-translate-y-0.5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-steel/10 text-steel flex items-center justify-center font-extrabold text-sm mb-3.5">
              1
            </div>
            <h3 className="text-base font-bold text-slate mb-1.5 tracking-tight">
              Upload Contract
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Upload your AIA contract documents (PDF, DOCX) and our AI extracts all payment terms automatically.
            </p>
          </div>
          
          <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-6 text-left hover:border-purple-600 hover:-translate-y-0.5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-extrabold text-sm mb-3.5">
              2
            </div>
            <h3 className="text-base font-bold text-slate mb-1.5 tracking-tight">
              Review & Edit
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Review extracted terms, make adjustments, and ensure all payment details are accurate.
            </p>
          </div>
          
          <div className="flex-1 bg-white rounded-xl border border-neutral-200 p-6 text-left hover:border-success hover:-translate-y-0.5 transition-all">
            <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center font-extrabold text-sm mb-3.5">
              3
            </div>
            <h3 className="text-base font-bold text-slate mb-1.5 tracking-tight">
              Export Schedule
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Generate compliant payment schedules with retainage calculations and export as PDF or Excel.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate mb-4">
              Everything You Need for Construction Payments
            </h2>
            <p className="text-base text-neutral-600 max-w-2xl mx-auto">
              From contract analysis to compliance checking, PaySimple handles the entire payment workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-2">AI Contract Analysis</h3>
                <p className="text-sm text-neutral-600">
                  Automatically extract payment terms, milestones, and retainage from AIA contracts.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-steel/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-steel" />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-2">Smart Scheduling</h3>
                <p className="text-sm text-neutral-600">
                  Generate payment schedules with proper retainage calculations and milestone tracking.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-2">Compliance Checking</h3>
                <p className="text-sm text-neutral-600">
                  Flag potential compliance issues and ensure adherence to construction payment regulations.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-2">Progress Tracking</h3>
                <p className="text-sm text-neutral-600">
                  Monitor payment progress, retainage release, and project completion status.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-2">Document Export</h3>
                <p className="text-sm text-neutral-600">
                  Export professional payment schedules, compliance reports, and lien waivers.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-danger" />
              </div>
              <div>
                <h3 className="font-semibold text-slate mb-2">Easy Integration</h3>
                <p className="text-sm text-neutral-600">
                  Import data from existing systems and export to popular accounting software.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy text-center">
        <div className="max-w-3xl mx-auto px-8">
          <div className="mb-8 p-4 bg-white/10 border border-white/20 rounded-lg">
            <p className="text-sm text-white font-semibold mb-2">⚠️ Educational Project Disclaimer</p>
            <p className="text-xs text-white/80">
              PaySimple is an educational portfolio project created for demonstration and learning purposes only. 
              This is not a commercial product. There is no intent to distribute, sell, or deploy this application for real-world use. 
              All features are illustrative and not intended for production use with actual construction contracts or payment data.
            </p>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Payment Schedules?
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-2xl mx-auto">
            Explore the demo
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-navy hover:bg-neutral-100 font-semibold px-8 py-3">
              Create Account
            </Button>
          </Link>
          <p className="text-xs text-white/60 mt-4">
            Educational Demo • Portfolio Project
          </p>
        </div>
      </section>
    </div>
  )
}
