import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("contact.title")}</h1>
        <p className="text-lg text-muted-foreground mb-10">{t("contact.subtitle")}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-bold mb-6">{t("contact.reachUs")}</h2>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mt-1 ml-3 ltr:mr-3 rtl:ml-3" />
                    <div>
                      <h3 className="font-medium">{t("contact.email")}</h3>
                      <div className="space-y-1 mt-1">
                        <p>Aheilat@msmcco.com</p>
                        <p>Engr.Ahmed.hailat@gmail.com</p>
                        <p>Info@mazadiksa.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mt-1 ltr:mr-3 rtl:ml-3" />
                    <div>
                      <h3 className="font-medium">{t("contact.phone")}</h3>
                      <div className="space-y-1 mt-1">
                        <p>+966 50 593 0648</p>
                        <p>0558585600</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mt-1 ltr:mr-3 rtl:ml-3" />
                    <div>
                      <h3 className="font-medium">{t("contact.address")}</h3>
                      <p className="mt-1">{t("contact.addressLine")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary mt-1 ltr:mr-3 rtl:ml-3" />
                    <div>
                      <h3 className="font-medium">{t("contact.workingHours")}</h3>
                      <div className="mt-1">
                        <p>{t("contact.workingDays")}</p>
                        <p>{t("contact.workingTime")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold mb-6">{t("contact.sendMessage")}</h2>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        {t("contact.fullName")}
                      </label>
                      <input
                        id="name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("contact.fullNamePlaceholder")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        {t("contact.emailAddress")}
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("contact.emailPlaceholder")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        {t("contact.subject")}
                      </label>
                      <input
                        id="subject"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("contact.subjectPlaceholder")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        {t("contact.message")}
                      </label>
                      <textarea
                        id="message"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={t("contact.messagePlaceholder")}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 h-10 py-2 w-full"
                  >
                    {t("contact.send")}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}