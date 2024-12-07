// src/app/page.tsx
import Link from "next/link";
import { Clock, Sunrise, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sunrise,
    title: "Transform Your Life",
    description: "Join the 5AM Club to develop early rising habits, enhance life quality, and achieve personal breakthroughs."
  },
  {
    icon: Users,
    title: "Like-minded Community",
    description: "Connect with early risers worldwide, inspire each other, and grow together."
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set personal goals, track your wake-up times, and build lasting early rising habits."
  },
  {
    icon: Clock,
    title: "Data Insights",
    description: "Visualize your progress with intuitive statistics to understand and improve your daily routine."
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto pt-20 pb-16">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Welcome to the <span className="text-sky-600">5AM Club</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join an exclusive community of high achievers who start their day at 5AM.
            Transform your mornings, transform your life.
          </p>
          <Link href="/auth">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-200 transform hover:scale-105"
            >
              Start Your Journey
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 py-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-sky-100 p-3 rounded-lg">
                  <feature.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center pb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Morning Routine?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of successful individuals who have already discovered 
            the power of early rising. Your journey to excellence begins at 5AM.
          </p>
          <Link href="/auth">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Join Now
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}