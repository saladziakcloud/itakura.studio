export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Błąd: Brak kodu autoryzacji z GitHub", { status: 400 });
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  // Wymiana kodu na token dostępu
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "json",
      "accept": "json",
      "user-agent": "cloudflare-pages-decap-cms"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return new Response("Błąd autoryzacji z GitHubem: Nie udało się pobrać tokenu", { status: 400 });
  }

  // Skrypt zwrotny dla Decap CMS przekazujący token do okna przeglądarke
  const html = `
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>Autoryzacja...</title></head>
      <body>
        <script>
          (function() {
            function receiveMessage(e) {
              console.log("receiveMessage %o", e);
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token: accessToken })}',
                e.origin
              );
              window.close();
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })()
        </script>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { "content-type": "text/html;charset=UTF-8" }
  });
}
