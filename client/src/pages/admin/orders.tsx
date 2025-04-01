import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, Service } from "@shared/schema";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layout/admin-layout";
import { Star, Crown, Eye, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);

  // Fetch orders
  const { 
    data: orders, 
    isLoading: loadingOrders 
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

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

  // Update order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete order
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Deleted",
        description: "Order has been deleted successfully",
      });
      setDeleteOrderId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      setDeleteOrderId(null);
    },
  });

  // Filter orders based on search query
  const filteredOrders = orders?.filter(order => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const service = services?.find(s => s.id === order.serviceId);
    
    return (
      order.id.toString().includes(query) ||
      order.telegramId.toLowerCase().includes(query) ||
      order.phoneNumber.toLowerCase().includes(query) ||
      (order.email?.toLowerCase().includes(query) || false) ||
      service?.name.toLowerCase().includes(query) ||
      service?.type.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  // Handle status change
  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderMutation.mutate({ id: orderId, status });
  };

  // Get the service for an order
  const getOrderService = (orderId: number) => {
    const order = orders?.find(o => o.id === orderId);
    if (!order) return null;
    
    return services?.find(s => s.id === order.serviceId);
  };

  // Get view order
  const viewOrder = orders?.find(o => o.id === viewOrderId);
  const viewOrderService = viewOrder ? services?.find(s => s.id === viewOrder.serviceId) : null;

  return (
    <>
      <Helmet>
        <title>Orders - TelegramPlus Admin</title>
      </Helmet>

      <AdminLayout title="Orders">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all orders including their ID, service, user, amount, status and date.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                id="orders-search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10" 
                placeholder="Search orders..." 
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                        Order ID
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Service
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        User
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Phone
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Date
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {loadingOrders || loadingServices ? (
                      Array(5).fill(0).map((_, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                            <Skeleton className="h-5 w-20" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-5 w-32" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-5 w-28" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-5 w-28" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-5 w-16" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-7 w-24" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-5 w-20" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <Skeleton className="h-5 w-16" />
                          </td>
                        </tr>
                      ))
                    ) : filteredOrders && filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const service = services?.find(s => s.id === order.serviceId);
                        return (
                          <tr key={order.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                              #{order.id}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                {service?.type === "stars" ? (
                                  <Star className="text-[#0088CC] mr-2 h-4 w-4" />
                                ) : (
                                  <Crown className="text-[#0088CC] mr-2 h-4 w-4" />
                                )}
                                <span>{service?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                              {order.telegramId}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {order.phoneNumber}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                disabled={updateOrderMutation.isPending}
                              >
                                <SelectTrigger className="w-full h-8">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setViewOrderId(order.id)}
                                className="text-[#0088CC] hover:text-[#0088CC]/80 mr-2"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setDeleteOrderId(order.id)}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery ? "No orders matching your search" : "No orders found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Order Confirmation Dialog */}
        <AlertDialog open={deleteOrderId !== null} onOpenChange={() => setDeleteOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteOrderId && deleteOrderMutation.mutate(deleteOrderId)}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {deleteOrderMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Order Dialog */}
        <Dialog open={viewOrderId !== null} onOpenChange={() => setViewOrderId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Complete information about this order
              </DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="text-sm text-gray-900 dark:text-white">#{viewOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{viewOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</p>
                    <p className="text-sm text-gray-900 dark:text-white">{viewOrderService?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{viewOrderService?.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Telegram ID</p>
                    <p className="text-sm text-gray-900 dark:text-white">{viewOrder.telegramId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white">{viewOrder.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{viewOrder.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="text-sm text-gray-900 dark:text-white">{viewOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-sm text-gray-900 dark:text-white">${viewOrder.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(viewOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Select
                    value={viewOrder.status}
                    onValueChange={(value) => {
                      handleStatusChange(viewOrder.id, value);
                      setViewOrderId(null);
                    }}
                    disabled={updateOrderMutation.isPending}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setViewOrderId(null);
                      setDeleteOrderId(viewOrder.id);
                    }}
                  >
                    Delete Order
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
