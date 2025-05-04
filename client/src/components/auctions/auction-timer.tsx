import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

interface AuctionTimerProps {
  endTime: string | Date;
}

export function AuctionTimer({ endTime }: AuctionTimerProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(endTime);
      const timeDifference = end.getTime() - now.getTime();
      
      if (timeDifference <= 0) {
        setIsExpired(true);
        return '00:00:00';
      }
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());
    
    // Update every second
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining === '00:00:00') {
        clearInterval(intervalId);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [endTime]);
  
  return (
    <div className="flex justify-center items-center space-x-3 space-x-reverse">
      <Clock className="text-secondary h-4 w-4" />
      <span>{isExpired ? t("auctions.auctionEnded") : timeRemaining}</span>
    </div>
  );
}
