import { Country } from '@flaggle/flaggle-api-schemas';
import Select from 'react-select';

type SelectValue = {
	label: string;
	value: string;
};

export interface CountrySelectorProps {
	countries: Country[];
	disabledCountryIds: string[];
	selectedCountry: Country | null;
	onSelectedCountryChanged: (selectedCountry: Country) => void;
}
const CountrySelector: React.FC<CountrySelectorProps> = (props) => {
	return (
		<div>
			<Select
				value={
					props.selectedCountry && {
						label: props.selectedCountry.name,
						value: props.selectedCountry.countryId,
					}
				}
				options={props.countries.map(
					(c): SelectValue => ({ label: c.name, value: c.countryId })
				)}
				isOptionDisabled={(o) =>
					props.disabledCountryIds.includes(o.value)
				}
				onChange={(e) =>
					e &&
					props.onSelectedCountryChanged({
						countryId: e.value,
						name: e.label,
					})
				}
			/>
		</div>
	);
};

export default CountrySelector;
