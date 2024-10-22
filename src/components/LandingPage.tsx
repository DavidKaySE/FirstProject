import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Ruler, Maximize, FileImage, Zap, Star, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import JoinWaitlistDialog from '@/components/JoinWaitlistDialog'
import { supabase } from '@/lib/supabase'

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
  const navigate = useNavigate()

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
      question: "What file types are supported?",
      answer: "We support a wide range of image formats (JPEG, PNG, etc.) and PDF files. Just drag an drop while in the gallery and you're good to go."
    },
      {
      question: "Can i measure both distances and areas?",
      answer: "Yes, you can measure both distances and areas. Just keep placing points and the app will calculate it for you."
    },
    {
      question: "Can I set the scale?",
      answer: "Yes, you can set the scale of the measurements. You can do this with the 'Set scale' tool - available for both distance and area."
    },
    {
      question: "Are both imperial and metric units supported?",
      answer: "Yes, you can choose between imperial and metric units. Just use the 'Set scale' tool - available for both distance and area. By default, you are measuring in pixels."
    },    {
      question: "Is my data secure?",
      answer: "The app is still in beta (and free!), so data is not being stored right now. All measurements are being calculated in your browser only. We recommend that you save your files to your computer so you can access them later."
    }
  ]

  const goToGallery = () => {
    navigate('/gallery')
  }

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (error) {
      setMessage('An error occurred. Please try again later.');
    } else {
      setMessage('Check your email for the login link!');
    }
  };

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
                    Instantly measure distances and areas on images, blueprints, and PDFs with our suuper-intuitive app.
                  </p>
                </motion.div>
                <motion.div variants={fadeIn} className="space-x-4">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={goToGallery}>Get Started</Button>
                  <Button size="lg" variant="outline" className="text-rose-500 border-rose-500 hover:bg-rose-50 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>Learn More</Button>
                </motion.div>
              </motion.div>
            </div>
          </section>
          <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-rose-500"
              >
                Powerful Features
              </motion.h2>
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={{
                  initial: {},
                  animate: {
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
                className="grid gap-10 sm:grid-cols-2 md:grid-cols-3"
              >
                {[
                  { icon: Maximize, title: "Precise Measurements", description: "Get accurate measurements of distances and areas with ease." },
                  { icon: FileImage, title: "Image & PDF Support", description: "Works seamlessly with both image files and PDF documents." },
                  { icon: Zap, title: "Instant Results", description: "Get measurements in real-time as you interact with your files." }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    variants={{
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                    className="flex flex-col items-center space-y-3 text-center p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <feature.icon className="h-12 w-12 text-rose-500" />
                    <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-500">{feature.description}</p>
                  </motion.div>
                ))}
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
                  { step: 1, title: "Upload", description: "Upload your image or PDF file to our app." },
                  { step: 2, title: "Measure", description: "Use our intuitive tool to measure distances and areas." },
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
                    name: "Michaela Rossinger",
                    role: "Garden Designer",
                    comment: "This app has helped us significantly during our brainstorming sessions. Quick and easy to get some measurements in place."
                  },
                  {
                    name: "Sarah F.",
                    role: "Interior Designer",
                    comment: "The ability to measure directly on photos has been a game-changer for my design process. As long as I have a reference in the room it's super easy to to get a hang of the different measurements. Highly recommended!"
                  },
                  {
                  name: "Alex Johnson",
                  role: "Architect",
                  comment: "Measure.app is such a breeze when working with blueprints. I've been told the Pro version will have better support for snapping in pdf's, but for now it's still a super useful tool just to get some quick measurements from older scanned documents."
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
                As cheap as it gets - for a limited time!
              </motion.h2>
              <motion.div
                initial="initial"
                animate="animate"
                variants={stagger}
                className="grid gap-8 md:grid-cols-2 px-4 md:px-16 lg:px-32"
              >
                {[
                  { title: "Free", 
                    price: "- for a limited time!", 
                    features: ["Measure distances", "Measure areas", "Set scale", "Export measurements", "Only local files"], 
                    cta: "Get Started", 
                    highlight: true 
                  },
                  { 
                    title: "Pro", 
                    price: "Coming Soon", 
                    features: ["Measure distances", "Measure areas", "Set scale", "Export measurements", "Database storage", "Rename measurements", "Highlight areas", "Export in list format", "...and more!"], 
                    cta: "Join Waitlist",
                    action: <JoinWaitlistDialog />
                  },
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
                    {plan.action || (
                      <Button 
                        className={`mt-auto ${plan.highlight ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        onClick={plan.highlight ? goToGallery : undefined}
                      >
                        {plan.cta}
                      </Button>
                    )}
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
                      <div className="mt-2 p-4 bg-white rounded-lg">
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
                    Join the big team of professionals who trust Measure.app for accurate measurements.
                  </p>
                </motion.div>
                <motion.div variants={fadeIn} className="w-full max-w-md space-y-2">
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input 
                      className="flex-grow bg-white" 
                      placeholder="Enter your email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={isLoading} className="bg-rose-500 hover:bg-rose-600 text-white">
                      {isLoading ? 'Sending...' : 'Get Started'}
                    </Button>
                  </form>
                  {message && (
                    <p className={`mt-2 text-sm text-white p-2 rounded ${
                      message === 'Check your email for the login link!' 
                        ? 'bg-green-600' 
                        : 'bg-rose-600'
                    }`}>
                      {message}
                    </p>
                  )}
                  <p className="text-xs text-rose-100">
                    Try it out for free, only for a limited time! No credit card required.
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
          <a 
            className="text-xs hover:underline underline-offset-4" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/terms-of-service');
            }}
          >
            Terms of Service
          </a>
          <a 
            className="text-xs hover:underline underline-offset-4" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/privacy-policy');
            }}
          >
            Privacy Policy
          </a>
        </nav>
      </footer>
    </div>
  )
}

export default LandingPage
