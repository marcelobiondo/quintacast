const RSS_URL =
  "https://anchor.fm/s/11621a644/podcast/rss";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --------------------------------------------------
    // ALIASES DA PÁGINA DE CONTATO
    // --------------------------------------------------

    if (
      url.pathname === "/feedback" ||
      url.pathname === "/feedback/" ||
      url.pathname === "/mensagem" ||
      url.pathname === "/mensagem/"
    ) {
      return Response.redirect(
        `${url.origin}/contato/`,
        301
      );
    }

    // --------------------------------------------------
    // RSS
    // --------------------------------------------------

    if (url.pathname === "/api/feed") {
      try {
        const response = await fetch(RSS_URL, {
          headers: {
            "User-Agent": "QuintaCast/1.0"
          }
        });

        if (!response.ok) {
          console.error(
            "Erro ao buscar RSS:",
            response.status
          );

          return new Response(
            "Não foi possível carregar o feed.",
            { status: 502 }
          );
        }

        const xml = await response.text();

        return new Response(xml, {
          headers: {
            "Content-Type":
              "application/rss+xml; charset=utf-8",

            "Cache-Control":
              "public, max-age=300"
          }
        });
      } catch (error) {
        console.error(
          "Erro ao carregar RSS:",
          error
        );

        return new Response(
          "Erro ao carregar RSS.",
          { status: 500 }
        );
      }
    }

    // --------------------------------------------------
    // FORMULÁRIO DE CONTATO
    // --------------------------------------------------

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return Response.json(
          {
            error: "Método não permitido."
          },
          {
            status: 405,
            headers: {
              Allow: "POST"
            }
          }
        );
      }

      return handleContact(request, env);
    }

    // --------------------------------------------------
    // ASSETS ESTÁTICOS
    // --------------------------------------------------

    return env.ASSETS.fetch(request);
  }
};


// ======================================================
// CONTATO
// ======================================================

async function handleContact(request, env) {
  try {
    const body = await request.json();

    const name =
      String(body.name || "").trim();

    const email =
      String(body.email || "").trim();

    const message =
      String(body.message || "").trim();

    const website =
      String(body.website || "").trim();

    // --------------------------------------------------
    // HONEYPOT
    // --------------------------------------------------

    // Bot provavelmente preencheu o campo escondido.
    // Fingimos sucesso para não entregar a proteção.
    if (website) {
      return Response.json({
        success: true
      });
    }

    // --------------------------------------------------
    // VALIDAÇÃO
    // --------------------------------------------------

    if (!name || !email || !message) {
      return Response.json(
        {
          error:
            "Preencha nome, e-mail e mensagem."
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        {
          error:
            "O nome ultrapassou o limite permitido."
        },
        { status: 400 }
      );
    }

    if (email.length > 200) {
      return Response.json(
        {
          error:
            "O e-mail ultrapassou o limite permitido."
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return Response.json(
        {
          error:
            "A mensagem ultrapassou o limite permitido."
        },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        {
          error: "E-mail inválido."
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CONFERE CONFIGURAÇÃO
    // --------------------------------------------------

    if (!env.RESEND_API_KEY) {
      console.error(
        "RESEND_API_KEY não configurada."
      );

      return Response.json(
        {
          error:
            "O serviço de envio ainda não está configurado."
        },
        { status: 500 }
      );
    }

    if (!env.CONTACT_TO_EMAIL) {
      console.error(
        "CONTACT_TO_EMAIL não configurado."
      );

      return Response.json(
        {
          error:
            "O destinatário do formulário não está configurado."
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // ENVIO PELO RESEND
    // --------------------------------------------------

    const resendResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${env.RESEND_API_KEY}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          from:
            env.CONTACT_FROM_EMAIL ||
            "QuintaCast <contato@quintacast.com.br>",

          to: [
            env.CONTACT_TO_EMAIL
          ],

          reply_to: email,

          subject:
            `QuintaCast — mensagem de ${name}`,

          text: `
Nova mensagem pelo site do QuintaCast

Nome:
${name}

E-mail:
${email}

Mensagem:
${message}
          `.trim(),

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #111;
              "
            >
              <h2>
                Nova mensagem pelo site do QuintaCast
              </h2>

              <p>
                <strong>Nome:</strong><br>
                ${escapeHtml(name)}
              </p>

              <p>
                <strong>E-mail:</strong><br>
                ${escapeHtml(email)}
              </p>

              <p>
                <strong>Mensagem:</strong><br>
                ${escapeHtml(message)
                  .replace(/\n/g, "<br>")}
              </p>

              <hr>

              <p
                style="
                  color: #777;
                  font-size: 12px;
                "
              >
                Enviado pelo formulário do
                quintacast.com.br
              </p>
            </div>
          `
        })
      }
    );

    const resendData =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Erro do Resend:",
        resendData
      );

      return Response.json(
        {
          error:
            "Não foi possível enviar a mensagem."
        },
        { status: 502 }
      );
    }

    console.log(
      "Mensagem enviada pelo QuintaCast:",
      {
        name,
        email,
        resendId: resendData.id
      }
    );

    return Response.json({
      success: true
    });

  } catch (error) {
    console.error(
      "Erro no formulário:",
      error
    );

    return Response.json(
      {
        error:
          "Erro ao processar mensagem."
      },
      { status: 500 }
    );
  }
}


// ======================================================
// SEGURANÇA DO HTML DO E-MAIL
// ======================================================

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}