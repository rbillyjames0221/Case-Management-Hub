import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import publicCasesRouter from "./public-cases";
import casesRouter from "./cases";
import filesRouter from "./files";
import filesStandaloneRouter from "./files-standalone";
import messagesRouter from "./messages";
import hearingsRouter from "./hearings";
import hearingsStandaloneRouter from "./hearings-standalone";
import dashboardRouter from "./dashboard";
import auditLogsRouter from "./auditLogs";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/auth/users", usersRouter);
router.use("/cases", publicCasesRouter);
router.use("/cases", casesRouter);
router.use("/cases", filesRouter);
router.use("/files", filesStandaloneRouter);
router.use("/cases", messagesRouter);
router.use("/cases", hearingsRouter);
router.use("/hearings", hearingsStandaloneRouter);
router.use("/dashboard", dashboardRouter);
router.use("/audit-logs", auditLogsRouter);
router.use("/notifications", notificationsRouter);

export default router;
