import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { getTabConfig } from '@/constants/tabs';

const tab = getTabConfig('development-tree');

export default function DevelopmentTreeScreen() {
  return <PlaceholderScreen title={tab.label} subtitle={tab.placeholderSubtitle} />;
}
