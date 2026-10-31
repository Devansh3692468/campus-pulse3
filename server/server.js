import 'dotenv/config';
import app, { PORT } from './app.js';

const port = process.env.PORT || PORT || 3001;

app.listen(port, () => {
  console.log(`Campus Pulse server running on http://localhost:${port}`);
});
