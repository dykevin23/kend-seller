import { redirect } from "react-router";
import type { Route } from "./+types/logout-page";
import { makeSSRClient } from "~/supa-client";

const logout = async (request: Request) => {
  const { client, headers } = makeSSRClient(request);
  await client.auth.signOut({ scope: "global" });
  return redirect("/auth/login", { headers });
};

export const action = async ({ request }: Route.ActionArgs) => logout(request);

// POST(Form 제출) 뿐 아니라 GET으로 접근해도(새로고침, 직접 접근 등) 동일하게 처리
export const loader = async ({ request }: Route.LoaderArgs) => logout(request);
