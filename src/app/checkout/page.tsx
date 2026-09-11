import { redirect } from "next/navigation";

export default async function CheckoutRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const queryString = new URLSearchParams();

  Object.entries(resolvedParams).forEach(([k, v]) => {
    if (typeof v === "string") queryString.set(k, v);
    else if (Array.isArray(v)) v.forEach((item) => queryString.append(k, item));
  });

  const query = queryString.toString();
  redirect(query ? `/booking?${query}` : "/booking");
}
