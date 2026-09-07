import "./styles.css";
import { initStickyHeader } from "./header.js";

const form = document.querySelector("#contact-form");
const submitButton = document.querySelector("#contact-submit");
const status = document.querySelector("#contact-status");

initStickyHeader();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  status.textContent = "";

  const formData = new FormData(form);

  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website"),
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível enviar a mensagem.");
    }

    form.reset();
    status.textContent = "Mensagem enviada! Valeu por chegar junto. 🤘";
  } catch (error) {
    console.error(error);

    status.textContent =
      "Deu ruim no envio. Tenta novamente daqui a pouco.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar mensagem";
  }
});
