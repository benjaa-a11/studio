import { getRadioById, getRadios } from "@/lib/actions";
import RadioView from "@/components/radio-view";
import RadioNotFound from "@/components/radio-not-found";
import { RadiosProvider } from "@/hooks/use-radios";

export const revalidate = 0;

export default async function RadioPlayerPage({ params }: { params: { id: string } }) {
  const [radio, allRadios] = await Promise.all([
    getRadioById(params.id),
    getRadios()
  ]);

  if (!radio) {
    return <RadioNotFound />;
  }
  
  return (
    <RadiosProvider radios={allRadios}>
      <RadioView radio={radio} allRadios={allRadios} />
    </RadiosProvider>
  );
}
