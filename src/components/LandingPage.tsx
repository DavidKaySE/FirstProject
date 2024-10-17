import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Ruler, Maximize, FileImage, Zap, Star, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.8, once: true }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.5
    }
  }
}

const LandingPage: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  const scrollToSection = (sectionId: string) => (event: React.MouseEvent) => {
    event.preventDefault()
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "How accurate are the measurements?",
      answer: "Our app provides highly accurate measurements, typically within 1% of actual dimensions when using calibrated images or PDFs."
    },
    {
      question: "Can I use the app on my mobile device?",
      answer: "Yes, Measure.app is available on both iOS and Android devices, as well as through web browsers on desktop computers."
    },
    {
      question: "What file types are supported?",
      answer: "We support a wide range of image formats (JPEG, PNG, TIFF) and PDF files. You can also import files directly from your device's camera."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption to protect your data, and we never share your information with third parties."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <header className="px-4 lg:px-6 h-14 flex items-center backdrop-blur-md bg-white/30 fixed w-full z-50">
        <a className="flex items-center justify-center" href="#">
          <Ruler className="h-6 w-6 mr-2 text-rose-500" />
          <span className="font-bold text-rose-500">Measure.app</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:text-rose-500 transition-colors" href="#features" onClick={scrollToSection('#features')}>
            Features
          </a>
          <a className="text-sm font-medium hover:text-rose-500 transition-colors" href="#how-it-works" onClick={scrollToSection('#how-it-works')}>
            How It Works
          </a>
          <a className="text-sm font-medium hover:text-rose-500 transition-colors" href="#reviews" onClick={scrollToSection('#reviews')}>
            Reviews
          </a>
          <a className="text-sm font-medium hover:text-rose-500 transition-colors" href="#pricing" onClick={scrollToSection('#pricing')}>
            Pricing
          </a>
          <a className="text-sm font-medium hover:text-rose-500 transition-colors" href="#faq" onClick={scrollToSection('#faq')}>
            FAQ
          </a>
        </nav>
      </header>
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="flex flex-col items-center space-y-4 text-center"
              >
                <motion.div variants={fadeIn} className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none  bg-clip-text text-transparent bg-gradient-to-r pb-1 from-rose-500 to-purple-600">
                    Measure Anything, Anywhere
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl lg:text-2xl">
                    Instantly measure distances and areas on images and PDFs with our suuper-intuitive app.
                  </p>
                </motion.div>
                <motion.div variants={fadeIn} className="space-x-4">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">Get Started</Button>
                  <Button size="lg" variant="outline" className="text-rose-500 border-rose-500 hover:bg-rose-50 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>Learn More</Button>
                </motion.div>
              </motion.div>
            </div>
          </section>
          <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-rose-500"
              >
                Powerful Features
              </motion.h2>
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={stagger}
                className="grid gap-10 sm:grid-cols-2 md:grid-cols-3"
              >
                <motion.div variants={fadeIn} className="flex flex-col items-center space-y-3 text-center p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Maximize className="h-12 w-12 text-rose-500" />
                  <h3 className="text-xl font-bold text-gray-800">Precise Measurements</h3>
                  <p className="text-gray-500">Get accurate measurements of distances and areas with ease.</p>
                </motion.div>
                <motion.div variants={fadeIn} className="flex flex-col items-center space-y-3 text-center p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <FileImage className="h-12 w-12 text-rose-500" />
                  <h3 className="text-xl font-bold text-gray-800">Image & PDF Support</h3>
                  <p className="text-gray-500">Works seamlessly with both image files and PDF documents.</p>
                </motion.div>
                <motion.div variants={fadeIn} className="flex flex-col items-center space-y-3 text-center p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Zap className="h-12 w-12 text-rose-500" />
                  <h3 className="text-xl font-bold text-gray-800">Instant Results</h3>
                  <p className="text-gray-500">Get measurements in real-time as you interact with your files.</p>
                </motion.div>
              </motion.div>
            </div>
          </section>
          <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
            <div className="container px-4 md:px-6 w-full">
              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-rose-500"
              >
                How It Works
              </motion.h2>
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={stagger}
                className="flex flex-col md:flex-row justify-center items-start gap-8"
              >
                {[
                  { step: 1, title: "Upload", description: "Upload your image or PDF file to our secure platform." },
                  { step: 2, title: "Measure", description: "Use our intuitive tools to measure distances and areas." },
                  { step: 3, title: "Analyze", description: "Get instant results and export your measurements." }
                ].map((item, index) => (
                  <motion.div key={index} variants={fadeIn} className="flex flex-col items-center text-center max-w-xs">
                    <div className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-500">{item.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section id="reviews" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-rose-500"
              >
                What Our Users Say
              </motion.h2>
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {[
                  {
                    name: "Alex Johnson",
                    role: "Architect",
                    comment: "Measure.app has revolutionized how I work with blueprints. It's incredibly accurate and saves me hours on each project."
                  },
                  {
                    name: "Sarah Lee",
                    role: "Interior Designer",
                    comment: "The ability to measure directly on photos has been a game-changer for my design process. Highly recommended!"
                  },
                  {
                    name: "Michael Brown",
                    role: "Construction Manager",
                    comment: "This app has significantly reduced errors in our measurements. It's now an essential tool for our entire team."
                  }
                ].map((review, index) => (
                  <motion.div key={index} variants={fadeIn} className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">"{review.comment}"</p>
                    <div className="font-semibold text-gray-800">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.role}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
          <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-rose-500"
              >
                Simple, Transparent Pricing
              </motion.h2>
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="grid gap-8 md:grid-cols-3"
              >
                {[
                  { title: "Free", price: "$0", features: ["Basic measurements", "Up to 5 projects", "Email support"], cta: "Get Started", highlight: true },
                  { title: "Pro", price: "Coming Soon", features: ["Advanced measurements", "Unlimited projects", "Priority support"], cta: "Join Waitlist" },
                  { title: "Enterprise", price: "Custom", features: ["Custom solutions", "API access", "Dedicated support"], cta: "Contact Sales" }
                ].map((plan, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    className={`flex flex-col p-6 bg-white rounded-xl shadow-xl ${plan.highlight ? 'border-2 border-rose-500 scale-105' : ''}`}
                    whileHover={{ scale: plan.highlight ? 1.05 : 1.02 }}
                  >
                    <h3 className="text-2xl font-bold text-center mb-4">{plan.title}</h3>
                    <p className="text-center text-3xl font-bold text-gray-800 mb-6">{plan.price}</p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="text-green-500 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className={`mt-auto ${plan.highlight ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                      {plan.cta}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
          <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-rose-500"
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="max-w-3xl mx-auto"
              >
                {faqs.map((faq, index) => (
                  
                  <motion.div key={index} variants={fadeIn} className="mb-4">
                    <button
                      className="flex justify-between items-center w-full text-left p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="font-semibold text-gray-800">{faq.question}</span>
                      {openFAQ === index ? <ChevronUp className="text-rose-500" /> : <ChevronDown className="text-rose-500" />}
                    </button>
                    {openFAQ === index && (
                      <div className="mt-2 p-4 bg-rose-50 rounded-lg">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-rose-500 to-purple-600">
            <div className="container px-4 md:px-6">
              <motion.div
                initial="initial"
                whileInView="animate"
                variants={stagger}
                className="flex flex-col items-center space-y-4 text-center"
              >
                <motion.div variants={fadeIn} className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                    Ready to Start Measuring?
                  </h2>
                  <p className="mx-auto max-w-[600px] text-rose-100 md:text-xl">
                    Join thousands of professionals who trust Measure.app for accurate measurements.
                  </p>
                </motion.div>
                <motion.div variants={fadeIn} className="w-full max-w-md space-y-2">
                  <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input className="flex-grow bg-white" placeholder="Enter your email" type="email" />
                    <Button type="submit" className="bg-white text-rose-500 hover:bg-rose-50">Get Started</Button>
                  </form>
                  <p className="text-xs text-rose-100">
                    Start your free trial. No credit card required.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 Measure.app. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}

export default LandingPage
