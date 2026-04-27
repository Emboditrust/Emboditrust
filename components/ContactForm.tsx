// components/ContactForm.tsx - Updated with message form
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle, Mail, User, Building, Phone, MessageSquare, MapPin, Clock3, ShieldCheck, Headset } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setSubmitted(true);
        setReferenceId(data.data.referenceId);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="contact" className="mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#cad4e2] bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-cyan-50">
            <CheckCircle className="h-8 w-8 text-cyan-700" />
          </div>

          <h3 className="text-3xl font-black text-[#0b1c2e]">Message Sent Successfully</h3>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Thank you for contacting EmbodiTrust. We have received your message and our support team will get back to you shortly.
          </p>

          {referenceId && (
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[#d6deea] bg-[#f8fbff] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reference ID</p>
              <p className="mt-1 font-mono text-lg font-bold text-[#032434]">{referenceId}</p>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="border-[#c9d4e3] text-[#032434] hover:bg-slate-50"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="mx-auto w-full max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
      <div className="text-center">
        <div className="section-intro-pill mx-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400 bg-cyan-50 px-[4rem] py-[1rem] text-[16px] font-semibold text-cyan-700" style={{ animationDelay: '0.08s, 0.85s' }}>
          <Mail className="h-6 w-6" />
          Contact
        </div>
        <h3 className="mt-4 text-4xl font-black md:text-5xl animate-fade-in-up" style={{ animationDelay: '0.16s' }}>
          Talk To The EmbodiTrust Team<span className="text-rose-500">.</span>
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600 animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
          Have questions about verification, onboarding, or product trust operations? Send a message and we will reply within 24 hours.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#cad4e2] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-cyan-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h4 className="text-2xl font-black text-[#0b1c2e]">Send us a Message</h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-slate-700">
                  <User className="h-4 w-4" />
                  Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-[#cfd8e5] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-[#cfd8e5] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2 text-slate-700">
                  <Building className="h-4 w-4" />
                  Company (Optional)
                </Label>
                <Input
                  id="company"
                  placeholder="Your company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="border-[#cfd8e5] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4" />
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-[#cfd8e5] bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-700">Subject *</Label>
              <Input
                id="subject"
                placeholder="Message subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="border-[#cfd8e5] bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-700">Message *</Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="resize-none border-[#cfd8e5] bg-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#032434] py-6 text-lg text-white hover:bg-[#04324a]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </>
              )}
            </Button>

            <p className="text-center text-sm text-slate-500">We will respond within 24 hours.</p>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[#cad4e2] bg-white p-6 shadow-sm md:p-8">
            <h4 className="text-2xl font-black text-[#0b1c2e]">Contact Information</h4>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-cyan-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#0b1c2e]">Email</p>
                  <p className="text-slate-600">support@emboditrust.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-cyan-700">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#0b1c2e]">Support Hours</p>
                  <p className="text-slate-600">Monday - Friday, 9 AM - 6 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-cyan-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#0b1c2e]">Response Time</p>
                  <p className="text-slate-600">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </section>
  );
}
