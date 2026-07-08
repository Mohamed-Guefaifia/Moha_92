import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.js');

// Use a locally installed Chromium when Remotion's own download is blocked
// (e.g. sandboxed CI). Remove or adjust if Chrome downloads work for you.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
