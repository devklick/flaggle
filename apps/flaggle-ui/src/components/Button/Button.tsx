export type ButtonType = 'primary' | 'secondary';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ButtonProps {
	text: string;
	onClick: () => void;
	disabled: boolean;
	type: ButtonType;
}

const Button = ({ text, onClick, disabled, type }: ButtonProps) => {
	return (
		<button
			className={`button-${type}`}
			onClick={onClick}
			disabled={disabled}
		>
			{text}
		</button>
	);
};

export default Button;
