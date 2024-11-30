import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { getStartUserCountController } from "../controllers/common.js";

const commonRouter = Router();

commonRouter.get('/users-count', ctrlWrapper(getStartUserCountController));

export default commonRouter;
