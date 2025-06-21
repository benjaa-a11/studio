// This layout applies a dark theme wrapper for the channel playback pages.
export default function ChannelPlaybackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark">{children}</div>;
}
