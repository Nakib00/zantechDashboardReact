import React from 'react';

const TableRow = ({ row, headers, renderActions }) => {
  return (
    <tr>
      {headers.map((header) => (
        <td key={header.key} data-label={header.label}>
          {header.render ? header.render(row) : row[header.key]}
        </td>
      ))}
      {renderActions && (
        <td data-label="Actions" className="action-buttons">
          {renderActions(row)}
        </td>
      )}
    </tr>
  );
};

export default TableRow;