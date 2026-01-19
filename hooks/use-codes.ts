"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useCodes() {
  const queryClient = useQueryClient();

  // Generate QR + Scratch Codes
  const generateQRCodes = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`${API_URL}/api/admin/generate/qr-scratch`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This sends cookies
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to generate QR codes");
      }

      return response.json();
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qr-batches"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      toast.success(data.message || `${data.totalGenerated} QR+Scratch codes generated successfully`);

      // CSV Download
      if (data.csvContent) {
        const blob = new Blob([data.csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-scratch-codes_${data.batchId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Fetch QR Code Batches
  const getQRBatches = useQuery({
    queryKey: ["qr-batches"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/qr-batches`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch QR batches");
      }

      return response.json();
    },
    enabled: true,
  });

  // Fetch QR Code Stats
  const getStats = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/stats/qr`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to fetch stats");
      }

      return response.json();
    },
    enabled: true,
    refetchInterval: 30000,
  });

  // Fetch QR Code Activity
  const getActivity = useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/activity/qr`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity");
      }

      return response.json();
    },
    enabled: true,
  });

  return {
    generateQRCodes,
    qrBatches: getQRBatches.data?.batches || [],
    isLoadingBatches: getQRBatches.isLoading,
    stats: getStats.data?.stats || {},
    isLoadingStats: getStats.isLoading,
    activity: getActivity.data?.activity || [],
    isLoadingActivity: getActivity.isLoading,
  };
}