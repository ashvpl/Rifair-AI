"use client";

import Link from 'next/link';
import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import * as React from 'react';

export type IMenu = {
  id: number;
  title: string;
  url: string;
  dropdown?: boolean;
  items?: IMenu[];
};

type MenuProps = {
  list: IMenu[];
};

const Menu = ({ list }: MenuProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <MotionConfig transition={{ bounce: 0, type: 'tween' }}>
      <nav className={'relative flex justify-center w-full z-50'}>
        <ul className={'flex items-center'}>
          {list?.map((item) => {
            return (
              <li key={item.id} className={'relative'}>
                <Link
                  className={`
                    relative flex items-center justify-center rounded px-8 py-3 transition-all
                    hover:bg-black/5
                    ${hovered === item?.id ? 'bg-black/5' : ''}
                  `}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  href={item?.url}
                >
                  {item?.title}
                </Link>
                {hovered === item?.id && !item?.dropdown && (
                  <motion.div
                    layout
                    layoutId={`cursor`}
                    className={'absolute h-0.5 w-full bg-black bottom-0'}
                  />
                )}
                {item?.dropdown && hovered === item?.id && (
                  <div
                    className='absolute left-0 top-full'
                    onMouseEnter={() => setHovered(item.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <motion.div
                      layout
                      transition={{ bounce: 0 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      style={{
                        borderRadius: '8px',
                      }}
                      className='mt-2 flex w-64 flex-col rounded-xl bg-white shadow-xl border border-black/[0.05]'
                      layoutId={'cursor'}
                    >
                      {item?.items?.map((nav) => {
                        return (
                          <Link
                            key={`link-${nav?.id}`}
                            href={`${nav?.url}`}
                            className={'w-full p-4 hover:bg-[#F5F5F7] text-sm font-medium transition-colors last:rounded-b-xl first:rounded-t-xl'}
                          >
                            {nav?.title}
                          </Link>
                        );
                      })}
                    </motion.div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </MotionConfig>
  );
};

export default Menu;
