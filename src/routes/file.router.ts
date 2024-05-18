import { Router } from "express";
import upload, { UploadFile, DeleteFile } from "../middleware/file";
import { checkLogs, isAdmin, isLoggedIn } from "../middleware/auth";

const router = Router();

/* router.all("*", checkLogs, loggedIn /* ,hasRole(["S", "A"]) * /); */

router
  .route("/")
  .all(checkLogs, isLoggedIn, isAdmin)
  .post(upload.single("file"), UploadFile)
  .delete(DeleteFile);
console.log("🗃️ Files upload is on");
export default router;
