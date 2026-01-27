// components/messages/ViewMessageDialog.tsx - Updated
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Reply, Calendar, Mail, User, FileWarning, MapPin, Package, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ViewMessageDialogProps {
  message: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReply: () => void;
}

export default function ViewMessageDialog({
  message,
  open,
  onOpenChange,
  onReply,
}: ViewMessageDialogProps) {
  const [reportDetails, setReportDetails] = useState<any>(null);

  useEffect(() => {
    if (message?.relatedReport) {
      fetchReportDetails(message.relatedReport);
    }
  }, [message]);

  const fetchReportDetails = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      const data = await response.json();
      if (data.success) {
        setReportDetails(data.report);
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {message.subject}
              {message.report && (
                <FileWarning className="h-5 w-5 text-orange-500" />
              )}
            </DialogTitle>
            {message.report && (
              <Link href={`/dashboard/reports/${message.report._id}`}>
                <Button size="sm" variant="outline">
                  View Full Report
                </Button>
              </Link>
            )}
          </div>
          <DialogDescription>
            Message details {message.report && 'with counterfeit report'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Header */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  From
                </div>
                <div>
                  <div className="font-medium">{message.senderName}</div>
                  <div className="text-sm text-gray-500">{message.senderEmail || 'No email provided'}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  To
                </div>
                <div>
                  <div className="font-medium">{message.receiverName || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{message.receiverEmail}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date
                </div>
                <div className="text-sm">{formatDate(message.createdAt)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="text-sm">
                  {message.status === 'read' ? 'Read' : 
                   message.status === 'delivered' ? 'Delivered' : 
                   message.status === 'failed' ? 'Failed to send' : 'Sent'}
                </div>
              </div>
            </div>
          </div>

          {/* Report Details (if available) */}
          {reportDetails && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold">Counterfeit Report Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Product Name
                    </div>
                    <div className="font-medium">{reportDetails.productName}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Report Status</div>
                    <Badge variant={
                      reportDetails.status === 'resolved' ? 'default' :
                      reportDetails.status === 'investigating' ? 'secondary' :
                      reportDetails.status === 'dismissed' ? 'outline' : 'destructive'
                    }>
                      {reportDetails.status.charAt(0).toUpperCase() + reportDetails.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Purchase Location
                    </div>
                    <div>{reportDetails.purchaseLocation}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Priority</div>
                    <Badge className={getPriorityColor(reportDetails.priority)}>
                      {reportDetails.priority.charAt(0).toUpperCase() + reportDetails.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {reportDetails.additionalInfo && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">Additional Information</div>
                    <div className="text-sm bg-gray-50 p-3 rounded">{reportDetails.additionalInfo}</div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Message Content */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-500">Message Content</div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                {message.content}
              </div>
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {message.senderRole !== 'admin' && (
              <Button onClick={onReply}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}