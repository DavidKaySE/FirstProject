import React from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="/">
          <span className="font-bold text-rose-500">Measure.app</span>
        </a>
      </header>
      <main className="flex-1 flex items-center justify-center w-full p-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="w-full max-w-4xl space-y-8 p-8 bg-white rounded-xl shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>At Measure.app, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc ml-6">
              <li><strong>Personal Information:</strong> Name, email address, phone number.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device information.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our service, including timestamps of visits and page views.</li>
            </ul>
            <p>This may include information you provide directly to us when you create an account, upload files, or contact us for support.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, erase, restrict processing, object to processing, and data portability in relation to your personal data.</p>
            <p>You can exercise these rights by contacting us as described in the "Contact Us" section below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <p>Our service may contain links to third-party websites or services that are not owned or controlled by Measure.app. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
            <p>We may use third-party services for analytics and payment processing that may collect information used to identify you.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p>Your information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p>We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your personal data to the extent necessary to comply with our legal obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at hi at measure.app.</p>
          </section>

        </motion.div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 Measure.app. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;