import "./styles.css";

const themeToggle = document.querySelector("#theme-toggle");
const form = document.querySelector("#contact-form");
const submitButton = document.querySelector("#contact-submit");
const status = document.querySelector("#contact-status");

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  status.textContent = "";
  status.className = "contact-status";

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  const formData = new FormData(form);

  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website")
  };

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível enviar.");
    }

    form.reset();

    status.textContent =
      "Mensagem enviada! Valeu por chegar junto. 🤘";

    status.classList.add("success");
  } catch (error) {
    console.error(error);

    status.textContent =
      "Deu alguma coisa errada. Tenta novamente daqui a pouco.";

    status.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar mensagem";
  }
});