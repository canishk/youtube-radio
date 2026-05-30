export function extractVideoId(url) {

  if (!url) {
    return "";
  }

  const patterns = [

    /youtube\.com\/watch\?v=([^&]+)/,

    /youtu\.be\/([^?]+)/

  ];

  for (
    const pattern
    of patterns
  ) {

    const match =
      url.match(pattern);

    if (match) {

      return match[1];
    }
  }

  return url;
}

export function getThumbnailUrl(
  videoId
) {

  if (!videoId) {
    return "";
  }

  return (
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  );
}