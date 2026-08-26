export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // Krok 1: Jeśli brak kodu, przekieruj do logowania GitHub OAuth
  if (!code) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(url.origin + '/auth')}&scope=repo,user`;
    return Response.redirect(githubAuthUrl, 302);
  }

  // Krok 2: Wymiana kodu na token dostępu
  const tokenResponse = await fetch('https://github.com/login/oauth/access_ch', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'accept': 'json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const tokenData = await tokenResponse.json();
  const token = tokenData.access_token;

  // Krok 3: Odesłanie tokena do okna CMS za pomocą postMessage
  const script = `
    script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
            e.origin
          );
          window.close();
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })()
    </script>
  `;

  return new Response(script, {
    headers: { 'content-type': 'text/html;charset=UTF-8' }
  });
}
