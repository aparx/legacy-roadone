import dayjs from 'dayjs';
import 'dayjs/locale/de';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import german from 'zod-i18n-map/locales/de/zod.json';


// noinspection JSIgnoredPromiseFromCall
i18next.init({
  lng: 'de',
  resources: {
    de: { zod: german },
  },
});

z.setErrorMap(zodI18nMap);

dayjs.extend(relativeTime.default);
dayjs.locale('de');