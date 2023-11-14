import { runner } from "../../src/lib/runner";

runner({
  source: '/Users/aram/Documents/cli-projects/cligm-ext',
  context: {
    upload() {
      console.log(123);
    },
    env: 'net',
    libNames: {
      CGMDoc: '123',
    }
  }
});
