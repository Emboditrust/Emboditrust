// components/messages/SendMessageDialog.tsx - Fixed
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Send, User } from 'lucide-react';
import { toast } from 'sonner';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: any;
  onSuccess?: () => void;
}

export default function SendMessageDialog({
  open,
  onOpenChange,
  replyTo,
  onSuccess,
}: SendMessageDialogProps) {
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    receiverEmail: '',
    subject: '',
    content: '',
  });

  // Fetch admin data from session
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Try to get from session API
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (sessionData.user) {
          setAdmin({
            _id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name,
          });
        } else {
          // Fallback to default admin
          const response = await fetch('/api/admin/default');
          const data = await response.json();
          
          if (data.success) {
            setAdmin(data.admin);
          } else {
            // Ultimate fallback
            setAdmin({
              _id: 'system',
              email: 'support@emboditrust.com',
              name: 'Support Team',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Fallback
        setAdmin({
          _id: 'system',
          email: 'support@emboditrust.com',
          name: 'Support Team',
        });
      }
    };

    fetchAdminData();
  }, []);

  useEffect(() => {
    if (replyTo) {
      setFormData({
        receiverEmail: replyTo.senderEmail,
        subject: `Re: ${replyTo.subject}`,
        content: `\n\n--- Original Message ---\nFrom: ${replyTo.senderName} <${replyTo.senderEmail}>\nDate: ${new Date(replyTo.createdAt).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.content}\n\n`,
      });
    } else {
      setFormData({
        receiverEmail: '',
        subject: '',
        content: '',
      });
    }
  }, [replyTo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admin) {
      toast.error('Admin information not available. Please try again.');
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.receiverEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId: admin._id,
          replyTo: replyTo?._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Message sent successfully');
        onSuccess?.();
        onOpenChange(false);
        setFormData({ receiverEmail: '', subject: '', content: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#d7dde6] bg-white/95 text-[#0b1c2e] sm:max-w-[600px] dark:border-[#5a5a5a] dark:bg-[#3a3a3a]/95 dark:text-[#f3f4f6]">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{replyTo ? 'Reply to Message' : 'Send New Message'}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            {replyTo
              ? `Replying to ${replyTo.senderName} (${replyTo.senderEmail})`
              : 'Send a message to a client or user'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receiverEmail">To (Email)</Label>
              <Input
                id="receiverEmail"
                type="email"
                placeholder="recipient@example.com"
                value={formData.receiverEmail}
                onChange={(e) =>
                  setFormData({ ...formData, receiverEmail: e.target.value })
                }
                required
                disabled={!!replyTo}
                className="border-[#c8d1dd] bg-white/95 dark:border-[#595959] dark:bg-[#323232]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                className="border-[#c8d1dd] bg-white/95 dark:border-[#595959] dark:bg-[#323232]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Type your message here..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                required
                className="resize-none border-[#c8d1dd] bg-white/95 dark:border-[#595959] dark:bg-[#323232]"
              />
            </div>
            
            {admin && (
              <div className="rounded border border-[#d7dde6] bg-slate-50 p-2 text-sm text-slate-600 dark:border-[#5a5a5a] dark:bg-[#2f2f2f] dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>Sending as: <strong>{admin.name}</strong> &lt;{admin.email}&gt;</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-[#c8d1dd] bg-white/95 hover:bg-slate-100 dark:border-[#5b5b5b] dark:bg-[#323232] dark:hover:bg-[#444]"
              onClick={() => {
                onOpenChange(false);
                setFormData({ receiverEmail: '', subject: '', content: '' });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !admin}
              className="bg-[#032434] text-white hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}