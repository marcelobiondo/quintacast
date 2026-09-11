const GA_MEASUREMENT_ID = "G-5VS29BSSFP";

const isProduction =
  window.location.hostname === "quintacast.com.br";

export function initAnalytics() {
  if (!isProduction) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");

  script.async = true;
  script.src =
    `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

  document.head.appendChild(script);

  window.gtag("js", new Date());

  window.gtag(
    "config",
    GA_MEASUREMENT_ID
  );
}

export function trackEvent(eventName, params = {}) {
  if (
    !isProduction ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag(
    "event",
    eventName,
    params
  );
}