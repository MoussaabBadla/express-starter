import { Router } from "express";
import upload, { UploadFile, DeleteFile, handleMulterError } from "../middleware/file";
import { checkLogs, isAdmin, isLoggedIn } from "../middleware/auth";
import { globalLogger } from "../utils/Logger";

const router = Router();

/* router.all("*", checkLogs, loggedIn /* ,hasRole(["S", "A"]) * /); */

router
  .route("/")
  .all(checkLogs, isLoggedIn, isAdmin)
  .post(upload.single("file"), handleMulterError, UploadFile)
  .delete(DeleteFile);
globalLogger.info("🗃️ Files upload is on");
export default router;
