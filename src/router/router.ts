import Router from "koa-router";
import Controller from '../controller/lotwInfo/lotwInfo'
const router = new Router();

router.post('/adif/upload', Controller.exportFile)

export default router
