const databaseUrl = process.env.DATABASE_URL;
const publicApiUrl = process.env["PUBLIC_API_URL"];
const missingToken = process.env.MISSING_TOKEN;

export function config() {
  return { databaseUrl, publicApiUrl, missingToken };
}
