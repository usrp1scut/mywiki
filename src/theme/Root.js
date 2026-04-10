import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * Docusaurus Root wrapper.
 * We use BrowserOnly + dynamic import to avoid SSR issues with useColorMode.
 */
export default function Root({children}) {
  return (
    <>
      <BrowserOnly>
        {() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const StarfieldLoader = require('../components/StarfieldLoader').default;
          return <StarfieldLoader />;
        }}
      </BrowserOnly>
      {children}
    </>
  );
}
