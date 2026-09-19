import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import saveStreetRouter from "./save-street";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(saveStreetRouter);

export default router;
