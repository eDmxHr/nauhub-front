"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 lg:top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none space-y-6">
          <div className="space-y-4">
            <section>
              <h2 className="text-xl font-semibold mb-3">Last Updated: {new Date().toLocaleDateString()}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This Privacy Policy describes how Nauhub ("we", "our", or "us") collects, uses, and shares your personal information when you use our streaming service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Account information (phone number, name, profile data)</li>
                <li>Watch history and viewing preferences</li>
                <li>Device information and usage data</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>To provide and improve our streaming service</li>
                <li>To personalize your viewing experience</li>
                <li>To process payments and manage subscriptions</li>
                <li>To communicate with you about your account and our services</li>
                <li>To ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Data Security</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Your Rights</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account</li>
                <li>Opt-out of certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us through the Help Center or your account settings.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
