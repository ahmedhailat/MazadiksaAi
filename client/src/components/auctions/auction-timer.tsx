
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

interface AuctionTimerProps {
  endDate: Date;
}

export function AuctionTimer({ endDate }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const { i18n } = useTranslation();

  const getArabicNumeral = (num: number): string => {
    const arabicNums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().replace(/[0-9]/g, (w) => arabicNums[+w]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTimeLeft(i18n.language === 'ar' ? getArabicNumeral(parseInt(timeString.replace(/:/g, ''))) : timeString);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, i18n.language]);

  return (
    <div className="flex items-center gap-2 text-primary">
      <Clock className="w-4 h-4" />
      <span className="font-mono">{timeLeft}</span>
    </div>
  );
}
