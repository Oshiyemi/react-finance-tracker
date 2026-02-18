"use client";

import {
  Wallet,
  BarChart3,
  Shield,
  Smartphone,
  Code2,
  Heart,
} from "lucide-react";

// About page - tells users what the app is about and how it works
const features = [
  {
    icon: Wallet,
    title: "Track Income & Expenses",
    description:
      "Easily log your financial transactions with categories, dates, and amounts.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "See where your money goes with intuitive pie charts broken down by category.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "All data is stored locally in your browser. Nothing is sent to any server.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "Fully responsive design that works beautifully on any screen size.",
  },
  {
    icon: Code2,
    title: "Open & Simple",
    description:
      "Built with React, Tailwind CSS, and clean code that is easy to understand and extend.",
  },
  {
    icon: Heart,
    title: "Free to Use",
    description:
      "No sign-ups, no ads, no subscriptions. Just a simple tool that helps you manage money.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground text-balance">
          About FinTrack
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed text-pretty">
          FinTrack is a simple, beautiful personal finance tracker built to help
          you understand and manage your spending habits. No complexity, no
          overwhelming features, just a clean way to see where your money goes.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tech Stack */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm text-center">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Built With
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["React", "Next.js", "Tailwind CSS", "Recharts", "Lucide Icons"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
