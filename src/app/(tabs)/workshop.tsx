import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { getTabConfig } from '@/constants/tabs';

const tab = getTabConfig('workshop');

export default function WorkshopScreen() {
  return <PlaceholderScreen title={tab.label} subtitle={tab.placeholderSubtitle} />;
}
