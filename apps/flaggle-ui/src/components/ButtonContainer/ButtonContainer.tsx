import React from 'react';

type Button = {
	text: string;
	disabled: boolean;
	onClick: () => void;
};
interface ButtonContainerProps {
	primaryButtons: Button[];
	secondaryButtons: Button[];
}

const getButtons = (buttons: Button[]) =>
	buttons.map(({ onClick, disabled, text }) => (
		<button onClick={onClick} disabled={disabled}>
			{text}
		</button>
	));

const ButtonContainer: React.FC<ButtonContainerProps> = (props) => (
	<div className="button-container">
		<div className="button-container__primary-buttons">
			{getButtons(props.primaryButtons)}
		</div>
		<div className="button-container__secondary-buttons">
			{getButtons(props.secondaryButtons)}
		</div>
	</div>
);

export default ButtonContainer;
