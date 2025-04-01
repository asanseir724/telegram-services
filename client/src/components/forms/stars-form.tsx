import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Service, orderFormSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

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

interface StarsFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StarsForm({ isOpen, onClose }: StarsFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [total, setTotal] = useState<number | null>(null);

  // Get stars services
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services", "stars"],
    queryFn: async () => {
      const response = await fetch("/api/services?type=stars");
      if (!response.ok) throw new Error("Failed to fetch stars services");
      return response.json();
    },
  });

  // Create extended schema with validation
  const formSchema = orderFormSchema.extend({
    serviceId: z.number({
      required_error: t('forms.validations.required'),
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
    if (selectedService && selectedService.quantity) {
      const calculatedTotal = selectedService.price * (watchQuantity / selectedService.quantity);
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
        title: t('common.success'),
        description: t('common.success'),
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    orderMutation.mutate(data);
  };

  // Update service quantity when service changes
  const handleServiceChange = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId);
    if (service) {
      // Ensure we have a valid quantity
      const safeQuantity = typeof service.quantity === 'number' ? service.quantity : 1;
      form.setValue("quantity", safeQuantity);
      form.setValue("serviceId", serviceId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="mr-2 rtl:ml-2 rtl:mr-0 flex-shrink-0 bg-[#0088CC] rounded-md p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            {t('forms.stars.title')}
          </DialogTitle>
          <DialogDescription>
            {t('home.services.stars.desc')}
          </DialogDescription>
          <button
            className="absolute top-4 right-4 rtl:left-4 rtl:right-auto inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0088CC]"
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
                  <FormLabel>{t('forms.stars.telegramId')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('forms.stars.telegramIdPlaceholder')} {...field} />
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
                  <FormLabel>{t('forms.stars.phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('forms.stars.phoneNumberPlaceholder')} {...field} />
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
                  <FormLabel>{t('forms.stars.quantity')}</FormLabel>
                  <Select
                    onValueChange={(value) => handleServiceChange(Number(value))}
                    value={field.value.toString()}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms.stars.quantity')} />
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
                    <FormLabel>{t('forms.stars.email')}</FormLabel>
                    <span className="text-xs text-gray-500 dark:text-gray-400">For receipt</span>
                  </div>
                  <FormControl>
                    <Input placeholder={t('forms.stars.emailPlaceholder')} {...field} />
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
                {orderMutation.isPending ? t('common.loading') : t('forms.stars.submitButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
