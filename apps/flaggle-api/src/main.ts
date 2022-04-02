import * as express from 'express';
import { Message } from '@flaggle/flaggle-api-schemas';

const app = express();

const greeting: Message = { message: 'Welcome to flaggle-api!' };

app.get('/flaggle-api', (req, res) => {
  res.send(greeting);
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/flaggle-api');
});
server.on('error', console.error);
