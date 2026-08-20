const RSS_URL =
  "https://anchor.fm/s/11621a644/podcast/rss";

const CONTACT_EMAIL = "marceloppps@gmail.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * Aliases da página de contato
     */

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

    /*
     * RSS
     */

    if (url.pathname === "/api/feed") {
      try {
        const response = await fetch(RSS_URL, {
          headers: {
            "User-Agent": "QuintaCast/1.0"
          }
        });

        if (!response.ok) {
          return new Response(
            "Não foi possível carregar o feed.",
            {
              status: 502
            }
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
      } catch {
        return new Response(
          "Erro ao carregar RSS.",
          {
            status: 500
          }
        );
      }
    }

    /*
     * Contato
     */

    if (
      url.pathname === "/api/contact" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();
        const message = String(body.message || "").trim();

        /*
         * Honeypot anti-spam.
         * Bots normalmente preenchem esse campo escondido.
         */

        if (body.website) {
          return Response.json({
            success: true
          });
        }

        if (!name || !email || !message) {
          return Response.json(
            {
              error:
                "Preencha nome, e-mail e mensagem."
            },
            {
              status: 400
            }
          );
        }

        if (
          name.length > 100 ||
          email.length > 200 ||
          message.length > 5000
        ) {
          return Response.json(
            {
              error: "Mensagem muito grande."
            },
            {
              status: 400
            }
          );
        }

        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          return Response.json(
            {
              error: "E-mail inválido."
            },
            {
              status: 400
            }
          );
        }

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
                "QuintaCast <contato@SEU-DOMINIO.com>",

              to: [CONTACT_EMAIL],

              reply_to: email,

              subject:
                `QuintaCast — mensagem de ${name}`,

              text:
`Nova mensagem pelo site do QuintaCast

Nome: ${name}
E-mail: ${email}

Mensagem:

${message}`
            })
          }
        );

        if (!resendResponse.ok) {
          const error =
            await resendResponse.text();

          console.error(
            "Resend error:",
            error
          );

          return Response.json(
            {
              error:
                "Não foi possível enviar a mensagem."
            },
            {
              status: 502
            }
          );
        }

        return Response.json({
          success: true
        });
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            error:
              "Erro ao processar mensagem."
          },
          {
            status: 500
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};