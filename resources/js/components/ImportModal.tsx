import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, Download, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from './custom-toast';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  title: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  type,
  title
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [importResult, setImportResult] = useState<{
    total_rows: number;
    imported_count: number;
    skipped_count: number;
    error_count?: number;
    skipped_details?: { row: number; reason: string; preview: string }[];
    errors?: { row: number; message: string; preview: string }[];
  } | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});

  const handleImport = async () => {
    if (!file) {
      toast.error(t('Please select a file'));
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('table', type);
    formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');

    try {
      const response = await fetch(route('csv.import'), {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error !== '') {
        toast.error(result.error);
      } else {
        // Get the modal data
        const modalResponse = await fetch(route('csv.import.modal', { table: type, status: true }));
        const modalData = await modalResponse.json();
        
        // Parse the fields JSON
        const fieldsArray = JSON.parse(modalData.fields);
        
        setHeaders(modalData.headers);
        setFields(fieldsArray);
        
        // Convert HTML table to preview data
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<table>${result.output}</table>`, 'text/html');
        const rows = Array.from(doc.querySelectorAll('tr'));
        const previewData = rows.map(row => 
          Array.from(row.querySelectorAll('td')).map(cell => cell.textContent || '')
        );
        
        setPreview(previewData);
        setShowMapping(true);
      }
    } catch (error) {
      toast.error(t('Upload failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldMapping = (field: string, columnIndex: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: parseInt(columnIndex)
    }));
  };

  const getAvailableFields = (currentColumnIndex: number) => {
    // Get all currently mapped fields except for the current column
    const mappedFields = Object.keys(mapping).filter(field => 
      mapping[field] !== currentColumnIndex
    );
    
    // Return fields that are not already mapped
    return fields.filter(field => !mappedFields.includes(field));
  };

  const canProceed = () => {
    return Object.keys(mapping).length > 0;
  };

  const handleFinalImport = async () => {
    if (!canProceed()) return;

    setIsLoading(true);

    try {
      const response = await fetch(route(`${type}.import`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          data: mapping
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImportResult(result.data || null);
        setShowMapping(false);
        setShowResult(true);
        toast.success(result.message);
      } else {
        setImportResult(result.data || null);
        setShowMapping(false);
        setShowResult(true);
        toast.error(result.message || result.error || 'Import failed');
      }
    } catch (error) {
      toast.error(t('Import failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setShowMapping(false);
    setShowResult(false);
    setImportResult(null);
    setHeaders([]);
    setFields([]);
    setPreview([]);
    setMapping({});
  };

  const handleCloseResult = () => {
    resetState();
    onClose();
    router.reload();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      const templateUrl = route(`${type}.template`);
      
      console.log('Template URL:', templateUrl);
      
      const response = await fetch(templateUrl, {
        method: 'GET',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob); 
        const a = document.createElement('a');
        a.href = url;
        const ext = (type === 'assets' || type === 'crm-contacts' || type === 'equipment') ? 'xlsx' : 'csv';
        a.download = `sample_${type}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t('Template downloaded successfully'));
      } else {
        const errorText = await response.text();
        console.error('Template download failed:', response.status, errorText);
        toast.error(t('Template download failed'));
      }
    } catch (error) {
      console.error('Template download error:', error);
      toast.error(t('Template download failed'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (showResult ? handleCloseResult() : handleClose())}>
      <DialogContent className={showMapping || showResult ? "max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto" : "max-w-[95vw] sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>{showResult ? t('Import result') : `${t('Import')} ${t(title)}`}</DialogTitle>
        </DialogHeader>

        {showResult && importResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 rounded bg-muted/50">
                <FileText className="h-4 w-4" />
                <span>{t('Total rows in file')}: <strong>{importResult.total_rows}</strong></span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>{t('Imported')}: <strong>{importResult.imported_count}</strong></span>
              </div>
              {importResult.skipped_count > 0 && (
                <div className="flex items-center gap-2 p-3 rounded bg-amber-50 text-amber-800 col-span-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t('Skipped')}: <strong>{importResult.skipped_count}</strong></span>
                </div>
              )}
              {importResult.error_count && importResult.error_count > 0 && (
                <div className="flex items-center gap-2 p-3 rounded bg-red-50 text-red-800 col-span-2">
                  <XCircle className="h-4 w-4" />
                  <span>{t('Errors')}: <strong>{importResult.error_count}</strong></span>
                </div>
              )}
            </div>
            {importResult.skipped_details && importResult.skipped_details.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm">{t('Skipped rows')}:</h4>
                <div className="max-h-40 overflow-y-auto border rounded text-xs">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 text-left">{t('Row')}</th>
                        <th className="px-2 py-1.5 text-left">{t('Reason')}</th>
                        <th className="px-2 py-1.5 text-left">{t('Preview')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.skipped_details.map((s, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1.5">{s.row}</td>
                          <td className="px-2 py-1.5">{s.reason}</td>
                          <td className="px-2 py-1.5 truncate max-w-[200px]" title={s.preview}>{s.preview || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-red-700">{t('Failed rows')}:</h4>
                <div className="max-h-40 overflow-y-auto border rounded text-xs border-red-200">
                  <table className="w-full">
                    <thead className="bg-red-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5 text-left">{t('Row')}</th>
                        <th className="px-2 py-1.5 text-left">{t('Error')}</th>
                        <th className="px-2 py-1.5 text-left">{t('Preview')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((e, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1.5">{e.row}</td>
                          <td className="px-2 py-1.5 text-red-600">{e.message}</td>
                          <td className="px-2 py-1.5 truncate max-w-[200px]" title={e.preview}>{e.preview || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Button onClick={handleCloseResult} className="w-full">
              {t('Close')}
            </Button>
          </div>
        ) : !showMapping ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {t('Import')} {type} {t('data from Excel (.xlsx, .xls) or CSV (.csv) file')}
            </div>

            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('Download Template')} ({type})
            </Button>

            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {t('Cancel')}
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading || !file}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? t('Processing...') : t('Import')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
              <AlertCircle className="w-4 h-4" />
              {t('Map your CSV columns to database fields')}
            </div>

            {preview.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t('Map CSV Columns to Database Fields')}</h4>
                <div className="border rounded overflow-visible">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-center relative">
                            <div className="mb-2 font-medium">{header}</div>
                            <div className="relative z-50">
                              <Select onValueChange={(value) => handleFieldMapping(value, index.toString())}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t('Select field')} />
                                </SelectTrigger>
                                <SelectContent className="z-[100] bg-white border shadow-lg">
                                  {getAvailableFields(index).map((field) => (
                                    <SelectItem key={field} value={field}>
                                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-center">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowMapping(false)}>
                {t('Back')}
              </Button>
              <Button 
                onClick={handleFinalImport} 
                disabled={!canProceed() || isLoading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? t('Importing...') : t('Import Data')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};