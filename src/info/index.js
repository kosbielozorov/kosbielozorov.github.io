import { useTranslation } from 'react-i18next';

import { portfolioData as dataEn } from './en';
import { portfolioData as dataUk } from './uk';

export function usePortfolioData() {
  const { i18n } = useTranslation();
  return i18n.language?.toLowerCase().startsWith('uk') ? dataUk : dataEn;
}
