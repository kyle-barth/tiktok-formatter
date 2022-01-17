const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfprobePath(ffprobePath);
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const videos = getVideosForConversion();
if (videos.length > 0) {
  videos.forEach(async (video, i) => {
    const newTitle = `${video.replace(".mp4", "")}-9x16.mp4`;

    const { mediaWidth, mediaHeight } = await getVideoDimensions(video);
    // Currently only supports widescreen clips
    if (mediaWidth && mediaHeight && mediaWidth >= mediaHeight) {
      const mediaAspectRatio = mediaHeight / mediaWidth;
      const newWidth = mediaHeight * mediaAspectRatio;
      const cropFromX = mediaWidth / 2 - newWidth / 2;

      ffmpeg(video)
        .videoFilter([
          {
            filter: "crop",
            options: {
              w: newWidth,
              h: mediaHeight,
              x: cropFromX,
              y: 0,
            },
          },
          {
            filter: "eq",
            options: "brightness=0.1:saturation=2",
          },
        ])
        .on("end", () => {
          console.log("great success!");
        })
        .output(newTitle)
        .run();
    } else {
      console.log("Video dimensions not detected!");
    }
  });
} else {
  console.log("No videos detected!");
}

function getVideosForConversion() {
  const files = fs.readdirSync("./");
  const path = require("path");
  let videos = [];

  for (let i in files) {
    if (path.extname(files[i]) === ".mp4") {
      videos.push(files[i]);
    }
  }

  return videos;
}

async function getVideoDimensions(video) {
  let mediaWidth = 0,
    mediaHeight = 0;

  await new Promise((res) => {
    ffmpeg.ffprobe(video, (err, metadata) => {
      if (err) {
        res({ mediaWidth: 0, mediaHeight: 0 });
      } else {
        const mediaWidth = metadata.streams[0].width;
        const mediaHeight = metadata.streams[0].height;

        if (!mediaWidth || !mediaHeight) {
          res({ mediaWidth: 0, mediaHeight: 0 });
        } else {
          res({ mediaWidth, mediaHeight });
        }
      }
    });
  }).then((metadata) => {
    mediaWidth = metadata.mediaWidth;
    mediaHeight = metadata.mediaHeight;
  });

  return { mediaWidth, mediaHeight };
}
