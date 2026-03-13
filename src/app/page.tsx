import FreezerGrid from "@/components/FreezerGrid";
import { getItems } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getItems();

  return <FreezerGrid initialItems={items} />;
}
