const RSS_URL =
  "https://anchor.fm/s/11621a644/podcast/rss";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Aliases de contato
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

    // RSS
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
        console.error("Erro ao carregar RSS:", error);

        return new Response(
          "Erro ao carregar RSS.",
          { status: 500 }
        );
      }
    }

    // Contato placeholder
    if (
      url.pathname === "/api/contact" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();
        const message = String(body.message || "").trim();

        // Honeypot
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
            { status: 400 }
          );
        }

        if (
          name.length > 100 ||
          email.length > 200 ||
          message.length > 5000
        ) {
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

        console.log(
          "Mensagem recebida pelo QuintaCast:",
          {
            name,
            email,
            message
          }
        );

        return Response.json({
          success: true,
          mode: "placeholder"
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

    // Assets estáticos
    return env.ASSETS.fetch(request);
  }
};