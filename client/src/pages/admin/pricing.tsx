import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Service, Setting } from "@shared/schema";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Pricing() {
  const { toast } = useToast();
  const [starsCommission, setStarsCommission] = useState("");
  const [premiumCommission, setPremiumCommission] = useState("");
  const [servicePrices, setServicePrices] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services
  const { 
    data: services, 
    isLoading: loadingServices 
  } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  // Fetch settings
  const { 
    data: settings, 
    isLoading: loadingSettings 
  } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    onSuccess: (data) => {
      // Initialize state from settings
      const starsComm = data.find(s => s.key === "stars_commission");
      const premiumComm = data.find(s => s.key === "premium_commission");
      
      if (starsComm) setStarsCommission(starsComm.value);
      if (premiumComm) setPremiumCommission(premiumComm.value);
    }
  });

  // Initialize service prices
  if (services && Object.keys(servicePrices).length === 0) {
    const prices: Record<number, string> = {};
    services.forEach(service => {
      prices[service.id] = service.price.toString();
    });
    setServicePrices(prices);
  }

  // Update service price
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: number; price: number }) => {
      const res = await apiRequest("PUT", `/api/services/${id}`, { price });
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await apiRequest("PUT", `/api/settings/${key}`, { value });
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Update service prices
      const updatePromises = Object.entries(servicePrices).map(async ([idStr, priceStr]) => {
        const id = parseInt(idStr);
        const price = parseFloat(priceStr);
        
        if (isNaN(id) || isNaN(price)) return;
        
        const service = services?.find(s => s.id === id);
        if (!service || service.price === price) return;
        
        return updateServiceMutation.mutateAsync({ id, price });
      });
      
      // Update commission settings
      const updateSettingsPromises = [];
      
      if (starsCommission !== (settings?.find(s => s.key === "stars_commission")?.value || "")) {
        updateSettingsPromises.push(
          updateSettingMutation.mutateAsync({ key: "stars_commission", value: starsCommission })
        );
      }
      
      if (premiumCommission !== (settings?.find(s => s.key === "premium_commission")?.value || "")) {
        updateSettingsPromises.push(
          updateSettingMutation.mutateAsync({ key: "premium_commission", value: premiumCommission })
        );
      }
      
      await Promise.all([...updatePromises, ...updateSettingsPromises]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      toast({
        title: "Changes Saved",
        description: "Pricing and commission rates have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the pricing information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const starsServices = services?.filter(service => service.type === "stars") || [];
  const premiumServices = services?.filter(service => service.type === "premium") || [];

  return (
    <>
      <Helmet>
        <title>Pricing - TelegramPlus Admin</title>
      </Helmet>

      <AdminLayout title="Pricing & Commission">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Manage pricing and commission rates for all services.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Telegram Stars Pricing */}
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg">Telegram Stars Pricing</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {loadingServices ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="sm:col-span-2">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : (
                starsServices.map(service => (
                  <div key={service.id} className="sm:col-span-2">
                    <label htmlFor={`stars-${service.quantity}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {service.name}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                      </div>
                      <Input
                        type="number"
                        id={`stars-${service.quantity}`}
                        value={servicePrices[service.id] || ""}
                        onChange={(e) => setServicePrices({ ...servicePrices, [service.id]: e.target.value })}
                        className="pl-7"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                ))
              )}
              
              <div className="sm:col-span-2">
                <label htmlFor="stars-commission" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Commission Rate (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <Input
                    type="number"
                    id="stars-commission"
                    value={starsCommission}
                    onChange={(e) => setStarsCommission(e.target.value)}
                    className="pr-10"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Premium Pricing */}
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg">Telegram Premium Pricing</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {loadingServices ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="sm:col-span-2">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              ) : (
                premiumServices.map(service => (
                  <div key={service.id} className="sm:col-span-2">
                    <label htmlFor={`premium-${service.quantity}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {service.name}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                      </div>
                      <Input
                        type="number"
                        id={`premium-${service.quantity}`}
                        value={servicePrices[service.id] || ""}
                        onChange={(e) => setServicePrices({ ...servicePrices, [service.id]: e.target.value })}
                        className="pl-7"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                ))
              )}
              
              <div className="sm:col-span-2">
                <label htmlFor="premium-commission" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Commission Rate (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <Input
                    type="number"
                    id="premium-commission"
                    value={premiumCommission}
                    onChange={(e) => setPremiumCommission(e.target.value)}
                    className="pr-10"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </AdminLayout>
    </>
  );
}
