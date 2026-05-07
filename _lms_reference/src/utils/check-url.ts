export const isYoutubeVideo = (url: string): boolean => {
	if (!url) {
		return false;
	}
	return /^(https?:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/g.test(url);
};

export const isFacebookVideo = (url: string): boolean => {
	if (!url) {
		return false;
	}
	return (
		/^(https?:\/\/)?((www\.)?fb\.watch)\/.+$/g.test(url) ||
		/^(https?:\/\/)?(www\.)?facebook\.com\/(watch\?v=|video\/)\d+/.test(url) ||
		/^(https?:\/\/)?((www\.)facebook\.com\/(?:video\.php\?v=\d+|.*?\/videos\/\d+))$/.test(
			url,
		)
	);
};

export function isImgUrl(url: string) {
	if (!url) {
		return false;
	}

	return /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url);
}
