import fs from 'fs';
import { takeProjectCacheRoot } from "../../helpers/utils";

export const selfCheck = () => {
  // -------------------------------------------------------------------------

  {
    const root = takeProjectCacheRoot()

    const match = fs.existsSync(root);

    if (!match) {
      fs.mkdirSync(root);
    }
  }

  // -------------------------------------------------------------------------
};

selfCheck();
