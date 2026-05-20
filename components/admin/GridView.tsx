import React from 'react';

interface GenericGridViewProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}

export default function GenericGridView<T>({ data, keyExtractor, renderItem }: GenericGridViewProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((item) => (
        <React.Fragment key={keyExtractor(item)}>
          {renderItem(item)}
        </React.Fragment>
      ))}
    </div>
  );
}
