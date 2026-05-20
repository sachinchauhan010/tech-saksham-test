import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface TableColumn<T> {
  header: React.ReactNode | string;
  key: string;
  className?: string; // Optional class for the header cell and data cells
  render?: (item: T) => React.ReactNode;
}

interface GenericTableViewProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
}

export default function GenericTableView<T>({ data, columns, keyExtractor }: GenericTableViewProps<T>) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={col.key || index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((col, index) => (
                <TableCell key={col.key || index} className={col.className}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
