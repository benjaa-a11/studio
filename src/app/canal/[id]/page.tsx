import { getChannelById, getChannelsByCategory } from "@/lib/actions";
import { notFound } from "next/navigation";
import ChannelView from "@/components/channel-view";

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const channel = await getChannelById(params.id);

  if (!channel) {
    notFound();
  }

  const relatedChannels = await getChannelsByCategory(channel.category, channel.id);
  
  return <ChannelView channel={channel} relatedChannels={relatedChannels} />;
}
