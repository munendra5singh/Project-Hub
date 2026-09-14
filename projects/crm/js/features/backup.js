/**
 * PROPERTY MANAGER PRO — BACKUP & RESTORE MODULE
 * ===============================================
 * Multi-sheet Excel (.xlsx/.xls SpreadsheetML) and JSON data export/import with demo recovery.
 */

(function(global) {
  'use strict';

  function getCustomFieldExportHeaders(module) {
    if (!global.appConfig || !Array.isArray(global.appConfig.customFields)) return [];
    return global.appConfig.customFields.filter(cf => cf.enabled !== false && cf.exportable !== false && (cf.appliesTo === 'all' || cf.appliesTo === 'both' || cf.appliesTo === module));
  }

  function exportSpreadsheetML(dateStr) {
    function escXml(s) {
      return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];
    let configObj = global.appConfig || {};

    const propCFs = getCustomFieldExportHeaders('property');
    const propHeaders = ['ID', 'Property Name', 'Location', 'Type', 'BHK', 'Area', 'Area Unit', 'Dimensions', 'Dimension Unit', 'Facing', 'Road Width', 'Price (₹)', 'Price Category', 'Budget Slab', 'Status', 'Owner / Broker', 'Phone', 'Follow-up Date', 'Google Maps URL', 'Video URL', 'Notes', ...propCFs.map(c => c.label), 'Favorite', 'Photo / Image Data', 'Created Date'];
    const propRows = dataList.map(p => [
      p.id || '',
      p.name || '',
      p.location || '',
      p.type || '',
      p.bhk || '',
      p.area || '',
      global.getAreaUnitLabel(global.getAreaUnit(p)),
      p.dim || p.dimensions || '',
      global.getDimensionUnitLabel(global.getDimensionUnit(p)),
      p.facing || '',
      p.road || '',
      Number(p.price) || 0,
      p.priceCategory || global.getPropertyCategory(p.price),
      p.budgetSlab || global.getPropertyBudgetSlab(p.price),
      p.status || '',
      p.owner || '',
      p.phone || '',
      p.follow || '',
      p.map || '',
      p.video || '',
      p.notes || '',
      ...propCFs.map(c => {
        let v = p.customFields ? p.customFields[c.key] : '';
        return Array.isArray(v) ? v.join(', ') : (v ?? '');
      }),
      p.favorite ? 'YES' : 'NO',
      p.photo || '',
      p.created || ''
    ]);

    const directCFs = getCustomFieldExportHeaders('direct');
    const directHeaders = ['ID', 'Direct Property Name', 'Location', 'Type', 'BHK', 'Area', 'Area Unit', 'Dimensions', 'Dimension Unit', 'Facing', 'Road Width', 'Price (₹)', 'Price Category', 'Budget Slab', 'Status', 'Owner / Client Contact', 'Phone', 'Follow-up Date', 'Google Maps URL', 'Video URL', 'Notes', ...directCFs.map(c => c.label), 'Favorite', 'Photo / Image Data', 'Created Date'];
    const directRows = directList.map(p => [
      p.id || '',
      p.name || '',
      p.location || '',
      p.type || '',
      p.bhk || '',
      p.area || '',
      global.getAreaUnitLabel(global.getAreaUnit(p)),
      p.dim || p.dimensions || '',
      global.getDimensionUnitLabel(global.getDimensionUnit(p)),
      p.facing || '',
      p.road || '',
      Number(p.price) || 0,
      p.priceCategory || global.getPropertyCategory(p.price),
      p.budgetSlab || global.getPropertyBudgetSlab(p.price),
      p.status || '',
      p.owner || '',
      p.phone || '',
      p.follow || '',
      p.map || '',
      p.video || '',
      p.notes || '',
      ...directCFs.map(c => {
        let v = p.customFields ? p.customFields[c.key] : '';
        return Array.isArray(v) ? v.join(', ') : (v ?? '');
      }),
      p.favorite ? 'YES' : 'NO',
      p.photo || '',
      p.created || ''
    ]);

    const upCFs = getCustomFieldExportHeaders('project');
    const upHeaders = ['ID', 'Project Name', 'Developer / Builder', 'Location', 'Project Type', 'BHK / Config', 'Area / Plot Size', 'Starting Price (₹)', 'Max Price (₹)', 'Price Category', 'Budget Slab', 'Project Status', 'Launch Date', 'Possession Date', 'Contact Person', 'Contact Phone', 'Google Maps URL', 'Brochure / Website', 'Video URL', 'Notes / Description', ...upCFs.map(c => c.label), 'Favorite', 'Photo / Image Data', 'Created Date'];
    const upRows = upList.map(p => [
      p.id || '',
      p.name || '',
      p.developer || '',
      p.location || '',
      p.type || '',
      p.bhk || '',
      p.area || '',
      Number(p.price) || 0,
      Number(p.maxPrice) || '',
      p.priceCategory || global.getPriceCategory(p.price),
      p.budgetSlab || global.getBudgetSlab(p.price),
      p.status || '',
      p.launchDate || '',
      p.possessionDate || '',
      p.owner || '',
      p.phone || '',
      p.map || '',
      p.brochure || '',
      p.video || '',
      p.notes || '',
      ...upCFs.map(c => {
        let v = p.customFields ? p.customFields[c.key] : '';
        return Array.isArray(v) ? v.join(', ') : (v ?? '');
      }),
      p.favorite ? 'YES' : 'NO',
      p.photo || '',
      p.created || ''
    ]);

    const favHeaders = ['Module', 'ID', 'Name / Project', 'Location', 'Type', 'Price (₹)', 'Status', 'Contact', 'Phone', 'Photo / Image Data'];
    const favProps = dataList.filter(p => p.favorite).map(p => ['Property', p.id || '', p.name || '', p.location || '', p.type || '', Number(p.price) || 0, p.status || '', p.owner || '', p.phone || '', p.photo || '']);
    const favDirects = directList.filter(p => p.favorite).map(p => ['Direct Property', p.id || '', p.name || '', p.location || '', p.type || '', Number(p.price) || 0, p.status || '', p.owner || '', p.phone || '', p.photo || '']);
    const favUps = upList.filter(u => u.favorite).map(u => ['Upcoming Project', u.id || '', u.name || '', u.location || '', u.type || '', Number(u.price) || 0, u.status || '', u.owner || '', u.phone || '', u.photo || '']);
    const favRows = [...favProps, ...favDirects, ...favUps];

    const cfHeaders = ['ID', 'Key', 'Label', 'Type', 'Applies To', 'Required', 'Searchable', 'Filterable', 'Exportable', 'Enabled', 'Placeholder', 'Default Value', 'Options'];
    const cfRows = (configObj.customFields || []).map(cf => [
      cf.id || '',
      cf.key || '',
      cf.label || '',
      cf.type || '',
      cf.appliesTo || 'all',
      cf.required ? 'YES' : 'NO',
      cf.searchable !== false ? 'YES' : 'NO',
      cf.filterable !== false ? 'YES' : 'NO',
      cf.exportable !== false ? 'YES' : 'NO',
      cf.enabled !== false ? 'YES' : 'NO',
      cf.placeholder || '',
      cf.defaultValue || '',
      Array.isArray(cf.options) ? cf.options.join(', ') : ''
    ]);

    const infoHeaders = ['Parameter', 'Value'];
    const infoRows = [
      ['Application', 'Property Manager Pro'],
      ['Version', '2.0'],
      ['Export Date', new Date().toISOString()],
      ['Total Company Properties', dataList.length],
      ['Total Direct Properties', directList.length],
      ['Total Upcoming Projects', upList.length],
      ['Total Favorites', favRows.length],
      ['Total Custom Fields', (configObj.customFields || []).length],
      ['Storage Engine', 'IndexedDB']
    ];

    const sheets = [
      { name: 'Properties', headers: propHeaders, rows: propRows },
      { name: 'Direct Properties', headers: directHeaders, rows: directRows },
      { name: 'Upcoming Projects', headers: upHeaders, rows: upRows },
      { name: 'Favorites', headers: favHeaders, rows: favRows },
      { name: 'Custom Fields', headers: cfHeaders, rows: cfRows },
      { name: 'CRM Info', headers: infoHeaders, rows: infoRows }
    ];

    let xml = '<?xml version="1.0"?>\n' +
      '<?mso-application progid="Excel.Sheet"?>\n' +
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n' +
      ' xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
      ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n' +
      ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n' +
      ' xmlns:html="http://www.w3.org/TR/REC-html40">\n' +
      ' <Styles>\n' +
      '  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/></Style>\n' +
      '  <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2563EB" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/></Style>\n' +
      ' </Styles>\n';

    for (const sheet of sheets) {
      xml += ` <Worksheet ss:Name="${escXml(sheet.name)}">\n  <Table>\n`;
      xml += '   <Row ss:Height="22">\n';
      for (const h of sheet.headers) {
        xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escXml(h)}</Data></Cell>\n`;
      }
      xml += '   </Row>\n';
      for (const row of sheet.rows) {
        xml += '   <Row>\n';
        for (const val of row) {
          let isNum = typeof val === 'number' && !isNaN(val);
          let type = isNum ? 'Number' : 'String';
          xml += `    <Cell><Data ss:Type="${type}">${escXml(val)}</Data></Cell>\n`;
        }
        xml += '   </Row>\n';
      }
      xml += '  </Table>\n </Worksheet>\n';
    }
    xml += '</Workbook>';

    let blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Property_Manager_Backup_${dateStr}.xls`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 200);
    return xml;
  }

  function exportBackup() {
    const dateStr = new Date().toISOString().slice(0, 10);
    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];
    let configObj = global.appConfig || {};

    try {
      if (window.XLSX && window.XLSX.utils && window.XLSX.writeFile) {
        const XLSX = window.XLSX;
        const wb = XLSX.utils.book_new();

        const propCFs = getCustomFieldExportHeaders('property');
        const propRows = dataList.map(p => {
          let row = {
            "ID": p.id || '',
            "Property Name": p.name || '',
            "Location": p.location || '',
            "Type": p.type || '',
            "BHK": p.bhk || '',
            "Area": p.area || '',
            "Area Unit": global.getAreaUnitLabel(global.getAreaUnit(p)),
            "Dimensions": p.dim || p.dimensions || '',
            "Dimension Unit": global.getDimensionUnitLabel(global.getDimensionUnit(p)),
            "Facing": p.facing || '',
            "Road Width": p.road || '',
            "Price (₹)": Number(p.price) || 0,
            "Price Category": p.priceCategory || global.getPropertyCategory(p.price),
            "Budget Slab": p.budgetSlab || global.getPropertyBudgetSlab(p.price),
            "Status": p.status || '',
            "Owner / Broker": p.owner || '',
            "Phone": p.phone || '',
            "Follow-up Date": p.follow || '',
            "Google Maps URL": p.map || '',
            "Video URL": p.video || '',
            "Notes": p.notes || ''
          };
          propCFs.forEach(c => {
            let v = p.customFields ? p.customFields[c.key] : '';
            row[c.label] = Array.isArray(v) ? v.join(', ') : (v ?? '');
          });
          row["Favorite"] = p.favorite ? 'YES' : 'NO';
          row["Photo / Image Data"] = p.photo || '';
          row["Created Date"] = p.created || '';
          return row;
        });
        const wsProps = XLSX.utils.json_to_sheet(propRows);
        XLSX.utils.book_append_sheet(wb, wsProps, "Properties");

        // Direct Properties Sheet
        if (directList.length > 0) {
          const directCFs = getCustomFieldExportHeaders('direct');
          const directRows = directList.map(p => {
            let row = {
              "ID": p.id || '',
              "Direct Property Name": p.name || '',
              "Location": p.location || '',
              "Type": p.type || '',
              "BHK": p.bhk || '',
              "Area": p.area || '',
              "Area Unit": global.getAreaUnitLabel(global.getAreaUnit(p)),
              "Dimensions": p.dim || p.dimensions || '',
              "Dimension Unit": global.getDimensionUnitLabel(global.getDimensionUnit(p)),
              "Facing": p.facing || '',
              "Road Width": p.road || '',
              "Price (₹)": Number(p.price) || 0,
              "Price Category": p.priceCategory || global.getPropertyCategory(p.price),
              "Budget Slab": p.budgetSlab || global.getPropertyBudgetSlab(p.price),
              "Status": p.status || '',
              "Owner / Client Contact": p.owner || '',
              "Phone": p.phone || '',
              "Follow-up Date": p.follow || '',
              "Google Maps URL": p.map || '',
              "Video URL": p.video || '',
              "Notes": p.notes || ''
            };
            directCFs.forEach(c => {
              let v = p.customFields ? p.customFields[c.key] : '';
              row[c.label] = Array.isArray(v) ? v.join(', ') : (v ?? '');
            });
            row["Favorite"] = p.favorite ? 'YES' : 'NO';
            row["Photo / Image Data"] = p.photo || '';
            row["Created Date"] = p.created || '';
            return row;
          });
          const wsDirect = XLSX.utils.json_to_sheet(directRows);
          XLSX.utils.book_append_sheet(wb, wsDirect, "Direct Properties");
        }

        // Upcoming Projects Sheet
        const upCFs = getCustomFieldExportHeaders('project');
        const upRows = upList.map(p => {
          let row = {
            "ID": p.id || '',
            "Project Name": p.name || '',
            "Developer / Builder": p.developer || '',
            "Location": p.location || '',
            "Project Type": p.type || '',
            "BHK / Config": p.bhk || '',
            "Area / Plot Size": p.area || '',
            "Starting Price (₹)": Number(p.price) || 0,
            "Max Price (₹)": Number(p.maxPrice) || '',
            "Price Category": p.priceCategory || global.getPriceCategory(p.price),
            "Budget Slab": p.budgetSlab || global.getBudgetSlab(p.price),
            "Project Status": p.status || '',
            "Launch Date": p.launchDate || '',
            "Possession Date": p.possessionDate || '',
            "Contact Person": p.owner || '',
            "Contact Phone": p.phone || '',
            "Google Maps URL": p.map || '',
            "Brochure / Website": p.brochure || '',
            "Video URL": p.video || '',
            "Notes / Description": p.notes || ''
          };
          upCFs.forEach(c => {
            let v = p.customFields ? p.customFields[c.key] : '';
            row[c.label] = Array.isArray(v) ? v.join(', ') : (v ?? '');
          });
          row["Favorite"] = p.favorite ? 'YES' : 'NO';
          row["Photo / Image Data"] = p.photo || '';
          row["Created Date"] = p.created || '';
          return row;
        });
        const wsUp = XLSX.utils.json_to_sheet(upRows);
        XLSX.utils.book_append_sheet(wb, wsUp, "Upcoming Projects");

        // Favorites Sheet
        const favList = [
          ...dataList.filter(p => p.favorite).map(p => ({
            "Module": "Property",
            "ID": p.id || '',
            "Name / Project": p.name || '',
            "Location": p.location || '',
            "Type": p.type || '',
            "Price (₹)": Number(p.price) || 0,
            "Status": p.status || '',
            "Contact": p.owner || '',
            "Phone": p.phone || '',
            "Photo / Image Data": p.photo || ''
          })),
          ...directList.filter(p => p.favorite).map(p => ({
            "Module": "Direct Property",
            "ID": p.id || '',
            "Name / Project": p.name || '',
            "Location": p.location || '',
            "Type": p.type || '',
            "Price (₹)": Number(p.price) || 0,
            "Status": p.status || '',
            "Contact": p.owner || '',
            "Phone": p.phone || '',
            "Photo / Image Data": p.photo || ''
          })),
          ...upList.filter(u => u.favorite).map(u => ({
            "Module": "Upcoming Project",
            "ID": u.id || '',
            "Name / Project": u.name || '',
            "Location": u.location || '',
            "Type": u.type || '',
            "Price (₹)": Number(u.price) || 0,
            "Status": u.status || '',
            "Contact": u.owner || '',
            "Phone": u.phone || '',
            "Photo / Image Data": u.photo || ''
          }))
        ];
        const wsFav = XLSX.utils.json_to_sheet(favList);
        XLSX.utils.book_append_sheet(wb, wsFav, "Favorites");

        // Custom Fields Definitions Sheet
        const cfRows = (configObj.customFields || []).map(cf => ({
          "ID": cf.id || '',
          "Key": cf.key || '',
          "Label": cf.label || '',
          "Type": cf.type || 'text',
          "Applies To": cf.appliesTo || 'all',
          "Required": cf.required ? 'YES' : 'NO',
          "Searchable": cf.searchable !== false ? 'YES' : 'NO',
          "Filterable": cf.filterable !== false ? 'YES' : 'NO',
          "Exportable": cf.exportable !== false ? 'YES' : 'NO',
          "Enabled": cf.enabled !== false ? 'YES' : 'NO',
          "Placeholder": cf.placeholder || '',
          "Default Value": cf.defaultValue || '',
          "Options": Array.isArray(cf.options) ? cf.options.join(', ') : ''
        }));
        if (cfRows.length) {
          const wsCF = XLSX.utils.json_to_sheet(cfRows);
          XLSX.utils.book_append_sheet(wb, wsCF, "Custom Fields");
        }

        // CRM Info Sheet
        const metaRows = [
          { "Parameter": "Application", "Value": "Property Manager Pro" },
          { "Parameter": "Version", "Value": "2.0" },
          { "Parameter": "Export Date", "Value": new Date().toISOString() },
          { "Parameter": "Total Properties", "Value": dataList.length },
          { "Parameter": "Total Direct Properties", "Value": directList.length },
          { "Parameter": "Total Upcoming Projects", "Value": upList.length },
          { "Parameter": "Total Favorites", "Value": favList.length },
          { "Parameter": "Total Custom Fields", "Value": cfRows.length },
          { "Parameter": "Storage Engine", "Value": "IndexedDB" }
        ];
        const wsMeta = XLSX.utils.json_to_sheet(metaRows);
        XLSX.utils.book_append_sheet(wb, wsMeta, "CRM Info");

        XLSX.writeFile(wb, `Property_Manager_Backup_${dateStr}.xlsx`);
        global.toast(`Excel Backup exported successfully (.xlsx)`);
      } else {
        // Offline XML SpreadsheetML fallback
        exportSpreadsheetML(dateStr);
        global.toast(`Excel Backup exported successfully (.xls)`);
      }
    } catch (err) {
      console.error('Backup export error:', err);
      exportJsonBackup();
    }
  }

  function exportJsonBackup() {
    const dateStr = new Date().toISOString().slice(0, 10);
    let dataList = (typeof global.data !== 'undefined' && Array.isArray(global.data)) ? global.data : [];
    let directList = (typeof global.directData !== 'undefined' && Array.isArray(global.directData)) ? global.directData : [];
    let upList = (typeof global.upcomingData !== 'undefined' && Array.isArray(global.upcomingData)) ? global.upcomingData : [];

    const payload = {
      version: 3,
      crmVersion: "2.0",
      exportDate: new Date().toISOString(),
      properties: dataList.map(global.normalizeProperty),
      directProperties: directList.map(global.normalizeDirectProperty),
      upcomingProjects: upList.map(global.normalizeUpcoming),
      config: global.appConfig,
      profile: (typeof global.loadProfile === 'function') ? global.loadProfile() : global.currentProfile,
      history: (typeof global.getHistoryData === 'function') ? global.getHistoryData() : {}
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Property_Manager_Full_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 200);
    global.toast('Full CRM JSON Backup downloaded');
  }

  function extractCustomFieldsFromExcelRow(row, module) {
    let res = {};
    let knownFields = (global.appConfig && global.appConfig.customFields || []).filter(cf => cf.appliesTo === 'all' || cf.appliesTo === 'both' || cf.appliesTo === module);
    for (let key of Object.keys(row)) {
      let cf = knownFields.find(f => f.label.toLowerCase() === key.toLowerCase() || f.key.toLowerCase() === key.toLowerCase());
      if (cf) {
        let val = row[key];
        if (cf.type === 'multiselect' && typeof val === 'string') {
          val = val.split(',').map(s => s.trim()).filter(Boolean);
        } else if (cf.type === 'checkbox') {
          val = String(val).toUpperCase() === 'YES' || val === true || val === 1 || String(val) === 'true';
        }
        res[cf.key] = val;
      }
    }
    return res;
  }

  function importData() {
    let i = document.createElement('input');
    i.type = 'file';
    i.accept = '.xlsx, .xls, .json';
    i.onchange = async () => {
      let file = i.files && i.files[0];
      if (!file) return;
      let fileName = file.name.toLowerCase();
      let importBatchId = (typeof global.generateImportBatchId === 'function') ? global.generateImportBatchId() : ('imp_' + Date.now());

      // 1. JSON FILE IMPORT
      if (fileName.endsWith('.json')) {
        try {
          let text = await file.text();
          let x = JSON.parse(text);
          let importedProps = 0;
          let importedDirect = 0;
          let importedUpcoming = 0;

          // Restore custom fields schema if present
          if (x && x.config && Array.isArray(x.config.customFields)) {
            if (!global.appConfig.customFields) global.appConfig.customFields = [];
            x.config.customFields.forEach(cf => {
              if (cf && cf.key && !global.appConfig.customFields.some(existing => existing.key === cf.key)) {
                global.appConfig.customFields.push({ ...cf, isExample: false });
              }
            });
            if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
          }

          if (Array.isArray(x)) {
            if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
            let newProps = x.map((p, idx) => {
              let item = global.normalizeProperty(p);
              item.isDemo = false;
              if (!item.importBatchId) {
                item.importBatchId = importBatchId;
                item.sourceType = 'import';
                item.sourceFileName = file.name;
              }
              if (!item.id || (global.data || []).some(existing => existing.id === item.id)) {
                item.id = importBatchId + '_p_' + (idx + 1);
              }
              return item;
            });
            importedProps = newProps.length;
            global.data = [...newProps, ...(global.data || [])];
            global.save();
            if (typeof global.renderAll === 'function') global.renderAll();
            if (typeof global.addImportHistoryRecord === 'function') {
              global.addImportHistoryRecord({
                importBatchId: importBatchId,
                fileName: file.name,
                propertiesCount: importedProps,
                directPropertiesCount: 0,
                upcomingCount: 0,
                sourceType: 'JSON Backup',
                status: 'Successful'
              });
            }
            global.toast(`JSON imported: ${importedProps} Properties`);
          } else if (x && (Array.isArray(x.properties) || Array.isArray(x.upcoming) || Array.isArray(x.upcomingProjects) || Array.isArray(x.directProperties) || Array.isArray(x.direct))) {
            if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
            if (Array.isArray(x.properties)) {
              let newProps = x.properties.map((p, idx) => {
                let item = global.normalizeProperty(p);
                item.isDemo = false;
                if (!item.importBatchId) {
                  item.importBatchId = importBatchId;
                  item.sourceType = 'import';
                  item.sourceFileName = file.name;
                }
                if (!item.id || (global.data || []).some(existing => existing.id === item.id)) {
                  item.id = importBatchId + '_p_' + (idx + 1);
                }
                return item;
              });
              importedProps = newProps.length;
              global.data = [...newProps, ...(global.data || [])];
              global.save();
            }

            let upArr = Array.isArray(x.upcomingProjects) ? x.upcomingProjects : (Array.isArray(x.upcoming) ? x.upcoming : []);
            if (upArr.length) {
              let newUpcoming = upArr.map((u, idx) => {
                let item = global.normalizeUpcoming(u);
                item.isDemo = false;
                if (!item.importBatchId) {
                  item.importBatchId = importBatchId;
                  item.sourceType = 'import';
                  item.sourceFileName = file.name;
                }
                if (!item.id || (global.upcomingData || []).some(existing => existing.id === item.id)) {
                  item.id = importBatchId + '_up_' + (idx + 1);
                }
                return item;
              });
              importedUpcoming = newUpcoming.length;
              global.upcomingData = [...newUpcoming, ...(global.upcomingData || [])];
              global.saveUpcoming();
            }

            let directArr = Array.isArray(x.directProperties) ? x.directProperties : (Array.isArray(x.direct) ? x.direct : []);
            if (directArr.length) {
              let newDirect = directArr.map((dp, idx) => {
                let item = global.normalizeDirectProperty(dp);
                item.isDemo = false;
                if (!item.importBatchId) {
                  item.importBatchId = importBatchId;
                  item.sourceType = 'import';
                  item.sourceFileName = file.name;
                }
                if (!item.id || (global.directData || []).some(existing => existing.id === item.id)) {
                  item.id = importBatchId + '_dp_' + (idx + 1);
                }
                return item;
              });
              importedDirect = newDirect.length;
              global.directData = [...newDirect, ...(global.directData || [])];
              global.saveDirect();
            }

            if (typeof global.renderAll === 'function') global.renderAll();
            if (typeof global.addImportHistoryRecord === 'function') {
              global.addImportHistoryRecord({
                importBatchId: importBatchId,
                fileName: file.name,
                propertiesCount: importedProps,
                directPropertiesCount: importedDirect,
                upcomingCount: importedUpcoming,
                sourceType: 'JSON Backup',
                status: 'Successful'
              });
            }
            global.toast(`Full backup imported: ${importedProps} Properties, ${importedDirect} Direct, ${importedUpcoming} Upcoming Projects`);
          } else {
            throw new Error('Unrecognized JSON backup structure');
          }
        } catch (e) {
          console.error('JSON import error:', e);
          global.toast('Invalid or corrupted JSON backup file');
        }
        return;
      }

      // 2. EXCEL FILE (.xlsx, .xls) IMPORT
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        try {
          if (!window.XLSX) {
            throw new Error('Excel parser library not loaded. Please connect to internet or use JSON backup.');
          }
          const XLSX = window.XLSX;
          let buffer = await file.arrayBuffer();
          let wb = XLSX.read(buffer, { type: 'array' });

          let importedProps = 0;
          let importedDirect = 0;
          let importedUpcoming = 0;

          // A. Restore Custom Fields Definitions from Custom Fields Sheet if present
          let cfSheetName = wb.SheetNames.find(s => /custom\s*field/i.test(s.trim()));
          if (cfSheetName && wb.Sheets[cfSheetName]) {
            let cfRows = XLSX.utils.sheet_to_json(wb.Sheets[cfSheetName]);
            if (Array.isArray(cfRows) && cfRows.length) {
              if (!global.appConfig.customFields) global.appConfig.customFields = [];
              cfRows.forEach(r => {
                let key = String(r['Key'] || r['key'] || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
                let label = String(r['Label'] || r['label'] || r['Field Label'] || '').trim();
                if (key && label && !global.appConfig.customFields.some(existing => existing.key === key)) {
                  let rawOpts = String(r['Options'] || r['options'] || '').trim();
                  let opts = rawOpts ? rawOpts.split(',').map(s => s.trim()).filter(Boolean) : [];
                  global.appConfig.customFields.push({
                    id: String(r['ID'] || ('cf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4))),
                    key: key,
                    label: label,
                    type: String(r['Type'] || r['type'] || 'text').toLowerCase(),
                    appliesTo: String(r['Applies To'] || r['appliesTo'] || 'all').toLowerCase(),
                    required: String(r['Required'] || '').toUpperCase() === 'YES',
                    searchable: String(r['Searchable'] || '').toUpperCase() !== 'NO',
                    filterable: String(r['Filterable'] || '').toUpperCase() !== 'NO',
                    exportable: String(r['Exportable'] || '').toUpperCase() !== 'NO',
                    enabled: String(r['Enabled'] || '').toUpperCase() !== 'NO',
                    placeholder: String(r['Placeholder'] || ''),
                    defaultValue: String(r['Default Value'] || ''),
                    options: opts,
                    isExample: false
                  });
                }
              });
              if (typeof global.saveAppConfig === 'function') global.saveAppConfig(global.appConfig);
            }
          }

          // B. Check for Properties sheet
          let propSheetName = wb.SheetNames.find(s => /^prop/i.test(s.trim()));
          if (!propSheetName && wb.SheetNames.length > 0) {
            let testRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            if (testRows.length && (testRows[0]['Property Name'] || testRows[0]['Road Width'] || testRows[0]['Dimensions'])) {
              propSheetName = wb.SheetNames[0];
            }
          }

          if (propSheetName && wb.Sheets[propSheetName]) {
            let rows = XLSX.utils.sheet_to_json(wb.Sheets[propSheetName]);
            if (rows && rows.length) {
              let newProps = rows.map((row, idx) => {
                let priceNum = Number(row['Price (₹)'] || row['Price'] || row['price']) || 0;
                let areaNum = Number(row['Area'] ?? row['Area (yd²)'] ?? row['area'] ?? 0) || 0;
                let rawAreaUnit = String(row['Area Unit'] || row['areaUnit'] || row['Area unit'] || '').toLowerCase().trim();
                let areaUnit = (rawAreaUnit === 'sqft' || rawAreaUnit === 'sqmtr' || rawAreaUnit === 'sqyard') ? rawAreaUnit : 'sqyard';

                let dimStr = String(row['Dimensions'] || row['dim'] || row['dimensions'] || '').trim();
                let rawDimUnit = String(row['Dimension Unit'] || row['dimensionUnit'] || row['Dimension unit'] || '').toLowerCase().trim();
                let dimensionUnit = '';
                if (rawDimUnit === 'ft' || rawDimUnit === 'meter' || rawDimUnit === 'yard') {
                  dimensionUnit = rawDimUnit;
                } else {
                  if (areaUnit === 'sqft') dimensionUnit = 'ft';
                  else if (areaUnit === 'sqmtr') dimensionUnit = 'meter';
                  else dimensionUnit = 'yard';
                }

                let assignedId = String(row['ID'] || row['id'] || '').trim();
                if (!assignedId || (global.data || []).some(existing => existing.id === assignedId)) {
                  assignedId = importBatchId + '_p_' + (idx + 1);
                }

                let customFields = extractCustomFieldsFromExcelRow(row, 'property');

                let p = global.normalizeProperty({
                  id: assignedId,
                  importBatchId: importBatchId,
                  sourceType: 'import',
                  sourceFileName: file.name,
                  name: String(row['Property Name'] || row['Name'] || row['name'] || 'Unnamed Property'),
                  location: String(row['Location'] || row['location'] || ''),
                  type: String(row['Type'] || row['type'] || 'Plot'),
                  bhk: String(row['BHK'] || row['bhk'] || ''),
                  area: areaNum,
                  areaUnit: areaUnit,
                  dim: dimStr,
                  dimensions: dimStr,
                  dimensionUnit: dimensionUnit,
                  facing: String(row['Facing'] || row['facing'] || ''),
                  road: String(row['Road Width'] || row['road'] || ''),
                  price: priceNum,
                  priceCategory: String(row['Price Category'] || global.getPropertyCategory(priceNum)),
                  budgetSlab: String(row['Budget Slab'] || global.getPropertyBudgetSlab(priceNum)),
                  status: String(row['Status'] || row['status'] || 'Available'),
                  owner: String(row['Owner / Broker'] || row['Owner'] || row['owner'] || ''),
                  phone: String(row['Phone'] || row['phone'] || ''),
                  follow: String(row['Follow-up Date'] || row['follow'] || ''),
                  map: String(row['Google Maps URL'] || row['map'] || ''),
                  video: String(row['Video URL'] || row['video'] || ''),
                  notes: String(row['Notes'] || row['notes'] || ''),
                  customFields: customFields,
                  favorite: String(row['Favorite'] || row['favorite']).toUpperCase() === 'YES' || row['favorite'] === true,
                  photo: String(row['Photo / Image Data'] || row['Photo URL'] || row['Photo'] || row['photo'] || ''),
                  created: String(row['Created Date'] || row['created'] || new Date().toISOString().slice(0, 10)),
                  isDemo: false
                });
                return p;
              });
              if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
              importedProps = newProps.length;
              global.data = [...newProps, ...(global.data || [])];
              global.save();
            }
          }

          // C. Check for Direct Properties sheet
          let directSheetName = wb.SheetNames.find(s => /^direct/i.test(s.trim()));
          if (directSheetName && wb.Sheets[directSheetName]) {
            let rows = XLSX.utils.sheet_to_json(wb.Sheets[directSheetName]);
            if (rows && rows.length) {
              let newDirect = rows.map((row, idx) => {
                let priceNum = Number(row['Price (₹)'] || row['Price'] || row['price']) || 0;
                let areaNum = Number(row['Area'] ?? row['Area (yd²)'] ?? row['area'] ?? 0) || 0;
                let rawAreaUnit = String(row['Area Unit'] || row['areaUnit'] || row['Area unit'] || '').toLowerCase().trim();
                let areaUnit = (rawAreaUnit === 'sqft' || rawAreaUnit === 'sqmtr' || rawAreaUnit === 'sqyard') ? rawAreaUnit : 'sqyard';

                let dimStr = String(row['Dimensions'] || row['dim'] || row['dimensions'] || '').trim();
                let rawDimUnit = String(row['Dimension Unit'] || row['dimensionUnit'] || row['Dimension unit'] || '').toLowerCase().trim();
                let dimensionUnit = '';
                if (rawDimUnit === 'ft' || rawDimUnit === 'meter' || rawDimUnit === 'yard') {
                  dimensionUnit = rawDimUnit;
                } else {
                  if (areaUnit === 'sqft') dimensionUnit = 'ft';
                  else if (areaUnit === 'sqmtr') dimensionUnit = 'meter';
                  else dimensionUnit = 'yard';
                }

                let assignedId = String(row['ID'] || row['id'] || '').trim();
                if (!assignedId || (global.directData || []).some(existing => existing.id === assignedId)) {
                  assignedId = importBatchId + '_dp_' + (idx + 1);
                }

                let customFields = extractCustomFieldsFromExcelRow(row, 'direct');

                let dp = global.normalizeDirectProperty({
                  id: assignedId,
                  importBatchId: importBatchId,
                  sourceType: 'import',
                  sourceFileName: file.name,
                  name: String(row['Direct Property Name'] || row['Property Name'] || row['Name'] || row['name'] || 'Unnamed Direct Property'),
                  location: String(row['Location'] || row['location'] || ''),
                  type: String(row['Type'] || row['type'] || 'Villa'),
                  bhk: String(row['BHK'] || row['bhk'] || ''),
                  area: areaNum,
                  areaUnit: areaUnit,
                  dim: dimStr,
                  dimensions: dimStr,
                  dimensionUnit: dimensionUnit,
                  facing: String(row['Facing'] || row['facing'] || ''),
                  road: String(row['Road Width'] || row['road'] || ''),
                  price: priceNum,
                  priceCategory: String(row['Price Category'] || global.getPropertyCategory(priceNum)),
                  budgetSlab: String(row['Budget Slab'] || global.getPropertyBudgetSlab(priceNum)),
                  status: String(row['Status'] || row['status'] || 'Available'),
                  owner: String(row['Owner / Client Contact'] || row['Owner'] || row['owner'] || ''),
                  phone: String(row['Phone'] || row['phone'] || ''),
                  follow: String(row['Follow-up Date'] || row['follow'] || ''),
                  map: String(row['Google Maps URL'] || row['map'] || ''),
                  video: String(row['Video URL'] || row['video'] || ''),
                  notes: String(row['Notes'] || row['notes'] || ''),
                  customFields: customFields,
                  favorite: String(row['Favorite'] || row['favorite']).toUpperCase() === 'YES' || row['favorite'] === true,
                  photo: String(row['Photo / Image Data'] || row['Photo URL'] || row['Photo'] || row['photo'] || ''),
                  created: String(row['Created Date'] || row['created'] || new Date().toISOString().slice(0, 10)),
                  isDirect: true,
                  source: 'direct',
                  isDemo: false
                });
                return dp;
              });
              if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
              importedDirect = newDirect.length;
              global.directData = [...newDirect, ...(global.directData || [])];
              global.saveDirect();
            }
          }

          // D. Check for Upcoming Projects sheet
          let upSheetName = wb.SheetNames.find(s => /upcom/i.test(s.trim()));
          if (!upSheetName && wb.SheetNames.length > 1) {
            let testRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]]);
            if (testRows.length && (testRows[0]['Project Name'] || testRows[0]['Developer / Builder'] || testRows[0]['Starting Price (₹)'])) {
              upSheetName = wb.SheetNames[1];
            }
          }

          if (upSheetName && wb.Sheets[upSheetName]) {
            let rows = XLSX.utils.sheet_to_json(wb.Sheets[upSheetName]);
            if (rows && rows.length) {
              let newUpcoming = rows.map((row, idx) => {
                let priceNum = Number(row['Starting Price (₹)'] || row['Price (₹)'] || row['Price'] || row['price']) || 0;
                let assignedId = String(row['ID'] || row['id'] || '').trim();
                if (!assignedId || (global.upcomingData || []).some(existing => existing.id === assignedId)) {
                  assignedId = importBatchId + '_up_' + (idx + 1);
                }

                let customFields = extractCustomFieldsFromExcelRow(row, 'project');

                let u = global.normalizeUpcoming({
                  id: assignedId,
                  importBatchId: importBatchId,
                  sourceType: 'import',
                  sourceFileName: file.name,
                  name: String(row['Project Name'] || row['Name'] || row['name'] || 'Unnamed Project'),
                  developer: String(row['Developer / Builder'] || row['Developer'] || row['developer'] || ''),
                  location: String(row['Location'] || row['location'] || ''),
                  type: String(row['Project Type'] || row['Type'] || row['type'] || 'Apartment'),
                  bhk: String(row['BHK / Config'] || row['BHK'] || row['bhk'] || ''),
                  area: String(row['Area / Plot Size'] || row['Area'] || row['area'] || ''),
                  price: priceNum,
                  maxPrice: Number(row['Max Price (₹)'] || row['maxPrice']) || 0,
                  priceCategory: String(row['Price Category'] || global.getPriceCategory(priceNum)),
                  budgetSlab: String(row['Budget Slab'] || global.getBudgetSlab(priceNum)),
                  status: String(row['Project Status'] || row['Status'] || row['status'] || 'Upcoming'),
                  launchDate: String(row['Launch Date'] || row['launchDate'] || ''),
                  possessionDate: String(row['Possession Date'] || row['possessionDate'] || ''),
                  owner: String(row['Contact Person'] || row['Owner'] || row['owner'] || ''),
                  phone: String(row['Contact Phone'] || row['Phone'] || row['phone'] || ''),
                  map: String(row['Google Maps URL'] || row['map'] || ''),
                  brochure: String(row['Brochure / Website'] || row['brochure'] || ''),
                  video: String(row['Video URL'] || row['video'] || ''),
                  notes: String(row['Notes / Description'] || row['Notes'] || row['notes'] || ''),
                  customFields: customFields,
                  favorite: String(row['Favorite'] || row['favorite']).toUpperCase() === 'YES' || row['favorite'] === true,
                  photo: String(row['Photo / Image Data'] || row['Photo URL'] || row['Photo'] || row['photo'] || ''),
                  created: String(row['Created Date'] || row['created'] || new Date().toISOString().slice(0, 10)),
                  isDemo: false
                });
                return u;
              });
              if (typeof global.clearDemoDataIfNeeded === 'function') global.clearDemoDataIfNeeded();
              importedUpcoming = newUpcoming.length;
              global.upcomingData = [...newUpcoming, ...(global.upcomingData || [])];
              global.saveUpcoming();
            }
          }

          if (importedProps > 0 || importedDirect > 0 || importedUpcoming > 0) {
            if (typeof global.renderAll === 'function') global.renderAll();
            if (typeof global.addImportHistoryRecord === 'function') {
              global.addImportHistoryRecord({
                importBatchId: importBatchId,
                fileName: file.name,
                propertiesCount: importedProps,
                directPropertiesCount: importedDirect,
                upcomingCount: importedUpcoming,
                sourceType: 'Excel Backup',
                status: 'Successful'
              });
            }
            global.toast(`Excel imported: ${importedProps} Properties${importedDirect ? ', ' + importedDirect + ' Direct' : ''}, ${importedUpcoming} Upcoming Projects`);
          } else {
            global.toast('No recognized property records found in Excel file');
          }
        } catch (err) {
          console.error('Import error:', err);
          global.toast('Failed to parse Excel file: ' + (err.message || 'Unknown error'));
        }
        return;
      }

      global.toast('Please select a valid .xlsx, .xls or .json backup file');
    };
    i.click();
  }

  function restoreDemo() {
    if (confirm('Restore the demo dataset? Current local changes will be replaced.')) {
      try {
        localStorage.removeItem(global.DEMO_CLEARED_KEY || 'property_manager_pro_demo_cleared_v1');
      } catch (e) {}
      global.data = (global.initial || []).map((p, i) => ({
        ...p,
        id: 'p' + (i + 1),
        isDemo: true,
        priceCategory: global.getPropertyCategory(p.price),
        budgetSlab: global.getPropertyBudgetSlab(p.price)
      }));
      global.upcomingData = (global.initialUpcoming || []).map((p, i) => ({
        ...p,
        id: 'up' + (i + 1),
        isDemo: true,
        priceCategory: global.getPriceCategory(p.price),
        budgetSlab: global.getBudgetSlab(p.price),
        favorite: p.favorite || false
      }));
      if (typeof global.initialDirect !== 'undefined' && Array.isArray(global.initialDirect)) {
        global.directData = global.initialDirect.map((p, i) => ({
          ...p,
          id: 'dp' + (i + 1),
          isDemo: true,
          priceCategory: global.getPropertyCategory(p.price),
          budgetSlab: global.getPropertyBudgetSlab(p.price),
          isDirect: true,
          source: 'direct'
        }));
        global.saveDirect();
      }
      global.save();
      global.saveUpcoming();
      if (typeof global.renderAll === 'function') global.renderAll();
      global.toast('Demo data restored');
    }
  }

  // Export to global scope
  global.getCustomFieldExportHeaders = getCustomFieldExportHeaders;
  global.exportSpreadsheetML = exportSpreadsheetML;
  global.exportBackup = exportBackup;
  global.exportJsonBackup = exportJsonBackup;
  global.exportJSON = exportJsonBackup;
  global.extractCustomFieldsFromExcelRow = extractCustomFieldsFromExcelRow;
  global.importData = importData;
  global.importJSON = importData;
  global.restoreDemo = restoreDemo;

})(typeof window !== 'undefined' ? window : globalThis);
