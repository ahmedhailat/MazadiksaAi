import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Gavel, MapPin, Phone, Mail } from "lucide-react";
import { 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaFacebook 
} from "react-icons/fa";

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-neutral-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About Column */}
          <div>
            <div className="flex items-center mb-6">
              <Gavel className="text-secondary text-2xl" />
              <span className="text-white text-2xl font-bold mr-2">
                مزادي<span className="text-secondary">KSA</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              أول منصة مزادات إلكترونية متخصصة في المملكة العربية السعودية، 
              نوفر تجربة مزايدة آمنة وموثوقة لجميع المستخدمين.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-secondary transition-colors">
                <FaFacebook size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/auctions" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.activeAuctions")}
                </Link>
              </li>
              <li>
                <Link href="/auctions?upcoming=true" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.upcomingAuctions")}
                </Link>
              </li>
              <li>
                <Link href="/auctions?status=closed" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.closedAuctions")}
                </Link>
              </li>
              <li>
                <Link href="/how-to-bid" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.howToBid")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.faq")}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">
              {t("footer.categories")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/jewelry-watches" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.jewelry")}
                </Link>
              </li>
              <li>
                <Link href="/categories/art-paintings" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.art")}
                </Link>
              </li>
              <li>
                <Link href="/categories/heritage-items" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.heritage")}
                </Link>
              </li>
              <li>
                <Link href="/categories/luxury-cars" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.cars")}
                </Link>
              </li>
              <li>
                <Link href="/categories/manuscripts" className="text-gray-400 hover:text-white transition-colors">
                  {t("footer.manuscripts")}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">
              {t("footer.contactUs")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="text-secondary mt-1 ml-3" />
                <span className="text-gray-400">
                  {t("footer.address")}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="text-secondary ml-3" />
                <span className="text-gray-400">+966 50 593 0648</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-secondary ml-3" />
                <span className="text-gray-400">info@mazadiksa.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>{t("footer.rights")}</p>
          <div className="flex justify-center space-x-6 space-x-reverse mt-3">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/conditions" className="hover:text-white transition-colors">
              {t("footer.conditions")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
