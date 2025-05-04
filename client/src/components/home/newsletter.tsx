import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export function Newsletter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define validation schema
  const formSchema = z.object({
    email: z.string().email(t("auth.emailPlaceholder"))
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: t("newsletter.title"),
        description: "You have been successfully subscribed to our newsletter.",
      });
      
      // Reset form
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <section className="py-12 md:py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t("newsletter.title")}
          </h2>
          <p className="mb-8 opacity-90">
            {t("newsletter.description")}
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <input
                        {...field}
                        type="email"
                        placeholder={t("newsletter.placeholder")}
                        className="w-full px-4 py-3 rounded-md text-neutralDark focus:outline-none focus:ring-2 focus:ring-secondary ltr md:rounded-l-none md:rounded-r-md"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300 text-sm" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 md:mt-0 bg-secondary hover:bg-secondary-dark text-white font-bold px-6 py-3 rounded-md md:rounded-r-none md:rounded-l-md transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("newsletter.button")}
                  </span>
                ) : (
                  t("newsletter.button")
                )}
              </Button>
            </form>
          </Form>
          
          <p className="mt-4 text-sm opacity-75">
            {t("newsletter.privacyNotice")}
          </p>
        </div>
      </div>
    </section>
  );
}
