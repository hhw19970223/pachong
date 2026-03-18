import { SkillsPlazaClient } from '@/components/plaza/SkillsPlazaClient';
import { SkillsApiService } from '@/services/skillsApi';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialSkills = await SkillsApiService.getCachedSkills();

  return <SkillsPlazaClient initialSkills={initialSkills} />;
}