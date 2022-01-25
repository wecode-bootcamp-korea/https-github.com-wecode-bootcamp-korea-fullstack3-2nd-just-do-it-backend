import express from 'express';
import routes from './routes';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './utils/config';
import { snkrsDao } from './models';
import { snkrsServices } from './services';
import { listDao } from './models';

const app = express();
const PORT = 8000;

const lottoSchedule = async () => {
  const list = await listDao.snkrsList();
  let isOpen = false;

  for (let i = 0; i < list.length; i++) {
    cron.schedule('00 09 * * *', async () => {
      isOpen = true;
      await snkrsDao.updataOpenClose(isOpen, list[i].style_code);
    });

    cron.schedule('30 09 * * *', async () => {
      isOpen = false;
      await snkrsDao.updataOpenClose(isOpen, list[i].style_code);
      await snkrsServices.selectWinner(list[i].style_code);
    });
  }
};

app.use(cors());
app.use(express.json());
app.use(routes);

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
  }
};

start();
lottoSchedule();
