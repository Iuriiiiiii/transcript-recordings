export function authenticate(request: Request) {
  const existsAuthorization: boolean = request.headers.has("authorization");

  if (!existsAuthorization) {
    throw new Error("Invalid authorization.");
  }

  const authorization = request.headers.get("authorization");

  if (!authorization || typeof authorization !== "string") {
    throw new Error("Invalid authorization.");
  }

  if (authorization !== process.env.AUTHORIZATION_KEY) {
    throw new Error("Invalid authorization.");
  }
}
