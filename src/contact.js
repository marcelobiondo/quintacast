import "./styles.css";
import {
  initAnalytics,
  trackEvent
} from "./analytics.js";
import { renderSiteHeader } from "./site-header.js";

import {
  initStickyHeader,
  initThemeToggle
} from "./header.js";

initAnalytics();
trackEvent("contact_view");

const headerContainer =
  document.querySelector("#site-header");

headerContainer.insertAdjacentHTML(
  "beforebegin",
  renderSiteHeader({
    active: "contact"
  })
);

headerContainer.remove();

initStickyHeader();
initThemeToggle();

const form =
  document.querySelector("#contact-form");

const submitButton =
  document.querySelector("#contact-submit");

const status =
  document.querySelector("#contact-status");

form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    status.textContent = "";

    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      website: formData.get("website")
    };

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

if (!response.ok) {
  throw new Error(
    data.error ||
      "Não foi possível enviar a mensagem."
  );
}

trackEvent("contact_submit_success");

form.reset();

status.textContent =
  "Mensagem enviada! Valeu por chegar junto. 🤘";
    } catch (error) {
      console.error(error);

      status.textContent =
        "Deu ruim no envio. Tenta novamente daqui a pouco.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent =
        "Enviar mensagem";
    }
  }
);