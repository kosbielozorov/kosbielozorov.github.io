import React from 'react';

import { usePortfolioData } from '../../info';

export default function Footer() {
  const dataInfo = usePortfolioData();
  const { name, secondName } = dataInfo.first;
  return (
    <React.Fragment>
      <footer className="bg-[#232323] relative print:hidden">
        <div className="py-4 flex flex-col justify-center mx-auto max-w-[200px]">
          <div className="text-center text-white">{`${name} ${secondName}`}</div>
          <div className="text-center text-white">
            {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
}
