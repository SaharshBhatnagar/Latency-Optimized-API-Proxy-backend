import express from 'express';
import cors  from 'cors';
import 'dotenv/config';
import { initUserTable } from './models/userModel.js';
import router from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use('/api/auth', router);

await initUserTable();

app.listen(PORT, () => {
    console.log('Server is listening on port... ', PORT as any)
});
