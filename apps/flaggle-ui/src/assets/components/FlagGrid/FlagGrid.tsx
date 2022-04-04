import { Flag } from '@flaggle/flaggle-api-schemas';
import React from 'react';
import FlagChunk from '../FlagChunk';

interface FlagGridProps {
	flag: Flag;
}

const FlagGrid: React.FC<FlagGridProps> = (props) => {
	const flagChunks = props.flag.chunks
		.sort(
			(a, b) => a.position.y - b.position.y || a.position.x - b.position.x
		)
		.map((chunk) => (
			<FlagChunk
				flagExternalRef={props.flag.externalRef}
				x={chunk.position.x}
				y={chunk.position.y}
				{...chunk}
			/>
		));

	return (
		<div
			className="flag-grid"
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 1fr)',
				gridTemplateRows: 'repeat(4, 1fr)',
				width: 'fit-content',
				height: 'fit-content',
			}}
		>
			{flagChunks}
		</div>
	);
};
export default FlagGrid;
