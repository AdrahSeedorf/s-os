import { notFound } from 'next/navigation';
import { iconRegistry } from '@/components/icons';
import { getProjects, getSkills } from '@/lib/content';
import { InstallerForm } from './InstallerForm';

/**
 * The S-OS Project Installer.
 *
 * Development only. The page returns a 404 in a production build, and so does
 * the write endpoint behind it — the deployed site has no path that writes
 * anything to disk.
 *
 * This is the answer to "I want to add projects through the system" that does
 * not require auth, a database, or a live failure mode on a public portfolio.
 * Fill in the form, it writes the same typed file you would have written by
 * hand, and the change ships through git like everything else.
 */
export const dynamic = 'force-dynamic';

export default function InstallerPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <InstallerForm
      existingIds={getProjects().map((project) => project.id)}
      knownIcons={Object.keys(iconRegistry)}
      knownSkills={getSkills().map((skill) => ({ id: skill.id, name: skill.name }))}
    />
  );
}
