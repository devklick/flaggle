import React from 'react';

type Button = {
	text: string;
	disabled: boolean;
	onClick: () => void;
};
interface ButtonContainerProps {
	buttons: Button[];
}

const ButtonContainer: React.FC<ButtonContainerProps> = (props) => (
	<div>
		{props.buttons.map(({ onClick, disabled, text }) => (
			<button onClick={onClick} disabled={disabled}>
				{text}
			</button>
		))}
	</div>
);

export default ButtonContainer;
