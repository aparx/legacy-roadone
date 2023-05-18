// lng and resources key depend on your locale.
import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import german from 'zod-i18n-map/locales/de/zod.json';

i18next.init({
  lng: 'de',
  resources: {
    de: { zod: german },
  },
});

z.setErrorMap(zodI18nMap);
