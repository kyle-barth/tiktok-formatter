const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);
const videos = getVideosForConversion();

if (videos.length > 0) {
  videos.forEach(async (video, i) => {
    const newTitle = `${video}-9x16.mp4`;

    // If I can figure out how to get the vid dims
    // we can swap this stuff out
    // Currently Hardcoded for 1920 x 1080 clips
    const oldWidth = 1920;
    const newWidth = 1080 * 0.5625;
    const cropFromX = oldWidth / 2 - newWidth / 2;

    ffmpeg(video)
      .videoFilter([
        {
          filter: "crop",
          options: {
            w: 607,
            h: 1080,
            x: cropFromX,
            y: 0,
          },
        },
      ])
      .on("end", () => {
        console.log("great success!");
      })
      .output(newTitle)
      .run();
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
