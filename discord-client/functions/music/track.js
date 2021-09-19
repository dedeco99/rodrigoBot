const { getInfo } = require("ytdl-core");
const { createAudioResource, demuxProbe } = require("@discordjs/voice");
const { raw: ytdl } = require("youtube-dl-exec");

// eslint-disable-next-line no-empty-function
const noop = () => {};

class Track {
	constructor({ url, title, onStart, onFinish, onError }) {
		this.url = url;
		this.title = title;
		this.onStart = onStart;
		this.onFinish = onFinish;
		this.onError = onError;
	}

	/**
	 * Creates an AudioResource from this Track.
	 */
	createAudioResource() {
		return new Promise((resolve, reject) => {
			const process = ytdl(
				this.url,
				{
					o: "-",
					q: "",
					f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
					r: "100K",
				},
				{ stdio: ["ignore", "pipe", "ignore"] },
			);
			if (!process.stdout) {
				reject(new Error("No stdout"));
				return;
			}
			const stream = process.stdout;
			const onError = error => {
				if (!process.killed) process.kill();
				stream.resume();
				reject(error);
			};
			process
				.once("spawn", () => {
					demuxProbe(stream)
						.then(probe => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
						.catch(onError);
				})
				.catch(onError);
		});
	}

	/**
	 * Creates a Track from a video URL and lifecycle callback methods.
	 *
	 * @param url The URL of the video
	 * @param methods Lifecycle callbacks
	 * @returns The created Track
	 */
	static async from(url, methods) {
		const info = await getInfo(url);

		// The methods are wrapped so that we can ensure that they are only called once.
		const wrappedMethods = {
			onStart() {
				wrappedMethods.onStart = noop;
				methods.onStart();
			},
			onFinish() {
				wrappedMethods.onFinish = noop;
				methods.onFinish();
			},
			onError(error) {
				wrappedMethods.onError = noop;
				methods.onError(error);
			},
		};

		return new Track({
			title: info.videoDetails.title,
			url,
			...wrappedMethods,
		});
	}
}

module.exports = { Track };
