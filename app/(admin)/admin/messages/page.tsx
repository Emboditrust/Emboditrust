// app/dashboard/messages/page.tsx - Updated
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Clock,
  User,
  FileWarning,
  BarChart,
} from 'lucide-react';
import SendMessageDialog from '@/components/messages/SendMessageDialog';
import ViewMessageDialog from '@/components/messages/ViewMessageDialog';

interface Message {
  _id: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'admin' | 'user' | 'system';
  receiverEmail: string;
  receiverName?: string;
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
  createdAt: string;
  readAt?: string;
  replyTo?: string;
  relatedReport?: string;
  report?: {
    _id: string;
    productName: string;
    purchaseLocation: string;
    status: string;
    priority: string;
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
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        filter,
        ...(search && { search }),
      }).toString();

      const response = await fetch(`/api/messages?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, filter, search]);

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowSendDialog(true);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read if not already
    if (message.status !== 'read' && message.senderRole !== 'admin') {
      fetch(`/api/messages/${message._id}/read`, { method: 'PUT' });
    }
  };

  const getStatusBadge = (status: string, senderRole: string) => {
    if (senderRole !== 'admin' && status === 'sent') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" /> Unread</Badge>;
    }
    
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'read':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Eye className="h-3 w-3 mr-1" /> Read</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">Sent</Badge>;
    }
  };

  const getSenderIcon = (senderRole: string, hasReport: boolean) => {
    if (hasReport) {
      return <FileWarning className="h-4 w-4 text-orange-500" />;
    }
    return senderRole === 'admin' ? <Send className="h-4 w-4 text-blue-500" /> : <Inbox className="h-4 w-4 text-green-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Manage all communications including counterfeit reports
            </p>
          </div>
          <Button onClick={() => setShowSendDialog(true)} className="bg-cyan-500 hover:bg-cyan-600">
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Messages</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Sent</p>
                  <p className="text-2xl font-bold">{stats.sent}</p>
                </div>
                <Send className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Received</p>
                  <p className="text-2xl font-bold">{stats.received}</p>
                </div>
                <Inbox className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Reports</p>
                  <p className="text-2xl font-bold">{stats.reports}</p>
                </div>
                <FileWarning className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unread</p>
                  <p className="text-2xl font-bold">{stats.unread}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Messages</CardTitle>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="sent">Sent Messages</SelectItem>
                  <SelectItem value="received">Received Messages</SelectItem>
                  <SelectItem value="reports">Counterfeit Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No messages found</p>
              <p className="text-sm mt-2">Messages from counterfeit reports will appear here</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Subject / From</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow 
                        key={message._id}
                        className={
                          message.senderRole !== 'admin' && message.status !== 'read'
                            ? 'bg-red-50 hover:bg-red-100'
                            : ''
                        }
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            {getSenderIcon(message.senderRole, !!message.report)}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {message.subject}
                                {message.report && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                                    Report
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {message.senderRole === 'admin' 
                                  ? `To: ${message.receiverEmail}`
                                  : `From: ${message.senderEmail || 'Anonymous'}`
                                }
                              </div>
                              {message.report && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Product: {message.report.productName}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            message.senderRole === 'admin' ? 'default' :
                            message.report ? 'secondary' : 'outline'
                          }>
                            {message.senderRole === 'admin' ? 'Sent' :
                             message.report ? 'Report' : 'Incoming'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(message.createdAt)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(message.status, message.senderRole)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {message.senderRole !== 'admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReply(message)}
                              >
                                <Reply className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={page === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
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
          onOpenChange={(open) => !open && setSelectedMessage(null)}
          onReply={() => {
            setSelectedMessage(null);
            setReplyingTo(selectedMessage);
            setShowSendDialog(true);
          }}
        />
      )}
    </div>
  );
}