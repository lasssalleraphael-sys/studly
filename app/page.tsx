'use client'
import { BookOpen, Mic, FileText, Brain, CheckCircle, ArrowRight, Users, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

// Animated counter hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, ref }
}

// Feature card with hover animation
function FeatureCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100)
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [index])

  return (
    <div
      ref={ref}
      className={`group bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-500 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1 hover:border-blue-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-3xl mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stat1 = useCountUp(25000, 2000)
  const stat2 = useCountUp(86, 1500)
  const stat3 = useCountUp(92, 1500)
  const stat4 = useCountUp(4, 1000)

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-60 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

        <div className="max-w-6xl mx-auto relative">
          <div className={`flex justify-center mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full shadow-sm">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">S</div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">A</div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">M</div>
              </div>
              <span className="text-sm text-gray-700 font-medium">Trusted by 25,000+ IB, A-Level & GCSE students</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-gray-900 leading-tight tracking-tight">
              <span className={`inline-block transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Turn lectures into
              </span>
              <br />
              <span className={`inline-block transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                revision notes.
              </span>
              <br />
              <span className={`relative inline-block transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Automatically.
                </span>
              </span>
            </h1>
            <p className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Record your class. Get structured notes, flashcards, and key concepts instantly. 
              <span className="text-gray-900 font-medium"> Spend less time writing, more time understanding.</span>
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link 
              href="/auth"
              className="group px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 hover:-translate-y-0.5"
            >
              Start free trial
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              href="#how-it-works"
              className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-lg rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
            >
              See how it works
            </Link>
          </div>

          <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
            <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl shadow-gray-200/50">
              <div className="aspect-video bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="relative w-28 h-28 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl" />
                    <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium mb-2">Your study companion</p>
                  <p className="text-sm text-gray-400">Record - Transcribe - Study</p>
                </div>
              </div>
              
              <div className="absolute -right-4 top-1/4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Notes ready!</p>
                    <p className="text-xs text-gray-500">Biology Ch. 3</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -left-4 bottom-1/3 bg-white rounded-xl shadow-lg p-3 border border-gray-100 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">12 flashcards</p>
                    <p className="text-xs text-gray-500">Auto-generated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div ref={stat1.ref} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tabular-nums">
                {stat1.count.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600 leading-snug">Students across 23 countries</div>
            </div>
            <div ref={stat2.ref} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tabular-nums">
                {stat2.count}%
              </div>
              <div className="text-sm text-gray-600 leading-snug">Achieved their target grade</div>
            </div>
            <div ref={stat3.ref} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tabular-nums">
                {stat3.count}%
              </div>
              <div className="text-sm text-gray-600 leading-snug">Report reduced exam stress</div>
            </div>
            <div ref={stat4.ref} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 tabular-nums">
                {stat4.count}+ hrs
              </div>
              <div className="text-sm text-gray-600 leading-snug">Saved per week on average</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full mb-4">
              Simple as 1-2-3
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Three steps to better revision
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From lecture recording to exam-ready notes in minutes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Mic,
                number: '1',
                title: 'Record your lecture',
                description: 'One-click recording on any device. Works in class, at home, or anywhere you study.',
                tip: 'Pro tip: Use earphones for clearer audio',
                bgColor: 'bg-blue-100',
                iconColor: 'text-blue-600',
                numColor: 'from-blue-500 to-blue-600'
              },
              {
                icon: Brain,
                number: '2',
                title: 'We process it automatically',
                description: 'Our system transcribes and analyzes your recording. No manual work needed.',
                tip: 'Usually takes 2-3 minutes',
                bgColor: 'bg-purple-100',
                iconColor: 'text-purple-600',
                numColor: 'from-purple-500 to-purple-600'
              },
              {
                icon: FileText,
                number: '3',
                title: 'Get revision-ready notes',
                description: 'Structured notes, flashcards, and summaries organized by topic. Ready to study.',
                tip: 'Export to PDF anytime',
                bgColor: 'bg-green-100',
                iconColor: 'text-green-600',
                numColor: 'from-green-500 to-green-600'
              }
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className={`${item.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <item.icon className={`w-10 h-10 ${item.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${item.numColor} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                      {item.number}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Step {item.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
                  <p className="text-sm text-gray-500">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-700 text-sm font-semibold rounded-full mb-4">
              Everything you need
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Built for serious students
            </h2>
            <p className="text-lg text-gray-600">
              All the tools to ace your exams, nothing you do not need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Structured notes', desc: 'Notes organized by topic with clear headings and bullet points', icon: 'N' },
              { title: 'Flashcards', desc: 'Key terms and concepts turned into study cards automatically', icon: 'F' },
              { title: 'Key concepts', desc: 'Main ideas extracted and highlighted for quick review', icon: 'K' },
              { title: 'Topic summaries', desc: 'Concise overviews perfect for last-minute revision', icon: 'S' },
              { title: 'Search and filter', desc: 'Find specific topics across all your notes instantly', icon: 'Q' },
              { title: 'Export options', desc: 'Download as PDF or print for offline study', icon: 'E' }
            ].map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-full mb-4">
              Simple pricing
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose your plan
            </h2>
            <p className="text-lg text-gray-600">
              All plans include a free trial. No credit card required.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '9.99',
                description: 'Perfect for light course loads',
                popular: false,
                features: [
                  '7 recordings per month',
                  'AI-powered notes',
                  'Flashcard generation',
                  'Email support'
                ]
              },
              {
                name: 'Pro',
                price: '24.99',
                description: 'Most popular for IB and A-Level',
                popular: true,
                features: [
                  '18 recordings per month',
                  'Advanced note formatting',
                  'Priority processing',
                  'Export to PDF',
                  'Priority support'
                ]
              },
              {
                name: 'Elite',
                price: '49.99',
                description: 'For the most demanding students',
                popular: false,
                features: [
                  '37 recordings per month',
                  'Everything in Pro',
                  'Longest recordings',
                  'Premium support',
                  'Early access to features'
                ]
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`relative group bg-white rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-xl shadow-blue-100' 
                    : 'border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Most popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">EUR {plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-500' : 'text-green-500'}`} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/auth"
                    className={`block w-full py-3.5 text-center font-semibold rounded-xl transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Start free trial
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-8">
            Secure payment via Stripe - Cancel anytime - No hidden fees
          </p>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <span className="text-sm font-medium text-blue-100">Built by students, for students</span>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
            Built by students who understand the pressure
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-10 max-w-2xl mx-auto">
            We know what it is like to juggle multiple subjects, tight deadlines, and exam stress. 
            That is why we created Studly to help you focus on understanding concepts, 
            not frantically copying down everything your teacher says.
          </p>
          
          <Link 
            href="/auth"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-blue-900/20 hover:-translate-y-0.5"
          >
            Try Studly free for 7 days
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
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
              <ul className="space-y-3 text-sm">
                <li><Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How it works</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Help center</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Terms</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">2025 Studly. All rights reserved.</p>
            <p className="text-gray-400 text-sm">Made for IB, A-Level and GCSE students</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
