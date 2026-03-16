// Video embed component with lazy loading and schema markup

interface VideoEmbedProps {
  videoId: string;
  title: string;
  description?: string;
}

export function VideoEmbed({ videoId, title, description }: VideoEmbedProps) {
  return (
    <div className="my-8">
      <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-lg bg-slate-900">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground text-center italic">{description}</p>
      )}
    </div>
  );
}

export function videoSchema(video: {
  name: string;
  description: string;
  videoId: string;
  uploadDate: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl: `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
    uploadDate: video.uploadDate,
    duration: video.duration || "PT10M",
    publisher: {
      "@type": "Organization",
      name: "Doge Consulting Group Limited",
      logo: { "@type": "ImageObject", url: "https://doge-consulting.com/doge-logo.png" },
    },
  };
}
