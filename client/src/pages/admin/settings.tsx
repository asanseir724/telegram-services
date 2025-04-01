import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Setting } from "@shared/schema";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState({
    siteName: "",
    contactEmail: "",
    maintenanceMode: false,
    adminName: "",
    adminEmail: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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
  });

  // Fetch user data
  const { 
    data: user, 
    isLoading: loadingUser 
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await fetch("/api/user");
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  // Initialize form values from settings
  useEffect(() => {
    if (settings) {
      const siteNameSetting = settings.find(s => s.key === "site_name");
      const contactEmailSetting = settings.find(s => s.key === "contact_email");
      const maintenanceModeSetting = settings.find(s => s.key === "maintenance_mode");
      
      setFormValues(prev => ({
        ...prev,
        siteName: siteNameSetting?.value || "",
        contactEmail: contactEmailSetting?.value || "",
        maintenanceMode: maintenanceModeSetting?.value === "true"
      }));
    }
  }, [settings]);

  // Initialize user form values
  useEffect(() => {
    if (user) {
      setFormValues(prev => ({
        ...prev,
        adminName: user.name || "",
        adminEmail: user.email || ""
      }));
    }
  }, [user]);

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

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("PUT", `/api/user/${user.id}`, userData);
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
    // Validate passwords match if changing password
    if (formValues.newPassword) {
      if (formValues.newPassword !== formValues.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      } else {
        setPasswordError("");
      }
    }

    setIsSubmitting(true);
    
    try {
      // Update settings
      const updatePromises = [];
      
      const settingsToUpdate = [
        { key: "site_name", value: formValues.siteName },
        { key: "contact_email", value: formValues.contactEmail },
        { key: "maintenance_mode", value: formValues.maintenanceMode.toString() }
      ];
      
      for (const setting of settingsToUpdate) {
        const existingSetting = settings?.find(s => s.key === setting.key);
        if (existingSetting?.value !== setting.value) {
          updatePromises.push(
            updateSettingMutation.mutateAsync({ key: setting.key, value: setting.value })
          );
        }
      }
      
      // Update user data if changed
      const userData: any = {};
      if (formValues.adminName !== user?.name) userData.name = formValues.adminName;
      if (formValues.adminEmail !== user?.email) userData.email = formValues.adminEmail;
      if (formValues.newPassword) userData.password = formValues.newPassword;
      
      if (Object.keys(userData).length > 0) {
        updatePromises.push(updateUserMutation.mutateAsync(userData));
      }
      
      await Promise.all(updatePromises);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Reset password fields
      setFormValues(prev => ({
        ...prev,
        newPassword: "",
        confirmPassword: ""
      }));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      maintenanceMode: checked
    }));
  };

  return (
    <>
      <Helmet>
        <title>Settings - TelegramPlus Admin</title>
      </Helmet>

      <AdminLayout title="Settings">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Manage your account and application settings.
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
                "Save Settings"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {/* Account Settings */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="admin-name">Admin Name</Label>
                  <div className="mt-1">
                    {loadingUser ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        type="text"
                        id="admin-name"
                        name="adminName"
                        value={formValues.adminName}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <div className="mt-1">
                    {loadingUser ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        type="email"
                        id="admin-email"
                        name="adminEmail"
                        value={formValues.adminEmail}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="mt-1">
                    <Input
                      type="password"
                      id="new-password"
                      name="newPassword"
                      value={formValues.newPassword}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="mt-1">
                    <Input
                      type="password"
                      id="confirm-password"
                      name="confirmPassword"
                      value={formValues.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current"
                      className={passwordError ? "border-red-500" : ""}
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Site Settings */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg">Site Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="site-name">Site Name</Label>
                  <div className="mt-1">
                    {loadingSettings ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        type="text"
                        id="site-name"
                        name="siteName"
                        value={formValues.siteName}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <div className="mt-1">
                    {loadingSettings ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        type="email"
                        id="contact-email"
                        name="contactEmail"
                        value={formValues.contactEmail}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <div className="flex items-center space-x-2">
                    {loadingSettings ? (
                      <Skeleton className="h-5 w-5" />
                    ) : (
                      <Switch
                        id="maintenance-mode"
                        checked={formValues.maintenanceMode}
                        onCheckedChange={handleSwitchChange}
                      />
                    )}
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enable maintenance mode to temporarily disable the site for users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              "Save Settings"
            )}
          </Button>
        </div>
      </AdminLayout>
    </>
  );
}
