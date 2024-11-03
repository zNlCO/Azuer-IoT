import express from 'express';
import messageRouter from './message/message.routes';

const router = express.Router();

router.use('/message', messageRouter);

export default router;