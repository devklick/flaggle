import React from 'react';
import Button from '../Button';
import { ButtonProps, ButtonType } from '../Button/Button';

type Button = {
	text: string;
	disabled: boolean;
	onClick: () => void;
	type: ButtonType;
};
interface ButtonContainerProps {
	buttons: ButtonProps[];
}

const getButtons = (buttons: Button[]) =>
	buttons.map(({ onClick, disabled, text, type }) =>
		Button({ disabled, onClick, text, type })
	);

const ButtonContainer: React.FC<ButtonContainerProps> = (props) => (
	<div className="button-container">
		<div className="button-container__primary-buttons">
			{getButtons(props.buttons.filter((b) => b.type === 'primary'))}
		</div>
		<div className="button-container__secondary-buttons">
			{getButtons(props.buttons.filter((b) => b.type === 'secondary'))}
		</div>
	</div>
);

export default ButtonContainer;
