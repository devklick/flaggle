import {
	Country,
	CreateGameResponse,
	FlagChunk,
} from '@flaggle/flaggle-api-schemas';
import flaggleApiService from '@flaggle/flaggle-api-service';
import React, { useEffect, useState } from 'react';
import Select, { ActionMeta, SingleValue } from 'react-select';

type SelectValue = {
	label: string;
	value: string;
};

type GameType = Pick<CreateGameResponse, 'gameId' | 'playerId'>;
export const App = () => {
	const [correct, setCorrect] = useState<boolean>(false);
	// prettier-ignore
	const [game, setGame] = useState<GameType|null>(null);
	const [flagChunks, setFlagChunks] = useState<FlagChunk[]>([]);
	// prettier-ignore
	const [countrySelectList, setCountrySelectList] = useState<SelectValue[]>([]);
	const [currentSelection, setCurrentSelection] = useState<Country | null>(
		null
	);
	const [guesses, setGuesses] = useState<
		{ countryId: string; correct: boolean }[]
	>([]);

	useEffect(() => {
		const getGame = async () => {
			const game = await flaggleApiService.createGame({
				playerId: undefined,
			});
			setGame(game);
			setFlagChunks(game.flagChunks);
		};
		getGame();
	}, []);

	useEffect(() => {
		const getCountries = async () => {
			const countries = await flaggleApiService.getCountries();
			setCountrySelectList(
				countries.map((c) => ({
					label: c.name,
					value: c.countryId,
				}))
			);
		};
		getCountries();
	}, []);

	const handleSelectionChange = (
		newSelection: SingleValue<SelectValue>,
		actionMeta: ActionMeta<SelectValue>
	) => {
		newSelection &&
			setCurrentSelection({
				countryId: newSelection.value,
				name: newSelection.label,
			});
	};

	const handleClick = async () => {
		if (!game || !currentSelection) return;

		const result = await flaggleApiService.submitAnswer({
			gameId: game.gameId,
			countryId: currentSelection.countryId,
		});

		setFlagChunks(result.flagChunks);
		setGuesses(result.guesses);
		setCorrect(result.correct);
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
				{flagChunks
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
									alt={`x${chunk.position.x}y${chunk.position.y}`}
									src={`../assets/flag-chunks/${chunk.externalRef}.png`}
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
			<div>
				<Select
					options={countrySelectList}
					onChange={handleSelectionChange}
				/>
				<button onClick={handleClick}>Submit</button>
			</div>
			{correct && <div>YOU GOT IT RIGHT!</div>}
			{guesses && guesses.length && (
				<ul>
					{guesses.map((guess) => {
						return <li>{guess.countryId}</li>;
					})}
				</ul>
			)}
		</div>
	);
};

export default App;
