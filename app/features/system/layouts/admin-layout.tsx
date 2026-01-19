import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/admin-layout";
import { makeSSRClient } from "~/supa-client";
import { getUserById } from "~/features/users/queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  const profile = await getUserById(client, { id: user.id });

  if (!profile || profile.role !== "administrator") {
    // admin이 아니면 홈으로 리다이렉트
    return redirect("/", { headers });
  }

  return null;
};

export default function AdminLayout() {
  return <Outlet />;
}
