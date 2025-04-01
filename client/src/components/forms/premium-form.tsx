import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Service, orderFormSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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

interface PremiumFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumForm({ isOpen, onClose }: PremiumFormProps) {
  const { toast } = useToast();
  const [total, setTotal] = useState<number | null>(null);

  // Get premium services
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services", "premium"],
    queryFn: async () => {
      const response = await fetch("/api/services?type=premium");
      if (!response.ok) throw new Error("Failed to fetch premium services");
      return response.json();
    },
  });

  // Create extended schema with validation
  const formSchema = orderFormSchema.extend({
    serviceId: z.number({
      required_error: "Please select a subscription duration",
    }),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      telegramId: "",
      phoneNumber: "",
      email: "",
      quantity: 1,
      serviceId: 0,
    },
  });

  // Calculate total when service or quantity changes
  const watchServiceId = form.watch("serviceId");
  const watchQuantity = form.watch("quantity");

  if (watchServiceId && watchQuantity && services) {
    const selectedService = services.find(service => service.id === watchServiceId);
    if (selectedService) {
      const calculatedTotal = selectedService.price;
      if (calculatedTotal !== total) {
        setTotal(calculatedTotal);
      }
    }
  }

  // Handle order submission
  const orderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Placed",
        description: "Your premium subscription order has been successfully placed!",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    orderMutation.mutate(data);
  };

  // Update form when service changes
  const handleServiceChange = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId);
    if (service) {
      form.setValue("quantity", 1); // Always 1 for premium subscription
      form.setValue("serviceId", serviceId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="mr-2 flex-shrink-0 bg-[#0088CC] rounded-md p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5l10 -10"></path></svg>
            </div>
            Subscribe to Telegram Premium
          </DialogTitle>
          <DialogDescription>
            Unlock exclusive features with Telegram Premium
          </DialogDescription>
          <button
            className="absolute top-4 right-4 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0088CC]"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="telegramId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram ID or Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@username or 123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Duration</FormLabel>
                  <Select
                    onValueChange={(value) => handleServiceChange(Number(value))}
                    value={field.value.toString()}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} (${service.price.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Email (Optional)</FormLabel>
                    <span className="text-xs text-gray-500 dark:text-gray-400">For receipt</span>
                  </div>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total:</span>
                <span className="text-lg font-bold text-[#0088CC]">
                  {total !== null ? `$${total.toFixed(2)}` : "$0.00"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
