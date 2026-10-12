import HomeExperience from "@/components/HomeExperience";
import { getPassages } from "@/lib/passages";

export default async function Home() {
  const passages = await getPassages();
  return <HomeExperience passages={passages} />;
}
