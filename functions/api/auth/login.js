export async function onRequest(context) {
  const { env } = context;
  const clientId = env.GITHUB_CLIENT_ID;
  const url = new URL(context.request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;

  return Response.redirect(githubAuthUrl, 302);
}
