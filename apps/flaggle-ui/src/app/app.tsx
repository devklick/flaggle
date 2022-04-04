import {
	Country,
	CreateGameResponse,
	Flag,
	Guess,
} from '@flaggle/flaggle-api-schemas';
import flaggleApiService from '@flaggle/flaggle-api-service';
import React, { useEffect, useRef, useState } from 'react';
import CountrySelector from '../assets/components/CountrySelector';

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
			<div
				className="flag-grid"
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 1fr)',
					gridTemplateRows: 'repeat(4, 1fr)',
					width: 'fit-content',
					height: 'fit-content',
				}}
			>
				{flag &&
					flag.chunks
						.sort(
							(a, b) =>
								a.position.y - b.position.y ||
								a.position.x - b.position.x
						)
						.map((chunk) => {
							if (chunk.revealed)
								return (
									<img
										className="flag-chunk"
										itemType=""
										alt={`x${chunk.position.x}y${chunk.position.y}`}
										src={`../assets/flag-chunks/${flag.externalRef}/${chunk.externalRef}.${chunk.fileType}`}
									/>
								);
							return (
								<div
									style={{
										background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><path d='M100 0 L0 100 ' stroke='darkgrey' stroke-width='1'/><path d='M0 0 L100 100 ' stroke='darkgrey' stroke-width='1'/></svg>"`,
										backgroundColor: 'grey',
										backgroundRepeat: 'no-repeat',
										backgroundPosition: 'center center',
										backgroundSize: '100% 100%, auto',
									}}
								></div>
							);
						})}
			</div>
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
