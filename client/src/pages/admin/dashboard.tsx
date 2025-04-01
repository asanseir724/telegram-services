import { useQuery } from "@tanstack/react-query";
import { Order, Service } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/layout/admin-layout";
import {
  LayoutDashboard,
  Star,
  Crown,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
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

  // Calculate dashboard stats
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  
  const starsSold = orders?.reduce((sum, order) => {
    const service = services?.find(s => s.id === order.serviceId);
    if (service?.type === "stars") {
      return sum + order.quantity;
    }
    return sum;
  }, 0) || 0;
  
  const premiumSubscriptions = orders?.filter(order => {
    const service = services?.find(s => s.id === order.serviceId);
    return service?.type === "premium";
  }).length || 0;

  // Get recent orders (up to 5)
  const recentOrders = orders?.slice(0, 5) || [];

  const getServiceNameById = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId);
    return service?.name || "Unknown Service";
  };

  const getServiceTypeById = (serviceId: number) => {
    const service = services?.find(s => s.id === serviceId);
    return service?.type || "unknown";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - TelegramPlus Admin</title>
      </Helmet>

      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Orders Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LayoutDashboard className="h-8 w-8 text-[#0088CC]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Orders
                    </dt>
                    <dd>
                      {loadingOrders ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{totalOrders}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stars Sold Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-[#0088CC]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Stars Sold
                    </dt>
                    <dd>
                      {loadingOrders || loadingServices ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{starsSold.toLocaleString()}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Subscriptions Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Crown className="h-8 w-8 text-[#0088CC]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Premium Subscriptions
                    </dt>
                    <dd>
                      {loadingOrders || loadingServices ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">{premiumSubscriptions}</div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-[#0088CC]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Revenue
                    </dt>
                    <dd>
                      {loadingOrders ? (
                        <Skeleton className="h-7 w-28" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          ${totalRevenue.toFixed(2)}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Orders</h2>
          <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {loadingOrders || loadingServices ? (
                  Array(3).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-32" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-20" />
                      </td>
                    </tr>
                  ))
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          {getServiceTypeById(order.serviceId) === "stars" ? (
                            <Star className="text-[#0088CC] mr-2 h-4 w-4" />
                          ) : (
                            <Crown className="text-[#0088CC] mr-2 h-4 w-4" />
                          )}
                          <span>{getServiceNameById(order.serviceId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.telegramId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
