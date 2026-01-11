import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 bg-[#F5F0E8]">
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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-[#2C2C2C] mb-4">
            Contact <span className="text-[#B5573E]">Us</span>
          </h1>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto font-light">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white/80 border-[#2C2C2C]/10">
              <CardHeader>
                <CardTitle className="text-xl font-light text-[#2C2C2C]">Get in Touch</CardTitle>
                <CardDescription className="font-light">
                  We're here to help and answer any questions you might have.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#B5573E]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#B5573E]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2C2C2C] mb-1">Email</h3>
                    <p className="text-sm text-[#2C2C2C]/70 font-light">
                      hello@lekhyo.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#8B9D77]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#8B9D77]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2C2C2C] mb-1">Phone</h3>
                    <p className="text-sm text-[#2C2C2C]/70 font-light">
                      +880 XXXX XXXX
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#B5573E]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#B5573E]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2C2C2C] mb-1">Address</h3>
                    <p className="text-sm text-[#2C2C2C]/70 font-light">
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-[#2C2C2C]/10">
              <CardHeader>
                <CardTitle className="text-xl font-light text-[#2C2C2C]">For NGOs</CardTitle>
                <CardDescription className="font-light">
                  Interested in partnering with us? Learn how to list your guest house.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl('ManagementDashboard')}>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white/80 border-[#2C2C2C]/10">
            <CardHeader>
              <CardTitle className="text-xl font-light text-[#2C2C2C]">Send us a Message</CardTitle>
              <CardDescription className="font-light">
                Fill out the form below and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="bg-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#B5573E] hover:bg-[#9a4935] gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
