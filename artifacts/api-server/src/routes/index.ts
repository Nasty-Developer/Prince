import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import saveStreetRouter from "./save-street";

const router: IRouter = Router();

router.use(healthRouter);
if (process.env.PRIVATE_OBJECT_DIR || process.env.PUBLIC_OBJECT_SEARCH_PATHS) {
  router.use(storageRouter);
}
router.use(saveStreetRouter);

export default router;
