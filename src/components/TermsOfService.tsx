import React from 'react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

const TermsOfService: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using Measure.app, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>Measure.app is a web-based application that allows users to measure and annotate images and documents. We reserve the right to modify or discontinue the service at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <p>You retain all rights to any content you upload to Measure.app. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Prohibited Uses</h2>
            <p>You may not use Measure.app for any illegal or unauthorized purpose. You must not transmit any worms, viruses, or any code of a destructive nature.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p>The Measure.app service and its original content, features, and functionality are owned by Measure.app and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
            <p>We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>In no event shall Measure.app, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of Sweden, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. GDPR Compliance</h2>
            <p>We are committed to complying with the General Data Protection Regulation (GDPR). We process personal data only for specified and lawful purposes and implement appropriate technical and organizational measures to protect personal data against unauthorized or unlawful processing and accidental loss, destruction, or damage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. User Rights</h2>
            <p>As a user of Measure.app, you have rights regarding your personal data under GDPR including:</p>
            <ul className="list-disc ml-6">
              <li>The right to access your personal data.</li>
              <li>The right to rectify inaccurate personal data.</li>
              <li>The right to erase personal data ("right to be forgotten").</li>
              <li>The right to restrict processing of your personal data.</li>
              <li>The right to data portability.</li>
              <li>The right to object to processing based on legitimate interests.</li>
            </ul> 
            <p>You can exercise these rights by contacting us as described in the "Contact Us" section below.</p> 
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>
            <p>Any disputes arising out of or related to these Terms shall be resolved through binding arbitration in accordance with the rules of the Swedish Arbitration Association. The arbitration shall take place in Sweden.</p> 
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at hi at measure.app.</p>
          </section>

        </motion.div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 Measure.app. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TermsOfService;