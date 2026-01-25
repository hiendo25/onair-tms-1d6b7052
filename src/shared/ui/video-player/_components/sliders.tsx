import { useState } from "react";
import { TimeSlider, VolumeSlider } from "@vidstack/react";

export const Volume = () => {
	return (
		<VolumeSlider.Root>
			<VolumeSlider.Track className="h-1.5">
				<VolumeSlider.TrackFill className="bg-media-brand h-1.5 bg-[#0050FF]" />
			</VolumeSlider.Track>
			<VolumeSlider.Thumb />
		</VolumeSlider.Root>
	);
};

export const Time = () => {
	const [showPreview, setShowPreview] = useState(false);

	return (
		<TimeSlider.Root
			className="vds-time-slider vds-slider"
			onMouseEnter={() => setShowPreview(true)}
			onMouseLeave={() => setShowPreview(false)}
		>
			<TimeSlider.Track className="vds-slider-track h-1.5" />
			<TimeSlider.TrackFill className="vds-slider-track-fill vds-slider-track h-1.5 bg-[#0050FF]" />
			<TimeSlider.Progress
				className="vds-slider-progress vds-slider-track h-1.5 bg-[#F5F5F5] "
			/>
			<TimeSlider.Thumb className="vds-slider-thumb bg-[#0050FF] h-5 w-5" />
			{showPreview && (
				<TimeSlider.Preview>
					<TimeSlider.Value className="text-white shadow-lg" />
				</TimeSlider.Preview>
			)}
		</TimeSlider.Root>
	);
};

export const TimeMobile = () => {
	return (
		<TimeSlider.Root className="vds-time-slider vds-slider group relative pointer-events-auto h-3">
			<TimeSlider.Track className="vds-slider-track h-1.5" />
			<TimeSlider.TrackFill className="vds-slider-track-fill vds-slider-track h-1.5 bg-[#0050FF]" />
			<TimeSlider.Progress
				className="vds-slider-progress vds-slider-track h-1.5 bg-[#F5F5F5] "
			/>
			<TimeSlider.Thumb className="vds-slider-thumb opacity-0 group-hover:opacity-100 bg-[#0050FF] h-5 w-5" />
		</TimeSlider.Root>
	);
};
