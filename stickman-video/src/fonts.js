import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const CAPTION_FONT = 'Baloo Bhaijaan 2';
export const QUOTE_FONT = 'Amiri';

loadFont({
  family: CAPTION_FONT,
  url: staticFile('fonts/BalooBhaijaan2-Medium.ttf'),
  weight: '500',
});
loadFont({
  family: CAPTION_FONT,
  url: staticFile('fonts/BalooBhaijaan2-Bold.ttf'),
  weight: '700',
});
loadFont({
  family: CAPTION_FONT,
  url: staticFile('fonts/BalooBhaijaan2-ExtraBold.ttf'),
  weight: '800',
});
loadFont({
  family: QUOTE_FONT,
  url: staticFile('fonts/Amiri-Regular.ttf'),
  weight: '400',
});
loadFont({
  family: QUOTE_FONT,
  url: staticFile('fonts/Amiri-Bold.ttf'),
  weight: '700',
});
