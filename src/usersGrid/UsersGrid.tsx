import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  CellValueChangedEvent,
  ColDef,
  RangeSelectionChangedEvent,
} from "ag-grid-community";
import { flattenRow, YEARS } from "../utils/utils";
import type { Entry, FlattenedRow } from "../utils/types";
import { CellSelectionModule } from 'ag-grid-enterprise';
import { ClipboardModule } from "ag-grid-enterprise"; 
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllCommunityModule, ClientSideRowModelModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
ModuleRegistry.registerModules([ClientSideRowModelModule, ClipboardModule, CellSelectionModule]);
interface Props {
  originalData: Entry[];
}

interface SummaryStats {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
}

export default function UsersGrid({ originalData }: Props) {
  const gridRef = useRef<AgGridReact<FlattenedRow>>(null);
  const [rowData, setRowData] = useState<FlattenedRow[]>([]);
  const [originalSnapshot, setOriginalSnapshot] = useState<FlattenedRow[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    count: 0,
    sum: 0,
    min: 0,
    max: 0,
    avg: 0,
  });

  // Load initial data
  useEffect(() => {
    const flattened = originalData.map((r, i) => flattenRow(r, i));
    setRowData(flattened);
    setOriginalSnapshot(JSON.parse(JSON.stringify(flattened)));
  }, [originalData]);

  const numberParser = (params: { newValue: unknown }): number => {
    const parsed = Number(params.newValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Column definitions
  const columnDefs = useMemo<ColDef<FlattenedRow>[]>(() => {
    const cols: ColDef<FlattenedRow>[] = [
      { headerName: "Service", field: "serviceName", editable: false, minWidth: 160, cellStyle: { textAlign: "left" } },
      { headerName: "Act", field: "actName", editable: true, minWidth: 120, cellStyle: { textAlign: "left" } },
      { headerName: "Remarks", field: "remarks", editable: true, minWidth: 140, cellStyle: { textAlign: "left" } },
      { headerName: "Quote", field: "quote", editable: false, minWidth: 120, cellStyle: { textAlign: "left" } },
    ];

    for (const y of YEARS) {
      if(y===2025) break
      cols.push(
        { headerName: `${y} - ${y+1}`,field: `y${y}_total`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
        );}
        cols.push(
          { headerName: `Price`,field: `y2025_total`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc1`,field: `y2025_acc1`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc2`,field: `y2025_acc2`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc3`,field: `y2025_acc3`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc4`,field: `y2025_acc4`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          {
          headerName: `Diff`,
          field: `y2025_diff`,
          editable: false,
          minWidth: 120,
          cellStyle: { textAlign: "left" },
          valueGetter: (params) => {
            const total = Number(params.data?.[`y2025_total`] ?? 0);
            const a = Number(params.data?.[`y2025_acc1`] ?? 0);
            const b = Number(params.data?.[`y2025_acc2`] ?? 0);
            const c = Number(params.data?.[`y2025_acc3`] ?? 0);
            const d = Number(params.data?.[`y2025_acc4`] ?? 0);
            return total - (a + b + c + d);
          },
        },
        { headerName: `acc1 2024-2025`,field: `y2024_acc1`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc2 2024-2025`,field: `y2024_acc2`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc3 2024-2025`,field: `y2024_acc3`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } },
          { headerName: `acc4 2024-2025`,field: `y2024_acc4`, editable: true, type: "numericColumn", valueParser: numberParser, minWidth: 60, cellStyle: { textAlign: "left" } }
      )
    return cols;
  }, []);

  const defaultColDef = useMemo<ColDef<FlattenedRow>>(
    () => ({
      sortable: false,
      resizable: true,
      filter: false,
      editable: false,
      headerClass: 'center-header',
    }),
    []
  );

  const onCellValueChanged = (params: CellValueChangedEvent<FlattenedRow>) => {
  if (params.data) {
    params.api.applyTransaction({
      update: [params.data],  // only updating the changed row
    });
  }
};


  const onRangeSelectionChanged = (event: RangeSelectionChangedEvent) => {
    const api = event.api;
    const ranges = api.getCellRanges();
    if (!ranges || ranges.length === 0) {
      setSummary({ count: 0, sum: 0, min: 0, max: 0, avg: 0 });
      return;
    }

    const values: number[] = [];

    ranges.forEach((range) => {
      const startRow = Math.min(range.startRow?.rowIndex ?? 0, range.endRow?.rowIndex ?? 0);
      const endRow = Math.max(range.startRow?.rowIndex ?? 0, range.endRow?.rowIndex ?? 0);

      range.columns?.forEach((col) => {
        const colId = col.getColId();
        for (let r = startRow; r <= endRow; r++) {
          const rowNode = api.getDisplayedRowAtIndex(r);
          const val = Number(rowNode?.data?.[colId]); // ✅ No getValue
          if (!isNaN(val)) values.push(val);
        }
      });
    });

    if (values.length) {
      const sum = values.reduce((a, b) => a + b, 0);
      setSummary({
        count: values.length,
        sum,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: parseFloat((sum / values.length).toFixed(2)),
      });
    } else {
      setSummary({ count: 0, sum: 0, min: 0, max: 0, avg: 0 });
    }
  };

  const onCompare = () => {
    const allCurr: FlattenedRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) allCurr.push(node.data);
    });

    const changed: Array<{
      __rowIndex: number;
      serviceName: string;
      actName: string;
      diffs: Record<string, { before: unknown; after: unknown }>;
    }> = [];

    for (const o of originalSnapshot) {
      const cur = allCurr.find((c) => c.__rowIndex === o.__rowIndex);
      if (!cur) continue;

      const diffs: Record<string, { before: unknown; after: unknown }> = {};
      let isChanged = false;

      for (const key of Object.keys(cur) as Array<keyof FlattenedRow>) {
        if (key === "__rowIndex") continue;
        if (String(cur[key] ?? "") !== String(o[key] ?? "")) {
          diffs[key as string] = { before: o[key], after: cur[key] };
          isChanged = true;
        }
      }

      if (isChanged) {
        changed.push({
          __rowIndex: cur.__rowIndex,
          serviceName: cur.serviceName,
          actName: cur.actName,
          diffs,
        });
      }
    }

    console.log("Changed Rows", changed);
    alert(`Compare done. ${changed.length} rows changed. Check console for details.`);
  };

  const getRowId = (params: { data: FlattenedRow }) => {
  return params.data.__rowIndex.toString();
};


  const onGridReady = () => {
    // can be used for api calls
  };

  return (
    <div className="w-full h-screen p-6 bg-slate-50">
      <div className="max-w-[1600px] mx-auto bg-white rounded shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Ag-Grid Table</h2>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded border"
              onClick={() => gridRef.current?.api.undoCellEditing()}
            >
              Undo
            </button>
            <button
              className="px-3 py-1 rounded border"
              onClick={() => gridRef.current?.api.redoCellEditing()}
            >
              Redo
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={onCompare}
            >
              Compare
            </button>
          </div>
        </div>

        <div className="ag-theme-alpine" style={{ height: "72vh", width: "100%" }}>
          <AgGridReact<FlattenedRow>
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            cellSelection={true}
            enableFillHandle={true}
            undoRedoCellEditing={true}
            undoRedoCellEditingLimit={100}
            rowSelection="multiple"
            getRowId={getRowId}
            enableRangeSelection={true}          
            suppressCopyRowsToClipboard={false}  // allow copying multiple rows
            copyHeadersToClipboard={true}        // include headers when copying
            suppressClipboardPaste={false}       // allow pasting
            suppressMultiRangeSelection={false}
            onRangeSelectionChanged={onRangeSelectionChanged}
            onCellValueChanged={onCellValueChanged}
            onGridReady={onGridReady}
            suppressMovableColumns={false}
          />

        </div>

        {summary.count > 0 && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <div><strong>Cells Selected:</strong> {summary.count}</div>
            <div><strong>Sum:</strong> {summary.sum}</div>
            <div><strong>Min:</strong> {summary.min}</div>
            <div><strong>Max:</strong> {summary.max}</div>
            <div><strong>Average:</strong> {summary.avg}</div>
          </div>
        )}
      </div>
    </div>
  );
}
