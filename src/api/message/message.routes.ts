import express from 'express';
import { sendMessage, fetch, getMinMax, getByDate, getMessageCount, getDataFromValues, getMessageNotRecieved, setRecieved } from './message.controller';

const router = express.Router();

router.post('/sendMessage', sendMessage);
router.get('/fetch', fetch);
router.get('/getMinMax', getMinMax);
router.get('/getByDate', getByDate);
router.get('/getDataFromValues', getDataFromValues);
router.get('/getMessageCount', getMessageCount);
router.get('/getMessageNotRecieved', getMessageNotRecieved);
router.patch('/setRecieved', setRecieved)

export default router;