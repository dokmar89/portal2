export function DocsContent() {
  return (
    <div className="flex-1">
      <section id="getting-started">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <p>Welcome to PassProve documentation. Follow these steps to get started:</p>
        <ol className="list-decimal list-inside mt-2">
          <li>Sign up for a PassProve account</li>
          <li>Obtain your API key from the dashboard</li>
          <li>Choose your preferred integration method</li>
          <li>Follow the integration guide for your chosen method</li>
          <li>Test your integration thoroughly</li>
        </ol>
      </section>

      <section id="api-reference" className="mt-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        <p>Our RESTful API allows you to integrate PassProve into your application seamlessly.</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Endpoints</h3>
        <ul className="list-disc list-inside">
          <li>/api/verify - Initiate a verification request</li>
          <li>/api/status - Check the status of a verification</li>
          <li>/api/webhook - Set up webhooks for real-time updates</li>
        </ul>
      </section>

      <section id="integration-guide" className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Integration Guide</h2>
        <p>Follow these steps to integrate PassProve into your application:</p>
        <ol className="list-decimal list-inside mt-2">
          <li>Include the PassProve SDK in your project</li>
          <li>Initialize the SDK with your API key</li>
          <li>Implement the verification flow in your user interface</li>
          <li>Handle the verification results and update your application state</li>
        </ol>
      </section>

      <section id="sdk-documentation" className="mt-8">
        <h2 className="text-2xl font-bold mb-4">SDK Documentation</h2>
        <p>Our SDK provides easy-to-use methods for integrating PassProve:</p>
        <ul className="list-disc list-inside mt-2">
          <li>initializePassProve(apiKey: string): Initialize the SDK</li>
          <li>startVerification(userId: string): Start a new verification process</li>
          <li>getVerificationStatus(verificationId: string): Check the status of a verification</li>
        </ul>
      </section>

      <section id="faqs" className="mt-8">
        <h2 className="text-2xl font-bold mb-4">FAQs</h2>
        <ul className="space-y-4">
          <li>
            <h3 className="font-semibold">Q: How long does a typical verification take?</h3>
            <p>A: Most verifications are completed within 30 seconds to 2 minutes.</p>
          </li>
          <li>
            <h3 className="font-semibold">Q: What types of identification does PassProve support?</h3>
            <p>A: PassProve supports various government-issued IDs, including passports, driver's licenses, and national ID cards.</p>
          </li>
          <li>
            <h3 className="font-semibold">Q: Is PassProve GDPR compliant?</h3>
            <p>A: Yes, PassProve is fully GDPR compliant and takes data privacy very seriously.</p>
          </li>
        </ul>
      </section>
    </div>
  )
}

