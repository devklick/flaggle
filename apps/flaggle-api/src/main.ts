import * as express from 'express';
import gameRouter from './routers/game-router';

const port = process.env.port || 3333;
const app = express();

//app.use(cors());
//app.use(logger('dev'));
app.use(express.json());

app.use('/game', gameRouter);

app.get('/status', (req, res) => {
	res.send(
		`Up at ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}`
	);
});

const server = app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
