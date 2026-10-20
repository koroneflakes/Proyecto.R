import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { getTabConfig } from '@/constants/tabs';

const tab = getTabConfig('more');

export default function MoreScreen() {
  return <PlaceholderScreen title={tab.label} subtitle={tab.placeholderSubtitle} />;
}
