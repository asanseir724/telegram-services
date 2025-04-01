import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/admin-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Setting } from "@shared/schema";

// Schema for text editing
const textEditorSchema = z.object({
  key: z.string().min(1, { message: "Translation key is required" }),
  value: z.string().min(1, { message: "Translation value is required" }),
});

type TextEditorForm = z.infer<typeof textEditorSchema>;

export default function TextEditor() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [language, setLanguage] = useState(i18n.language);
  const [textKeys, setTextKeys] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Load translations from i18next
  useEffect(() => {
    const resources = i18n.getResourceBundle(language, "translation");
    if (resources) {
      // Flatten nested translation object to get all keys
      const flattenObject = (obj: any, prefix = ""): Record<string, string> => {
        return Object.keys(obj).reduce((acc: Record<string, string>, k) => {
          const pre = prefix.length ? `${prefix}.` : "";
          if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
          } else {
            acc[pre + k] = obj[k].toString();
          }
          return acc;
        }, {});
      };

      setTextKeys(flattenObject(resources));
    }
  }, [language, i18n]);

  const form = useForm<TextEditorForm>({
    resolver: zodResolver(textEditorSchema),
    defaultValues: {
      key: "",
      value: "",
    },
  });

  // Handle key selection for editing
  const handleKeySelect = (key: string) => {
    setSelectedKey(key);
    form.setValue("key", key);
    form.setValue("value", textKeys[key] || "");
  };

  // Fetch existing translation settings
  const { data: settings } = useQuery<Setting[]>({
    queryKey: ["/api/settings/translations"],
    queryFn: async () => {
      const res = await fetch("/api/settings/translations");
      if (!res.ok) throw new Error("Failed to fetch translation settings");
      return await res.json();
    },
  });

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async (data: TextEditorForm) => {
      // Using settings API to store translations
      const res = await apiRequest("POST", "/api/settings/translation", {
        key: `translation_${language}_${data.key}`,
        value: data.value,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("admin.textEditor.success"),
        description: t("admin.textEditor.successMessage"),
      });
      // Invalidate the settings query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/settings/translations"] });
      // Reload the page to apply changes
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: t("admin.textEditor.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TextEditorForm) => {
    updateTranslationMutation.mutate(data);
  };

  // Filter keys based on search query
  const filteredKeys = Object.keys(textKeys).filter(key => 
    key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    textKeys[key].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title={t("admin.textEditor.title")}>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{t("admin.textEditor.subtitle")}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t("admin.textEditor.description")}
          </p>
        </div>

        <Tabs defaultValue={language} onValueChange={setLanguage} className="mb-6">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fa">فارسی</TabsTrigger>
          </TabsList>
          <TabsContent value={language} className="mt-4">
            <div className="flex mb-4">
              <Input
                placeholder={t("admin.textEditor.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="border rounded-md p-4 h-[600px] overflow-y-auto">
                <h3 className="text-lg font-medium mb-2">{t("admin.textEditor.availableKeys")}</h3>
                <div className="space-y-1">
                  {filteredKeys.map((key) => (
                    <div 
                      key={key}
                      className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        selectedKey === key ? "bg-blue-100 dark:bg-blue-900" : ""
                      }`}
                      onClick={() => handleKeySelect(key)}
                    >
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{key}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{textKeys[key]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border rounded-md p-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.textEditor.key")}</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-gray-50 dark:bg-gray-800" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("admin.textEditor.value")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={8} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={updateTranslationMutation.isPending || !selectedKey}
                      className="w-full"
                    >
                      {updateTranslationMutation.isPending 
                        ? t("common.loading") 
                        : t("admin.textEditor.save")
                      }
                    </Button>
                  </form>
                </Form>

                {selectedKey && settings?.some(s => s.key === `translation_${language}_${selectedKey}`) && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t("admin.textEditor.overrideWarning")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}