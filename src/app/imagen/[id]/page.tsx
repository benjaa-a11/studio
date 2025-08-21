
import { getFeaturedImageById } from "@/lib/actions";
import ImageView from "@/components/image-view";
import ImageNotFound from "@/components/image-not-found";

export const revalidate = 0; // Force dynamic rendering

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const image = await getFeaturedImageById(params.id);

  if (!image) {
    return <ImageNotFound />;
  }

  return (
    <ImageView image={image} />
  );
}
