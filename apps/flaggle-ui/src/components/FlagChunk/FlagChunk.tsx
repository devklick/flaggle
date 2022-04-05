import { FileType } from '@flaggle/flaggle-api-schemas';

interface FlagChunkProps {
	x: number;
	y: number;
	revealed: boolean;
	externalRef?: string;
	flagExternalRef: string;
	fileType?: FileType;
}
const FlagChunk: React.FC<FlagChunkProps> = (props) => {
	const unrevealedChunk = (
		<div
			style={{
				background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><path d='M100 0 L0 100 ' stroke='darkgrey' stroke-width='1'/><path d='M0 0 L100 100 ' stroke='darkgrey' stroke-width='1'/></svg>"`,
				backgroundColor: 'grey',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center center',
				backgroundSize: '100% 100%, auto',
			}}
		></div>
	);

	const getFlagChunkImage = (
		flagExternalRef: string,
		x: number,
		y: number,
		chunkExternalRef?: string,
		fileType?: FileType
	) => (
		<img
			className="flag-chunk"
			alt={`x${x}y${y}`}
			src={`../assets/flag-chunks/${flagExternalRef}/${chunkExternalRef}.${fileType}`}
		/>
	);

	return props.revealed
		? getFlagChunkImage(
				props.flagExternalRef,
				props.x,
				props.y,
				props.externalRef,
				props.fileType
		  )
		: unrevealedChunk;
};
export default FlagChunk;
