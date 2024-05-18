// import { formatString } from "../utils/Strings";
import { readTextFile } from "../utils/File";
import { CWD} from "./Env";


export const RedirectPage = readTextFile(`./templates/pages/redirect.html`);
