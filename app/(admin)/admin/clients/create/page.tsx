"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Building, User, Mail, Phone, MapPin, Shield, FileText, Calendar, Globe, Upload } from "lucide-react";
import { z } from "zod";

// Validation schema matching the API
const clientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactPerson: z.string().min(1, 'Contact person is required').max(100),
  email: z.string().email('Invalid email address').max(100),
  phone: z.string().min(1, 'Phone number is required').max(20),
  address: z.string().min(1, 'Address is required').max(500),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required').max(50),
  brandPrefix: z.string()
    .length(3, 'Brand prefix must be exactly 3 characters')
    .regex(/^[A-Z]+$/, 'Brand prefix must be uppercase letters only'),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50),
  registrationDate: z.string().min(1, 'Registration date is required'),
  contractStartDate: z.string().min(1, 'Contract start date is required'),
  contractEndDate: z.string().min(1, 'Contract end date is required'),
  monthlyLimit: z.number()
    .min(100, 'Minimum monthly limit is 100')
    .max(1000000, 'Maximum monthly limit is 1,000,000'),
  logoUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
}).refine(data => new Date(data.contractEndDate) > new Date(data.contractStartDate), {
  message: "Contract end date must be after start date",
  path: ["contractEndDate"],
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function CreateClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      manufacturerId: '',
      brandPrefix: 'EMB',
      registrationNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyLimit: 10000,
      logoUrl: '',
      website: '',
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      console.log('Submitting form data:', data);
      
      // Prepare the data for API
      const requestData = {
        ...data,
        monthlyLimit: Number(data.monthlyLimit),
        logoUrl: data.logoUrl || '',
        website: data.website || '',
        additionalInfo: data.additionalInfo || '',
      };

      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for NextAuth session
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log('API response:', result);
      
      if (response.ok && result.success) {
        toast.success('Client created successfully', {
          description: `${data.companyName} has been added to the system`
        });
        
        // Redirect to client details page
        router.push(`/admin/clients/${result.client.clientId}`);
        router.refresh(); // Refresh the page to show new client
      } else {
        console.error('API error:', result);
        toast.error(result.message || 'Failed to create client', {
          description: result.details ? JSON.stringify(result.details) : 'Please check your input'
        });
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error('Network error', {
        description: error.message || 'Please check your connection'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandPrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    form.setValue('brandPrefix', value);
  };

  const handleManufacturerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    form.setValue('manufacturerId', value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/clients')}
          className="pl-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mt-4">Add New Client</h1>
        <p className="text-gray-500">
          Register a new pharmaceutical company for QR code generation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Client Registration
          </CardTitle>
          <CardDescription>
            Fill in the details of the pharmaceutical company. All fields are required unless marked optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., EmbodiTrust Pharmaceuticals Ltd." 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Prefix (3 letters) *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="EMB" 
                            className="uppercase font-mono"
                            maxLength={3}
                            onChange={handleBrandPrefixChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique 3-letter prefix for all product codes (e.g., EMB, GSK, PZ)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="manufacturerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer ID *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., MFG-NG-2024-001" 
                            className="uppercase"
                            onChange={handleManufacturerIdChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this manufacturer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., NAFDAC-REG-12345" />
                        </FormControl>
                        <FormDescription>
                          Government/regulatory registration number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Company Address *
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Full company address including city and country" 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., John Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@company.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+234 800 000 0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Website (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://company.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* Registration & Contract */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Registration & Contract Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Date *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Start Date *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract End Date *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="monthlyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly QR Code Limit *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={100}
                          max={1000000}
                          step={100}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 100)}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of QR codes this client can generate per month (100 - 1,000,000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </h3>
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://company.com/logo.png" 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to company logo for verification pages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information (JSON - Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={`{
  "nafdacCategory": "Category A",
  "manufacturingSites": ["Lagos", "Abuja"],
  "qualityCertifications": ["ISO 9001", "WHO-GMP"]
}`}
                          rows={4}
                          className="font-mono text-sm"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional JSON data for client information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Creating Client...
                    </>
                  ) : (
                    <>
                      <Building className="h-5 w-5 mr-3" />
                      Register Client
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}