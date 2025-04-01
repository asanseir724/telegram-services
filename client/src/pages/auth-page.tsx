import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Star, Lock } from "lucide-react";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { t } = useTranslation();

  // Create validation schemas with translated messages
  const loginSchema = z.object({
    username: z.string().min(3, {
      message: t('forms.validations.username'),
    }),
    password: z.string().min(6, {
      message: t('forms.validations.password'),
    }),
  });

  const registerSchema = z.object({
    username: z.string().min(3, {
      message: t('forms.validations.username'),
    }),
    password: z.string().min(6, {
      message: t('forms.validations.password'),
    }),
    email: z.string().email({
      message: t('forms.validations.email'),
    }).optional(),
    name: z.string().min(1, {
      message: t('forms.validations.required'),
    }),
  });

  // If already logged in, redirect to admin page
  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? "/admin" : "/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ ...values, isAdmin: false });
  };

  return (
    <>
      <Helmet>
        <title>{t('common.login')} - {t('common.appName')} {t('nav.admin')}</title>
        <meta name="description" content={`${t('common.login')} - ${t('common.appName')} ${t('nav.admin')}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#0088CC] to-[#55ACEE] p-8 rounded-lg shadow-lg flex flex-col justify-center text-white hidden md:flex">
            <div className="mb-4">
              <Star className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{t('common.appName')} {t('nav.admin')}</h1>
            <p className="text-lg mb-6">
              {t('home.services.stars.desc')} {t('home.services.premium.desc')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="bg-white bg-opacity-20 rounded-full p-1 mr-3 rtl:ml-3 rtl:mr-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                {t('admin.orders.title')}
              </li>
              <li className="flex items-center">
                <span className="bg-white bg-opacity-20 rounded-full p-1 mr-3 rtl:ml-3 rtl:mr-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                {t('admin.pricing.title')}
              </li>
              <li className="flex items-center">
                <span className="bg-white bg-opacity-20 rounded-full p-1 mr-3 rtl:ml-3 rtl:mr-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                {t('admin.dashboard.revenue')}
              </li>
              <li className="flex items-center">
                <span className="bg-white bg-opacity-20 rounded-full p-1 mr-3 rtl:ml-3 rtl:mr-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                {t('admin.settings.title')}
              </li>
            </ul>
          </div>

          <div>
            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-1">
                <div className="flex items-center mb-2 justify-center md:justify-start">
                  <Lock className="h-6 w-6 text-[#0088CC] mr-2 rtl:ml-2 rtl:mr-0" />
                  <CardTitle className="text-2xl">{t('common.login')}</CardTitle>
                </div>
                <CardDescription>
                  {t('forms.auth.username')} {t('forms.auth.password')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">{t('common.login')}</TabsTrigger>
                    <TabsTrigger value="register">{t('common.register')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('forms.auth.username')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('forms.auth.usernamePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('forms.auth.password')}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder={t('forms.auth.passwordPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? t('common.loading') : t('forms.auth.loginButton')}
                        </Button>
                        <p className="text-center text-sm text-gray-500 mt-2">
                          Admin credentials: username: "admin", password: "admin123"
                        </p>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('forms.auth.username')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('forms.auth.usernamePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('forms.stars.email')}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={t('forms.stars.emailPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('forms.auth.password')}</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder={t('forms.auth.passwordPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? t('common.loading') : t('forms.auth.registerButton')}
                        </Button>
                        <p className="text-center text-sm text-gray-500 mt-2">
                          {t('forms.auth.noAccount')}
                        </p>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <div className="text-center mt-2">
                  <a href="/" className="text-sm text-[#0088CC] hover:underline">
                    {t('nav.home')}
                  </a>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
