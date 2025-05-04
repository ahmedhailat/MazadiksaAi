import { useTranslation } from "react-i18next";
import { Star, StarHalf } from "lucide-react";

export function Testimonials() {
  const { t } = useTranslation();
  
  const testimonials = [
    {
      name: "محمد السالم",
      role: "جامع تحف",
      imageSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
      rating: 5,
      text: "منصة مزادKSA غيرت طريقة شرائي للقطع النادرة. أصبح بإمكاني الآن المشاركة في مزادات عالمية المستوى من الراحة في منزلي. الشفافية والأمان اللذان توفرهما المنصة لا مثيل لهما."
    },
    {
      name: "سارة القحطاني",
      role: "هاوية فن",
      imageSrc: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop",
      rating: 4.5,
      text: "تجربة استثنائية! اشتريت لوحة فنية نادرة من خلال مزادKSA، وكانت العملية سلسة من البداية إلى النهاية. أقدر كثيرًا مستوى المصداقية والتوثيق الذي تقدمه المنصة للقطع المعروضة."
    },
    {
      name: "فهد العتيبي",
      role: "مستثمر",
      imageSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      rating: 5,
      text: "كمستثمر في القطع النادرة، أجد أن مزادKSA يقدم فرصًا استثمارية ممتازة. نظام المزايدة مباشر وسهل الاستخدام، والفريق دائمًا مستعد للمساعدة. أنصح به بشدة لأي شخص يبحث عن منصة مزادات موثوقة."
    }
  ];
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }
    
    return stars;
  };
  
  return (
    <section className="py-12 md:py-16 bg-sand">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutralDark mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("testimonials.description")}
          </p>
        </div>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.imageSrc} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="mr-3">
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="text-yellow-400 flex mb-3">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-gray-600">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
