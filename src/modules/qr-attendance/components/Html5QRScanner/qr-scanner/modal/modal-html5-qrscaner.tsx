import { memo, PropsWithChildren, useCallback, useState } from "react";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import { Iconify } from "@onair/minimal-ui/iconify";
import Html5QrcodeScannerPlugin, {
	Html5QrCodeScannerPluginProps,
} from "../html5-qrcode-scanner-plugin";

type ShadeBoxDimension = {
	width: number;
	height: number;
};
export interface ModalHtml5QrScanerProps extends PropsWithChildren {
	id?: string;
	open?: boolean;
	onClose?: () => void;
	onCodeScannedSuccess: Html5QrCodeScannerPluginProps["onCodeScanedSuccess"];
	onCodeScannedError?: Html5QrCodeScannerPluginProps["onCodeScanedError"];
	headerNote?: string;
	render?: (shadeBoxDimension?: ShadeBoxDimension) => React.ReactNode;
}
const ModalHtml5QrScanerComp: React.FC<ModalHtml5QrScanerProps> = memo(
	({
		open = false,
		id,
		onClose,
		onCodeScannedSuccess,
		onCodeScannedError,
		children,
		headerNote = "Vui lòng đặt mã QR của bạn vào khung scan QR.",
		render,
	}) => {
		const [shadeBoxSize, setShadeBoxSize] = useState<ShadeBoxDimension>();
		const watchingShadeBoxSize = useCallback(
			(size: { width: number; height: number }) => {
				setShadeBoxSize(size);
			},
			[setShadeBoxSize],
		);
		return (
			<Modal component="div" open={open} onClose={onClose}>
				<Box component="div" className="w-full h-full bg-white">
					<IconButton
						onClick={onClose}
						className="absolute top-2 right-2 !text-white z-20"
					>
						<Iconify icon="line-md:close" className="w-10 h-10" />
					</IconButton>
					<Box component="div" className="w-full h-full">
						{shadeBoxSize && (
							<Box
								component="div"
								className="box-content-top absolute left-1/2 top-1/2 z-10 w-full max-w-[600px] rounded-md px-3 py-2"
								sx={{
									transform: `translate(-50%, calc(50% - ${shadeBoxSize.height / 2 + 200}px))`,
								}}
							>
								<Typography
									component="p"
									className="text-lg lg:text-2xl font-semibold bg-white/80 rounded-md px-3 py-2 w-fit mx-auto text-center"
								>
									{headerNote}
								</Typography>
							</Box>
						)}
						<Html5QrcodeScannerPlugin
							id={id}
							config={{ fps: 2 }}
							onCodeScanedSuccess={onCodeScannedSuccess}
							onCodeScanedError={onCodeScannedError}
							onWatchShadeBoxSize={watchingShadeBoxSize}
						/>
						<Box component="div" className="relative z-10">
							{render?.(shadeBoxSize)}
						</Box>
					</Box>
				</Box>
			</Modal>
		);
	},
);

const useModalHtml5QrScaner = () => {
	const [open, setOpen] = useState(false);

	const openModal = useCallback(() => {
		setOpen(true);
	}, []);
	const closeModal = useCallback(() => {
		setOpen(false);
	}, []);
	return {
		openModal,
		closeModal,
		open,
	};
};

const ModalHtml5QrScaner: typeof ModalHtml5QrScanerComp & {
	useModal: typeof useModalHtml5QrScaner;
} = Object.assign(ModalHtml5QrScanerComp, { useModal: useModalHtml5QrScaner });

export default ModalHtml5QrScaner;
