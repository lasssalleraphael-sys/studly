// app/page.tsx
'use client'
import { BookOpen, Mic, FileText, Brain, CheckCircle, ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Trust Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-full shadow-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700 font-medium">Trusted by 25,000+ IB, A-Level &amp; GCSE students</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Turn lectures into revision notes.
              <br />
              <span className="text-blue-600">Automatically.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Record your class. Get structured notes, flashcards, and key concepts instantly. 
              Spend less time writing, more time understanding.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/auth"
              className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              Start free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#how-it-works"
              className="px-8 py-4 bg-white border border-gray-300 text-gray-700 font-semibold text-lg rounded-lg hover:bg-gray-50 transition-colors"
            >
              See how it works
            </Link>
          </div>

          {/* Product Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                {/* Placeholder for product screenshot/demo */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-12 h-12 text-blue-600" strokeWidth={2} />
                  </div>
                  <p className="text-gray-500 font-medium">Product demo coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { stat: '25,000+', label: 'Students across 23 countries' },
              { stat: '86%', label: 'Achieved their target grade' },
              { stat: '92%', label: 'Report reduced exam stress' },
              { stat: '4+ hours', label: 'Saved per week on average' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{item.stat}</div>
                <div className="text-sm text-gray-600 leading-snug">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Three steps to better revision
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From lecture recording to exam-ready notes in minutes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                icon: Mic,
                number: '1',
                title: 'Record your lecture',
                description: 'One-click recording on any device. Works in class, at home, or anywhere you study.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Brain,
                number: '2',
                title: 'We process it automatically',
                description: 'Our system transcribes and analyzes your recording. No manual work needed.',
                color: 'bg-purple-100 text-purple-600'
              },
              {
                icon: FileText,
                number: '3',
                title: 'Get revision-ready notes',
                description: 'Structured notes, flashcards, and summaries organized by topic. Ready to study.',
                color: 'bg-green-100 text-green-600'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${item.color} rounded-xl mb-6`}>
                  <item.icon className="w-8 h-8" strokeWidth={2} />
                </div>
                <div className="text-sm font-semibold text-gray-500 mb-2">STEP {item.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Built for serious students
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to revise effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: 'Structured notes', 
                desc: 'Notes organized by topic with clear headings and bullet points',
                icon: '📝'
              },
              { 
                title: 'Flashcards', 
                desc: 'Key terms and concepts turned into study cards automatically',
                icon: '🗂️'
              },
              { 
                title: 'Key concepts', 
                desc: 'Main ideas extracted and highlighted for quick review',
                icon: '💡'
              },
              { 
                title: 'Topic summaries', 
                desc: 'Concise overviews perfect for last-minute revision',
                icon: '📋'
              },
              { 
                title: 'Search & filter', 
                desc: 'Find specific topics across all your notes instantly',
                icon: '🔍'
              },
              { 
                title: 'Export options', 
                desc: 'Download as PDF or print for offline study',
                icon: '📄'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA Section - Links to dedicated pricing page */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the plan that works for you. All plans include a free trial with no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/pricing"
              className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
            >
              View all plans
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth"
              className="px-8 py-4 bg-white border border-gray-300 text-gray-700 font-semibold text-lg rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start free trial
            </Link>
          </div>

          {/* Quick pricing highlights */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Starter</span>
              </div>
              <p className="text-sm text-gray-600">From €9.99/month</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Pro</span>
              </div>
              <p className="text-sm text-gray-600">From €24.99/month</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Elite</span>
              </div>
              <p className="text-sm text-gray-600">From €49.99/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Built by students who understand the pressure
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-8">
            We know what it&apos;s like to juggle multiple subjects, tight deadlines, and exam stress. 
            That&apos;s why we created Studly — to help you focus on understanding concepts, 
            not frantically copying down everything your teacher says.
          </p>
          <Link 
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            Try Studly free for 7 days
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Studly</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Smart revision notes for students who want better results.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Help center</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">© 2025 Studly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
