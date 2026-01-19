"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  codeGenerationSchema,
  type CodeGenerationFormData,
} from "@/schemas/code-generation";
import { useCodes } from "@/hooks/use-codes";
import { Loader2, Package, Building, Barcode } from "lucide-react";

const BRAND_PREFIXES = [
  { value: "EMB", label: "EMB - EmbodiTrust" },
  { value: "GLA", label: "GLA - GlaxoSmithKline" },
  { value: "PZ", label: "PZ - PZ Cussons" },
  { value: "FID", label: "FID - Fidson" },
  { value: "MAY", label: "MAY - May & Baker" },
];

export default function CodeGeneratorForm() {
  const [activeTab, setActiveTab] = useState("basic");
  const { generateQRCodes } = useCodes();

  const form = useForm<CodeGenerationFormData>({
    resolver: zodResolver(codeGenerationSchema),
    defaultValues: {
      quantity: 100,
      brandPrefix: "EMB",
      productName: "",
      companyName: "",
      manufacturerId: "",
      enableCustomSuccess: false,
      customSuccessConfig: {
        additionalFields: {},
      },
    },
  });

  const enableCustomSuccess = form.watch("enableCustomSuccess");

  const onSubmit = async (data: CodeGenerationFormData) => {
    await generateQRCodes.mutateAsync(data);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="h-6 w-6" />
          Generate Verification Codes
        </CardTitle>
        <CardDescription>
          Create a new batch of verification codes for pharmaceutical products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={10000}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of codes to generate (1-10,000)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Prefix</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand prefix" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BRAND_PREFIXES.map((prefix) => (
                              <SelectItem key={prefix.value} value={prefix.value}>
                                {prefix.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          3-character brand identifier
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Paracetamol 500mg Tablets"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Company Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., EmbodiTrust Pharmaceuticals"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manufacturerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., MFG-2024-001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="enableCustomSuccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Custom Success Page</FormLabel>
                        <FormDescription>
                          Customize the verification success page for this batch
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {enableCustomSuccess && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h4 className="font-medium">Custom Success Configuration</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customSuccessConfig.companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customSuccessConfig.productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Product Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="customSuccessConfig.batchNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Number</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customSuccessConfig.logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com/logo.png"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <Badge variant="outline" className="mr-2">
                  Format: 12-char alphanumeric
                </Badge>
                <Badge variant="outline">
                  Includes Luhn checksum
                </Badge>
              </div>
              
              <Button
                type="submit"
                disabled={generateQRCodes.isPending}
                className="gap-2"
              >
                {generateQRCodes.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate & Download CSV
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}