import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate sm:text-6xl">
              AI-Powered Construction
              <span className="text-navy"> Payment Scheduling</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate/70">
              Upload AIA contract documents, let Claude AI extract payment terms, and generate compliant payment schedules with automatic retainage calculations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-navy hover:bg-navy/90">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section id="how-it-works" className="py-24 bg-concrete">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate sm:text-4xl">
              Simple 3-Step Process
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate/70">
              From contract to payment schedule in minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-white mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <CardTitle className="text-navy">Upload Contract</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate/70">
                  Upload your AIA contract documents (PDF or DOCX) and our AI will automatically extract all payment terms, milestones, and compliance requirements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-steel text-white mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <CardTitle className="text-navy">Review & Edit</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate/70">
                  Review the extracted terms in our split-screen interface. Make any necessary adjustments and confirm payment milestones and retainage calculations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-white mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <CardTitle className="text-navy">Export & Share</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate/70">
                  Export your payment schedule as PDF or CSV, share with stakeholders, and track compliance with automated flagging of potential issues.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Simplify Your Payment Scheduling?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-warm-white/80">
              Join construction companies who are saving hours of administrative work and ensuring compliance on every project.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="bg-warm-white text-navy hover:bg-warm-white/90">
                <Link href="/signup">Start Your Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
