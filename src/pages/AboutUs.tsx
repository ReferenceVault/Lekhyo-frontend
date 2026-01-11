import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Shield, Users, Sparkles } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
            About <span className="text-[#B5573E]">Lekhyo</span>
          </h1>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto font-light">
            Curated spaces with stories. NGO guest houses reimagined.
          </p>
        </div>

        {/* Story section */}
        <section className="mb-16">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-light text-[#2C2C2C] mb-6">Our Story</h2>
            <div className="space-y-4 text-[#2C2C2C]/80 font-light leading-relaxed">
              <p>
                Lekhyo bridges the gap between mission-driven organizations and conscious travelers. 
                We transform NGO guest houses across Bangladesh into welcoming accommodations that 
                tell powerful stories of social change.
              </p>
              <p>
                Every stay supports the organizations that operate these spaces, creating a sustainable 
                revenue stream for development programs while offering travelers authentic, meaningful 
                experiences.
              </p>
              <p>
                Founded on the principle that travel can be both transformative and responsible, Lekhyo 
                curates spaces where every room, every meal, and every interaction contributes to a 
                larger mission of positive change.
              </p>
            </div>
          </div>
        </section>

        {/* Values section */}
        <section className="mb-16">
          <h2 className="text-2xl font-light text-[#2C2C2C] mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#F5F0E8]/50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#B5573E]/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-[#B5573E]" />
              </div>
              <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">Mission-First</h3>
              <p className="text-sm text-[#2C2C2C]/70 font-light">
                Every booking prioritizes the organization's mission and impact goals.
              </p>
            </div>
            <div className="text-center p-6 bg-[#F5F0E8]/50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#8B9D77]/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-[#8B9D77]" />
              </div>
              <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">Safety & Trust</h3>
              <p className="text-sm text-[#2C2C2C]/70 font-light">
                Women-safe accommodations and transparent safety standards for all guests.
              </p>
            </div>
            <div className="text-center p-6 bg-[#F5F0E8]/50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#B5573E]/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#B5573E]" />
              </div>
              <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">Community</h3>
              <p className="text-sm text-[#2C2C2C]/70 font-light">
                Building connections between travelers and local communities.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16 bg-[#F5F0E8]/30 rounded-2xl p-8">
          <h2 className="text-2xl font-light text-[#2C2C2C] mb-6 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B5573E] text-white flex items-center justify-center font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-[#2C2C2C] mb-1">For NGOs</h3>
                <p className="text-sm text-[#2C2C2C]/70 font-light">
                  List your guest house and transform unused space into a mission-aligned profit center.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B5573E] text-white flex items-center justify-center font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium text-[#2C2C2C] mb-1">For Travelers</h3>
                <p className="text-sm text-[#2C2C2C]/70 font-light">
                  Discover unique accommodations with stories, book directly, and support meaningful causes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#B5573E] text-white flex items-center justify-center font-medium">
                3
              </div>
              <div>
                <h3 className="font-medium text-[#2C2C2C] mb-1">Impact</h3>
                <p className="text-sm text-[#2C2C2C]/70 font-light">
                  Revenue flows back to development programs, creating sustainable funding for social change.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9D77]/10 rounded-full text-[#8B9D77] text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Join our mission
          </div>
          <div className="flex gap-4 justify-center">
            <Link to={createPageUrl('ContactUs')}>
              <Button className="bg-[#B5573E] hover:bg-[#9a4935]">
                Get In Touch
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button variant="outline">
                Explore Spaces
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
