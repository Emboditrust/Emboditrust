'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  Mail,
  Send,
  Inbox,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Reply,
  Filter,
  FileWarning,
} from 'lucide-react';
import SendMessageDialog from '@/components/messages/SendMessageDialog';
import ViewMessageDialog from '@/components/messages/ViewMessageDialog';

interface Message {
  _id: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'admin' | 'user' | 'system';
  receiverEmail: string;
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  createdAt: string;
  report?: {
    productName: string;
  };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    received: 0,
    reports: 0,
    unread: 0,
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        filter,
        ...(search && { search }),
      });

      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.data.messages);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.pages);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, filter, search]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'read':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" /> Read</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Sent</Badge>;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <main className="min-h-screen bg-[#e8ebf0] bg-texture text-[#0b1c2e] transition-colors duration-300 dark:bg-[#333333] dark:text-[#f3f4f6] [font-family:Urbanist,Outfit,Montserrat,ui-sans-serif]">
      <style>{`
        .bg-texture {
          background-image: radial-gradient(circle, rgba(71,85,105,0.2) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-texture {
          background-image: radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="px-4 pb-2 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto w-full max-w-7xl rounded-xl border border-[#d7dde6] bg-white/95 px-4 py-4 shadow-md backdrop-blur transition-colors duration-300 dark:border-[#5a5a5a] dark:bg-[#3a3a3a]/95 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Workspace</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Messages</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Communications and counterfeit reports</p>
            </div>
            <Button
              onClick={() => setShowSendDialog(true)}
              className="bg-[#032434] text-white hover:bg-[#053049] dark:bg-[#5d5d5d] dark:hover:bg-[#6a6a6a]"
            >
              <Send className="mr-2 h-4 w-4" /> Send Message
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">

      {/* Stats – scrollable on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[
          { label: 'Total', value: stats.total, icon: Mail },
          { label: 'Sent', value: stats.sent, icon: Send },
          { label: 'Received', value: stats.received, icon: Inbox },
          { label: 'Reports', value: stats.reports, icon: FileWarning },
          { label: 'Unread', value: stats.unread, icon: AlertTriangle },
        ].map((s, i) => (
          <Card key={i} className="min-w-[160px] rounded-2xl border border-[#cfd7e3] bg-white/95 shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                </div>
                <s.icon className="h-6 w-6 text-slate-400 dark:text-slate-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border border-[#cfd7e3] bg-white/95 shadow-sm transition-colors dark:border-[#5b5b5b] dark:bg-[#3d3d3d]/95">
        <CardHeader className="space-y-4">
          <CardTitle className="text-slate-900 dark:text-slate-100">Messages</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#c8d1dd] bg-white/95 dark:border-[#595959] dark:bg-[#323232]"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full border-[#c8d1dd] bg-white/95 dark:border-[#595959] dark:bg-[#323232] sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* MOBILE VIEW */}
          <div className="space-y-4 sm:hidden">
            {messages.map((m) => (
              <Card key={m._id} className="rounded-2xl border border-[#d3dae5] bg-white/95 shadow-sm transition-colors hover:bg-gray-50 dark:border-[#5a5a5a] dark:bg-[#3b3b3b]/95 dark:hover:bg-[#454545]">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{m.subject}</p>
                    {statusBadge(m.status)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {m.senderRole === 'admin' ? `To ${m.receiverEmail}` : `From ${m.senderEmail}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(m.createdAt)}</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedMessage(m)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    {m.senderRole !== 'admin' && (
                      <Button size="sm" variant="ghost" onClick={() => setReplyingTo(m)}>
                        <Reply className="h-4 w-4 mr-1" /> Reply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => (
                  <TableRow key={m._id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-[#454545]">
                    <TableCell>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{m.subject}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {m.senderRole === 'admin'
                          ? `To ${m.receiverEmail}`
                          : `From ${m.senderEmail}`}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(m.createdAt)}</TableCell>
                    <TableCell>{statusBadge(m.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedMessage(m)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {m.senderRole !== 'admin' && (
                        <Button size="icon" variant="ghost" onClick={() => setReplyingTo(m)}>
                          <Reply className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      </div>

      <SendMessageDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        replyTo={replyingTo}
        onSuccess={fetchMessages}
      />

      {selectedMessage && (
        <ViewMessageDialog
          message={selectedMessage}
          open={!!selectedMessage}
          onOpenChange={() => setSelectedMessage(null)}
          onReply={() => {
            setReplyingTo(selectedMessage);
            setSelectedMessage(null);
            setShowSendDialog(true);
          }}
        />
      )}
    </main>
  );
}
