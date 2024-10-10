import React from 'react';
import { LinkItem } from './LinkItem';

export const SearchResults = ({ links, refreshData, isDarkMode }) => {
  const sortedLinks = [...links].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {sortedLinks.map((link) => (
        <LinkItem
          key={link.id}
          link={link}
          showCollectionName={true}
          refreshData={refreshData}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};
