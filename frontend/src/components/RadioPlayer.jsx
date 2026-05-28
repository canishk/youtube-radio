import { useRef } from "react";
import YouTube from "react-youtube"

function RadioPlayer({
    videoId
}) {
    const playerRef = useRef(null);

    const opts = {
        height: "1",
        width: "1",
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            enablejsapi: 1
        }
    }

    const onReady = (event) => {
        playerRef.current = event.target;
    }

    return (
    <div style={{ height: "0", width: "0", overflow: "hidden" }}>
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
      />
    </div>
  );
}

export default RadioPlayer;