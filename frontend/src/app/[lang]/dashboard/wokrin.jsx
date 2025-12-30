//src/app/[lang]/dashboard/page.jsx

import WorkspaceArea from './WorkspaceArea';
import { titles } from '@/lib/metadata';

export const generateMetadata = () => {
  const lang = 'pt-br'; // ou detecte dinamicamente via pathname, cookies, etc.
  const { title, description } = titles[lang];
  return { title, description };
};

export default function Page() {
  return <WorkspaceArea />;
}