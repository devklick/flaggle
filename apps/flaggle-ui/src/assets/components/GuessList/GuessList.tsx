import { Country, Guess } from '@flaggle/flaggle-api-schemas';
import React from 'react';

interface GuessListProps {
	guesses: Guess[];
	countryMap: Map<string, Country>;
}
const GuessList: React.FC<GuessListProps> = (props) => {
	return (
		<ul>
			{props.guesses.map((guess) => {
				return (
					<li
						style={{
							backgroundColor: guess.correct ? 'green' : 'red',
						}}
					>
						{props.countryMap.has(guess.countryId) &&
							props.countryMap.get(guess.countryId)?.name}
					</li>
				);
			})}
		</ul>
	);
};

export default GuessList;
