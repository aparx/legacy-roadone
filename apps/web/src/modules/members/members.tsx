import alexander from '../../../public/members/alexander.jpg';
import julia from '../../../public/members/julia.jpg';
import klaus from '../../../public/members/klaus.jpeg';
import klaus_bass from '../../../public/members/klaus_bass.jpeg';
import robert from '../../../public/members/robert.jpeg';
import stella from '../../../public/members/stella.jpeg';
import thomas from '../../../public/members/thomas.jpg';
import { ImageProps } from 'next/image';

export type MemberType = {
  firstName: string;
  lastName?: string;
  role: string;
  photo: ImageProps['src'];
};

export const members = [
  {
    firstName: 'Alexander',
    lastName: 'Zeband',
    role: 'Schlagzeug',
    photo: alexander,
  },
  {
    firstName: 'Klaus',
    lastName: 'Kemmerling',
    role: 'Gitarre',
    photo: klaus,
  },
  {
    firstName: 'Julia',
    lastName: 'Speicher',
    role: 'Gesang',
    photo: julia,
  },
  {
    firstName: 'Stella',
    lastName: 'Fauser',
    role: 'Saxophon',
    photo: stella,
  },
  {
    firstName: 'Thomas',
    lastName: 'Welter',
    role: 'Keyboard',
    photo: thomas,
  },
  {
    firstName: 'Klaus',
    role: 'Bass',
    photo: klaus_bass,
  },
  {
    firstName: 'Robert',
    lastName: 'Schwarz',
    role: 'Sound',
    photo: robert,
  },
] as const satisfies Readonly<MemberType[]>;
