import {
	Country,
	CreateGameResponse,
	Flag,
	Guess,
} from '@flaggle/flaggle-api-schemas';
import flaggleApiService from '@flaggle/flaggle-api-service';
import React, { useEffect, useRef, useState } from 'react';
import CountrySelector from '../assets/components/CountrySelector';
import FlagGrid from '../assets/components/FlagGrid';

type GameType = Pick<CreateGameResponse, 'gameId' | 'playerId'>;

export const App = () => {
	/**
	 * A map to access the Country object using it's ID as the key.
	 */
	const countryMap = useRef<Map<string, Country> | null>(null);

	/**
	 * Whether or not the player has correctly guessed the cuntry the flag belongs to.
	 */
	const [correct, setCorrect] = useState<boolean>(false);

	const [game, setGame] = useState<GameType | null>(null);

	const [flag, setFlag] = useState<Flag | null>(null);
	// prettier-ignore
	const [countries, setCountries] = useState<Country[]>([]);
	const [currentSelection, setCurrentSelection] = useState<Country | null>(
		null
	);
	const [guesses, setGuesses] = useState<Guess[]>([]);

	useEffect(() => {
		const getGame = async () => {
			const game = await flaggleApiService.createGame({
				playerId: undefined,
			});
			setGame(game);
			setFlag(game.flag);
		};
		getGame();
	}, []);

	useEffect(() => {
		const getCountries = async () => {
			const countries = await flaggleApiService.getCountries();
			setCountries(countries);
			countryMap.current = new Map();
			countries.forEach((c) => {
				countryMap.current?.set(c.countryId, c);
			});
		};
		getCountries();
	}, []);

	const handleClick = async () => {
		if (!game || !currentSelection) return;

		const result = await flaggleApiService.submitAnswer({
			gameId: game.gameId,
			countryId: currentSelection.countryId,
		});

		setFlag(result.flag);
		setGuesses(result.guesses);
		result.correct !== correct && setCorrect(result.correct);
	};

	return (
		<div>
			{flag && <FlagGrid flag={flag} />}
			<CountrySelector
				countries={countries}
				disabledCountryIds={guesses.map((g) => g.countryId)}
				onSelectedCountryChanged={setCurrentSelection}
			/>
			<button onClick={handleClick}>Submit</button>
			{correct && <div>YOU GOT IT RIGHT!</div>}
			{guesses && guesses.length && (
				<ul>
					{guesses.map((guess) => {
						return (
							<li
								style={{
									backgroundColor: guess.correct
										? 'green'
										: 'red',
								}}
							>
								{countryMap.current?.has(guess.countryId) &&
									countryMap.current.get(guess.countryId)
										?.name}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default App;
