"use client";

import { ArrowLeft, HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const faqCategories = [
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking 'Sign In' and then 'Sign Up'. Enter your phone number, verify with OTP, and provide your name to complete registration."
      },
      {
        question: "How do I create a profile?",
        answer: "After signing in, you'll be prompted to create a profile. You can also create additional profiles from the Profile page by clicking 'Manage Profiles'."
      },
      {
        question: "Can I have multiple profiles?",
        answer: "Yes! You can create multiple profiles for different family members. Each profile can have its own watch history and preferences."
      }
    ]
  },
  {
    title: "Watching Content",
    items: [
      {
        question: "How do I watch a movie or show?",
        answer: "Browse our library, click on any title to view details, and then click 'Play' to start watching. You must be signed in to watch content."
      },
      {
        question: "Can I download content for offline viewing?",
        answer: "Currently, offline downloads are not available. All content must be streamed with an internet connection."
      },
      {
        question: "How do I resume watching?",
        answer: "Your watch progress is automatically saved. You can resume from where you left off by clicking on the title in 'Continue Watching' or from the detail page."
      }
    ]
  },
  {
    title: "Account & Subscription",
    items: [
      {
        question: "How do I manage my subscription?",
        answer: "Go to Profile > Manage Subscription to view your current plan, upgrade, or manage billing."
      },
      {
        question: "How do I update my payment method?",
        answer: "Navigate to Profile > Payment History to manage your payment methods and view transaction history."
      },
      {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel your subscription at any time from the Manage Subscription page. Your access will continue until the end of your current billing period."
      }
    ]
  },
  {
    title: "Technical Support",
    items: [
      {
        question: "The video won't play. What should I do?",
        answer: "Try refreshing the page, checking your internet connection, or clearing your browser cache. If the issue persists, contact support."
      },
      {
        question: "I'm having trouble signing in.",
        answer: "Make sure you're using the correct phone number. If you're not receiving the OTP, check that your phone number is correct and try again. Contact support if issues continue."
      },
      {
        question: "How do I change my profile PIN?",
        answer: "Go to Profile > Manage Profiles, select the profile you want to edit, and update the Profile Lock settings."
      }
    ]
  }
];

export default function HelpCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (question: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedItems(newExpanded);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

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
          <h1 className="text-xl lg:text-2xl font-bold">Help Center</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <HelpCircle className="size-5 text-brand" />
                  {category.title}
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <button
                      onClick={() => toggleItem(item.question)}
                      className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium pr-4">{item.question}</h3>
                        <span className="text-muted-foreground shrink-0">
                          {expandedItems.has(item.question) ? "−" : "+"}
                        </span>
                      </div>
                    </button>
                    {expandedItems.has(item.question) && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-brand/10 border border-brand/30 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Still need help?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <button className="px-6 py-2 bg-brand hover:bg-brand/90 rounded-lg font-medium transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
