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
        return <Badge className="bg-blue-100 text-blue-700"><Eye className="h-3 w-3 mr-1" /> Read</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">Sent</Badge>;
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Communications & counterfeit reports
          </p>
        </div>
        <Button onClick={() => setShowSendDialog(true)} className="bg-cyan-500 hover:bg-cyan-600">
          <Send className="h-4 w-4 mr-2" /> Send Message
        </Button>
      </div>

      {/* Stats – scrollable on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[
          { label: 'Total', value: stats.total, icon: Mail },
          { label: 'Sent', value: stats.sent, icon: Send },
          { label: 'Received', value: stats.received, icon: Inbox },
          { label: 'Reports', value: stats.reports, icon: FileWarning },
          { label: 'Unread', value: stats.unread, icon: AlertTriangle },
        ].map((s, i) => (
          <Card key={i} className="min-w-[160px]">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className="h-6 w-6 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Messages</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
              <Card key={m._id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium">{m.subject}</p>
                    {statusBadge(m.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {m.senderRole === 'admin' ? `To ${m.receiverEmail}` : `From ${m.senderEmail}`}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(m.createdAt)}</p>
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
                  <TableRow key={m._id}>
                    <TableCell>
                      <div className="font-medium">{m.subject}</div>
                      <div className="text-sm text-muted-foreground">
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
    </div>
  );
}
