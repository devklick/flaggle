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

	const [gameState, setGameState] = useState<
		'loading' | 'playing' | 'correct' | 'no-more-guesses'
	>('loading');

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

	const loaded = countries.length > 0 && game !== null;
	useEffect(() => {
		loaded && setGameState('playing');
	}, [loaded]);

	useEffect(() => {
		console.log(
			'guesses',
			guesses.length,
			'chunks',
			flag.chunks.length,
			'state',
			gameState
		);
		const usedAllGuesses =
			guesses.length === flag.chunks.length && gameState !== 'correct';
		usedAllGuesses && setGameState('no-more-guesses');
	}, [flag.chunks.length, gameState, guesses.length]);

	const handleClick = async () => {
		if (!game || !currentSelection) return;

		const result = await flaggleApiService.submitAnswer({
			gameId: game.gameId,
			countryId: currentSelection.countryId,
		});

		setFlag(result.flag);
		setGuesses(result.guesses);
		result.correct && setGameState('correct');
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
				disabled={gameState !== 'playing'}
			/>
			<button onClick={handleClick}>Submit</button>
			{gameState === 'correct' && <div>YOU GOT IT RIGHT!</div>}
			<GuessList guesses={guesses} countryMap={countryMap.current} />
		</div>
	);
};

export default App;
