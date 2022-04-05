import { Country, Guess } from '@flaggle/flaggle-api-schemas';
import React from 'react';

interface GuessListProps {
	guesses: Guess[];
	countryMap: Map<string, Country>;
}
const GuessList: React.FC<GuessListProps> = (props) => (
	<ol reversed>
		{props.guesses
			.sort((a, b) => b.guessNumber - a.guessNumber)
			.map((guess) => {
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
	</ol>
);

export default GuessList;
