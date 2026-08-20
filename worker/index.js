if (
  url.pathname === "/api/contact" &&
  request.method === "POST"
) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (body.website) {
      return Response.json({
        success: true
      });
    }

    if (!name || !email || !message) {
      return Response.json(
        {
          error: "Preencha nome, e-mail e mensagem."
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

    console.log("Mensagem recebida:", {
      name,
      email,
      message
    });

    return Response.json({
      success: true,
      mode: "development"
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Erro ao processar mensagem."
      },
      {
        status: 500
      }
    );
  }
}