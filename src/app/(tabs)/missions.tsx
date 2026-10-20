import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { getTabConfig } from '@/constants/tabs';

const tab = getTabConfig('missions');

export default function MissionsScreen() {
  return <PlaceholderScreen title={tab.label} subtitle={tab.placeholderSubtitle} />;
}
