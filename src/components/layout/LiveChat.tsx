"use client";

import Script from "next/script";

// Tawk.to live chat widget
// Sign up at https://www.tawk.to/ to get your property ID and widget ID
// Replace the placeholder IDs below with your actual Tawk.to IDs
// If NEXT_PUBLIC_TAWKTO_PROPERTY_ID is not set, the widget won't load

export function LiveChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || "1i0";

  if (!propertyId) return null;

  return (
    <Script
      id="tawk-to"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
