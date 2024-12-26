import React from 'react';
import { ParentComponent } from '@/types/general';
import { Credits } from '@/components/Credits';


export const Layout: ParentComponent = ({ children }) => {
  return (
    <>
      <main className="pb-14">
        <Credits />
        {children}
      </main>
    </>
  )
}