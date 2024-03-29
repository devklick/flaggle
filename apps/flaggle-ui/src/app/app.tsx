import { useEffect, useRef, useState } from 'react';
import {
	Country,
	CreateGameResponse,
	Flag,
	GameStatus,
	Guess,
} from '@flaggle/flaggle-api-schemas';
import flaggleApiService from '@flaggle/flaggle-api-service';

import ButtonContainer from '../components/ButtonContainer';
import CountrySelector from '../components/CountrySelector';
import FlagGrid from '../components/FlagGrid';
import GuessList from '../components/GuessList';
import Header from '../components/Header';
import Name from '../components/CountryName';

type GameType = Pick<CreateGameResponse, 'gameId' | 'playerId'>;
const defaultFlagValue: Flag = {
	chunks: [],
	externalRef: '',
	fileType: 'none',
};
const defaultGameType: GameType = {
	gameId: '',
	playerId: '',
};

export const App = () => {
	/**
	 * The list of countries that will be displayed in the select list.
	 */
	const [countries, setCountries] = useState<Country[]>([]);

	/**
	 * A map to access the Country object using it's ID as the key.
	 */
	const countryMap = useRef<Map<string, Country>>(new Map());

	/**
	 * The current state of the game.
	 */
	const [gameState, setGameState] = useState<GameStatus>('in-progress');

	/**
	 * The constant game data - doesnt change after initially loaded.
	 */
	const [game, setGame] = useState<GameType>(defaultGameType);

	/**
	 * The flag thats being displayed.
	 * Updated after every guess with the latest revealed flag chunk.
	 */
	const [flag, setFlag] = useState<Flag>(defaultFlagValue);

	/**
	 * The guesses that the player as made.
	 */
	const [guesses, setGuesses] = useState<Guess[]>([]);

	/**
	 * The country that he player has currently selected as their guess.
	 */
	const [selectedCountry, setSelectedCountry] = useState<Country | null>(
		null
	);

	const [countryName, setCountryName] = useState<string | null>(null);

	// Fetch the list of countries
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

	// Fetch the initial game data
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

	// Update the game status once everything is loaded.
	// const loaded = countries.length > 0 && game !== null;
	// useEffect(() => {
	// 	loaded && setGameState('');
	// }, [loaded]);

	// Update the game status once all guesses have been used and were not correct
	// prettier-ignore
	// const usedAllGuesses = guesses.length === flag.chunks.length && gameState !== 'correct';
	// useEffect(() => {
	// 	usedAllGuesses && setGameState('no-more-guesses');
	// }, [usedAllGuesses]);

	const handleSubmitAnswer = async () => {
		if (!selectedCountry) return;
		return await apiCall(selectedCountry.countryId);
	};

	const handleGetNextChunk = async () => {
		return await apiCall(undefined, true);
	};

	const handleGiveUp = async () => {
		await apiCall(undefined, false, true);
		// setGameState('no-more-guesses');
	};

	const apiCall = async (
		countryId: string | undefined,
		skipAndGetNextChunk = false,
		giveUp = false
	) => {
		if (!game) return;
		const result = await flaggleApiService.submitAnswer({
			gameId: game.gameId,
			countryId,
			skipAndGetNextChunk,
			giveUp,
		});

		setFlag(result.flag);
		setGuesses(result.guesses);
		setGameState(result.status);
		setCountryName(result.countryName ?? null);
		setSelectedCountry(null);
	};

	return (
		<div className="app">
			<Header />
			<div className="content">
				<FlagGrid flag={flag} />
				<Name value={countryName} />
				<CountrySelector
					countries={countries}
					disabledCountryIds={guesses.map((g) => g.countryId)}
					onSelectedCountryChanged={setSelectedCountry}
					selectedCountry={selectedCountry}
					disabled={gameState !== 'in-progress'}
				/>
				<ButtonContainer
					buttons={[
						{
							text: 'Submit',
							onClick: handleSubmitAnswer,
							disabled:
								gameState !== 'in-progress' || !selectedCountry,
							type: 'primary',
						},
						{
							text: 'Get next chunk',
							onClick: handleGetNextChunk,
							disabled: flag.chunks.every((c) => c.revealed),
							type: 'secondary',
						},
						{
							text: 'Give up',
							onClick: handleGiveUp,
							disabled: gameState !== 'in-progress',
							type: 'secondary',
						},
					]}
				/>
				<GuessList guesses={guesses} countryMap={countryMap.current} />
			</div>
		</div>
	);
};

export default App;
