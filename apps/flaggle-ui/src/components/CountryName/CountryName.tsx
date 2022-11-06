// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CountryNameProps {
	value: string | null;
}

const CountryName = (props: CountryNameProps) => {
	return <span className="name">{props.value}</span>;
};

export default CountryName;
