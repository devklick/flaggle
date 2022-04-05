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
import GuessList from '../assets/components/GuessList';

type GameType = Pick<CreateGameResponse, 'gameId' | 'playerId'>;

export const App = () => {
	/**
	 * A map to access the Country object using it's ID as the key.
	 */
	const countryMap = useRef<Map<string, Country>>(new Map());

	/**
	 * Whether or not the player has correctly guessed the cuntry the flag belongs to.
	 */
	const [correct, setCorrect] = useState<boolean>(false);

	const [game, setGame] = useState<GameType | null>(null);

	const [flag, setFlag] = useState<Flag>({
		chunks: [],
		externalRef: '',
		fileType: 'none',
	});
	// prettier-ignore
	const [countries, setCountries] = useState<Country[]>([]);
	const [currentSelection, setCurrentSelection] = useState<Country | null>(
		null
	);
	const [guesses, setGuesses] = useState<Guess[]>([]);

	useEffect(() => {
		const getGame = async () => {
			const game = await flaggleApiService.createGame({
				playerId: undefined, // TODO: Add in context that handles local storage of player ID
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
		setCurrentSelection(null);
	};

	return (
		<div>
			<FlagGrid flag={flag} />
			<CountrySelector
				countries={countries}
				disabledCountryIds={guesses.map((g) => g.countryId)}
				onSelectedCountryChanged={setCurrentSelection}
				selectedCountry={currentSelection}
			/>
			<button onClick={handleClick}>Submit</button>
			{correct && <div>YOU GOT IT RIGHT!</div>}
			<GuessList guesses={guesses} countryMap={countryMap.current} />
		</div>
	);
};

export default App;
