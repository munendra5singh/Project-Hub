export const SHORTCUTS_DB = [
    {
        id: "sc_save",
        action: "Save Workbook",
        category: "File Management",
        description: "Saves the currently open workbook layout to disk storage or network cloud sync location.",
        mappings: {
            windows: { keys: ["Ctrl", "S"], display: "Ctrl + S" },
            mac: { keys: ["Cmd", "S"], display: "⌘ + S" }
        }
    },
    {
        id: "sc_vlookup_wizard",
        action: "Open Insert Function Dialog",
        category: "Formula Editing",
        description: "Launches the helper function modal directly at the cursor location to inspect expected arguments.",
        mappings: {
            windows: { keys: ["Shift", "F3"], display: "Shift + F3" },
            mac: { keys: ["Shift", "F3"], display: "⇧ + F3" }
        }
    },
    {
        id: "sc_toggle_formulas",
        action: "Toggle Formula Visibility Display",
        category: "Auditing & Debugging",
        description: "Switches the global worksheet viewport rendering between calculated cell output views and actual structural code strings.",
        mappings: {
            windows: { keys: ["Ctrl", "`"], display: "Ctrl + `" },
            mac: { keys: ["Ctrl", "`"], display: "⌃ + `" }
        }
    },
    {
        id: "sc_flash_fill",
        action: "Trigger Flash Fill Execution",
        category: "Data Manipulation",
        description: "Automatically detects visual text layout formatting trends across adjacent vertical columns to auto-complete records dynamically.",
        mappings: {
            windows: { keys: ["Ctrl", "E"], display: "Ctrl + E" },
            mac: { keys: ["Cmd", "E"], display: "⌘ + E" }
        }
    },
    {
        id: "sc_absolute_reference",
        action: "Toggle Cell Reference Locking ($)",
        category: "Formula Editing",
        description: "Cycles through combinations of absolute and relative row/column locks ($A$1, A$1, $A1, A1) for selected references within the formula bar.",
        mappings: {
            windows: { keys: ["F4"], display: "F4" },
            mac: { keys: ["Cmd", "T"], display: "⌘ + T" }
        }
    },
    {
        id: "sc_paste_special",
        action: "Open Paste Special Menu",
        category: "Data Manipulation",
        description: "Launches advanced pipeline options to paste values only, formatting layers, mathematical transformations, or transposed grids.",
        mappings: {
            windows: { keys: ["Ctrl", "Alt", "V"], display: "Ctrl + Alt + V" },
            mac: { keys: ["Cmd", "Option", "V"], display: "⌘ + ⌥ + V" }
        }
    },
    {
        id: "sc_undo",
        action: "Undo Last Action",
        category: "Basic Editing",
        description: "Reverts the most recent structural alteration, cell entry, or format modification within the active sheet context.",
        mappings: {
            windows: { keys: ["Ctrl", "Z"], display: "Ctrl + Z" },
            mac: { keys: ["Cmd", "Z"], display: "⌘ + Z" }
        }
    },
    {
        id: "sc_redo",
        action: "Redo Last Action",
        category: "Basic Editing",
        description: "Re-executes the last undone mutation sequence or user operation back into the workbook state tree.",
        mappings: {
            windows: { keys: ["Ctrl", "Y"], display: "Ctrl + Y" },
            mac: { keys: ["Cmd", "Y"], display: "⌘ + Y" }
        }
    },
    {
        id: "sc_copy",
        action: "Copy Selected Cells",
        category: "Basic Editing",
        description: "Duplicates the currently selected cell matrix records, values, and styling configurations onto the clipboard memory.",
        mappings: {
            windows: { keys: ["Ctrl", "C"], display: "Ctrl + C" },
            mac: { keys: ["Cmd", "C"], display: "⌘ + C" }
        }
    },
    {
        id: "sc_cut",
        action: "Cut Selected Cells",
        category: "Basic Editing",
        description: "Removes targeted range segments from their source grid layout coordinates while copying them into system memory for relocation.",
        mappings: {
            windows: { keys: ["Ctrl", "X"], display: "Ctrl + X" },
            mac: { keys: ["Cmd", "X"], display: "⌘ + X" }
        }
    },
    {
        id: "sc_paste",
        action: "Standard Paste Action",
        category: "Basic Editing",
        description: "Inserts the primary clipboard content payload directly over the target range intersection, overriding previous text data.",
        mappings: {
            windows: { keys: ["Ctrl", "V"], display: "Ctrl + V" },
            mac: { keys: ["Cmd", "V"], display: "⌘ + V" }
        }
    },
    {
        id: "sc_select_all",
        action: "Select Entire Worksheet",
        category: "Navigation & Selection",
        description: "Highlights all operational cells and intersection points throughout the viewport boundary structure.",
        mappings: {
            windows: { keys: ["Ctrl", "A"], display: "Ctrl + A" },
            mac: { keys: ["Cmd", "A"], display: "⌘ + A" }
        }
    },
    {
        id: "sc_bold",
        action: "Apply Bold Formatting",
        category: "Text Formatting",
        description: "Toggles the heavy visual font weight styling parameter on or off for cell texts in selection frames.",
        mappings: {
            windows: { keys: ["Ctrl", "B"], display: "Ctrl + B" },
            mac: { keys: ["Cmd", "B"], display: "⌘ + B" }
        }
    },
    {
        id: "sc_italic",
        action: "Apply Italic Formatting",
        category: "Text Formatting",
        description: "Applies or neutralizes cursive-slanted textual styling configurations directly onto the focused field array.",
        mappings: {
            windows: { keys: ["Ctrl", "I"], display: "Ctrl + I" },
            mac: { keys: ["Cmd", "I"], display: "⌘ + I" }
        }
    },
    {
        id: "sc_underline",
        action: "Apply Underline Formatting",
        category: "Text Formatting",
        description: "Draws an explicit solid line anchor base layer beneath character strings within selected coordinates.",
        mappings: {
            windows: { keys: ["Ctrl", "U"], display: "Ctrl + U" },
            mac: { keys: ["Cmd", "U"], display: "⌘ + U" }
        }
    },
    {
        id: "sc_strikethrough",
        action: "Apply Strikethrough Layout",
        category: "Text Formatting",
        description: "Renders a horizontal baseline text strikethrough across metadata values to depict logical exclusion.",
        mappings: {
            windows: { keys: ["Ctrl", "5"], display: "Ctrl + 5" },
            mac: { keys: ["Cmd", "Shift", "X"], display: "⌘ + ⇧ + X" }
        }
    },
    {
        id: "sc_find",
        action: "Open Find Tab Menu",
        category: "Search & Replace",
        description: "Launches the query discovery dialog wizard engine to trace substring sequences across open data cells.",
        mappings: {
            windows: { keys: ["Ctrl", "F"], display: "Ctrl + F" },
            mac: { keys: ["Cmd", "F"], display: "⌘ + F" }
        }
    },
    {
        id: "sc_replace",
        action: "Open Replace Window Layout",
        category: "Search & Replace",
        description: "Exposes matching pattern search engines with corresponding substitution fields to mass overwrite records.",
        mappings: {
            windows: { keys: ["Ctrl", "H"], display: "Ctrl + H" },
            mac: { keys: ["Ctrl", "H"], display: "⌃ + H" }
        }
    },
    {
        id: "sc_goto",
        action: "Open Go To Dialog Window",
        category: "Navigation & Selection",
        description: "Prompts specific vector address location lookups to jump coordinates immediately over complex arrays.",
        mappings: {
            windows: { keys: ["F5"], display: "F5" },
            mac: { keys: ["F5"], display: "F5" }
        }
    },
    {
        id: "sc_new_workbook",
        action: "Create New Clean Workbook",
        category: "File Management",
        description: "Spawns a generic fresh multi-sheet workspace canvas completely detached from currently active file instances.",
        mappings: {
            windows: { keys: ["Ctrl", "N"], display: "Ctrl + N" },
            mac: { keys: ["Cmd", "N"], display: "⌘ + N" }
        }
    },
    {
        id: "sc_open_workbook",
        action: "Open Existing Workbook Document",
        category: "File Management",
        description: "Triggers the storage directories overlay to parse and load compiled grid templates from local disk sources.",
        mappings: {
            windows: { keys: ["Ctrl", "O"], display: "Ctrl + O" },
            mac: { keys: ["Cmd", "O"], display: "⌘ + O" }
        }
    },
    {
        id: "sc_print_menu",
        action: "Trigger Print Layout Preview",
        category: "File Management",
        description: "Initializes hard-copy scaling diagnostics and system interface setups prior to physical documentation printing.",
        mappings: {
            windows: { keys: ["Ctrl", "P"], display: "Ctrl + P" },
            mac: { keys: ["Cmd", "P"], display: "⌘ + P" }
        }
    },
    {
        id: "sc_close_workbook",
        action: "Close Current Operational File",
        category: "File Management",
        description: "Shuts down the targeted workbook runtime stack pipeline without fully terminating the host application process.",
        mappings: {
            windows: { keys: ["Ctrl", "W"], display: "Ctrl + W" },
            mac: { keys: ["Cmd", "W"], display: "⌘ + W" }
        }
    },
    {
        id: "sc_exit_excel",
        action: "Quit Application Instance",
        category: "File Management",
        description: "Gracefully kills all executing Excel threads, prompts unsaved state memory commits, and clears RAM layouts.",
        mappings: {
            windows: { keys: ["Alt", "F4"], display: "Alt + F4" },
            mac: { keys: ["Cmd", "Q"], display: "⌘ + Q" }
        }
    },
    {
        id: "sc_save_as",
        action: "Trigger Save As Engine Panel",
        category: "File Management",
        description: "Redirects file state captures to alternative directories or different formatting standard extensions.",
        mappings: {
            windows: { keys: ["F12"], display: "F12" },
            mac: { keys: ["Cmd", "Shift", "S"], display: "⌘ + ⇧ + S" }
        }
    },
    {
        id: "sc_help_menu",
        action: "Launch Office Help Desk Support",
        category: "System Helpers",
        description: "Summons documentation catalogs and community cloud search indexes within a side context container panel.",
        mappings: {
            windows: { keys: ["F1"], display: "F1" },
            mac: { keys: ["F1"], display: "F1" }
        }
    },
    {
        id: "sc_fill_down",
        action: "Fill Down Selection Vector",
        category: "Data Manipulation",
        description: "Clones formulas or structural raw records from upper edge coordinates downward along highlights.",
        mappings: {
            windows: { keys: ["Ctrl", "D"], display: "Ctrl + D" },
            mac: { keys: ["Cmd", "D"], display: "⌘ + D" }
        }
    },
    {
        id: "sc_fill_right",
        action: "Fill Right Selection Matrix",
        category: "Data Manipulation",
        description: "Transfers the far leftmost template value cell sequentially rightward inside chosen horizontal matrices.",
        mappings: {
            windows: { keys: ["Ctrl", "R"], display: "Ctrl + R" },
            mac: { keys: ["Cmd", "R"], display: "⌘ + R" }
        }
    },
    {
        id: "sc_insert_table",
        action: "Initialize Standard Excel Table Object",
        category: "Data Manipulation",
        description: "Transforms plain rectangular ranges into structured query tables with structured formula references.",
        mappings: {
            windows: { keys: ["Ctrl", "T"], display: "Ctrl + T" },
            mac: { keys: ["Cmd", "T"], display: "⌘ + T" }
        }
    },
    {
        id: "sc_autosum",
        action: "Inject AutoSum Calculation Loop",
        category: "Formula Editing",
        description: "Heuristically targets adjoining structural values to parse boundaries and craft an inline sum function logic.",
        mappings: {
            windows: { keys: ["Alt", "="], display: "Alt + =" },
            mac: { keys: ["Cmd", "Shift", "T"], display: "⌘ + ⇧ + T" }
        }
    },
    {
        id: "sc_current_date",
        action: "Insert Static Current Date Timestamp",
        category: "Data Manipulation",
        description: "Stamps an immutable current date ledger token into selected active field segments without volatile tracking hooks.",
        mappings: {
            windows: { keys: ["Ctrl", ";"], display: "Ctrl + ;" },
            mac: { keys: ["Ctrl", ";"], display: "⌃ + ;" }
        }
    },
    {
        id: "sc_current_time",
        action: "Insert Static Current Time Stamp",
        category: "Data Manipulation",
        description: "Hardcodes modern standard regional wall-clock durations instantly inside designated row coordinates.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", ";"], display: "Ctrl + Shift + ;" },
            mac: { keys: ["Cmd", ";"], display: "⌘ + ;" }
        }
    },
    {
        id: "sc_cell_format_dialog",
        action: "Launch Format Cells Framework Panel",
        category: "Text Formatting",
        description: "Opens an options console covering detailed numerical processing, structural borders, colors, and font attributes.",
        mappings: {
            windows: { keys: ["Ctrl", "1"], display: "Ctrl + 1" },
            mac: { keys: ["Cmd", "1"], display: "⌘ + 1" }
        }
    },
    {
        id: "sc_format_currency",
        action: "Apply Currency Precision Styling",
        category: "Text Formatting",
        description: "Transforms raw floating value definitions into structured financial ledger representations with custom currency codes.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "$"], display: "Ctrl + Shift + $" },
            mac: { keys: ["Ctrl", "Shift", "$"], display: "⌃ + ⇧ + $" }
        }
    },
    {
        id: "sc_format_percent",
        action: "Apply Percentage Scaling Engine Layout",
        category: "Text Formatting",
        description: "Multiplies context digits by scale index factors of 100 while appending standard percentage symbols directly.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "%"], display: "Ctrl + Shift + %" },
            mac: { keys: ["Ctrl", "Shift", "%"], display: "⌃ + ⇧ + %" }
        }
    },
    {
        id: "sc_format_scientific",
        action: "Apply Exponential Scientific Notations",
        category: "Text Formatting",
        description: "Formats targeted high-density numeric records using explicit scientific engineering notation formats.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "^"], display: "Ctrl + Shift + ^" },
            mac: { keys: ["Ctrl", "Shift", "^"], display: "⌃ + ⇧ + ^" }
        }
    },
    {
        id: "sc_format_date",
        action: "Apply Standardized Day-Month-Year Formats",
        category: "Text Formatting",
        description: "Converts serial data indexes into standard, legible human calendar date-time records.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "#"], display: "Ctrl + Shift + #" },
            mac: { keys: ["Ctrl", "Shift", "#"], display: "⌃ + ⇧ + #" }
        }
    },
    {
        id: "sc_format_time",
        action: "Apply Hour-Minute Time Layout Configuration",
        category: "Text Formatting",
        description: "Renders floating fractional intervals into clean AM/PM clock timeline periods.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "@"], display: "Ctrl + Shift + @" },
            mac: { keys: ["Ctrl", "Shift", "@"], display: "⌃ + ⇧ + @" }
        }
    },
    {
        id: "sc_format_number",
        action: "Apply Two-Decimal Standard Precision Layout",
        category: "Text Formatting",
        description: "Enforces distinct comma separators across macro dimensions alongside fixed double-digit trailing decimal paths.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "!"], display: "Ctrl + Shift + !" },
            mac: { keys: ["Ctrl", "Shift", "!"], display: "⌃ + ⇧ + !" }
        }
    },
    {
        id: "sc_apply_border",
        action: "Apply Outline Box Border Frame",
        category: "Text Formatting",
        description: "Generates high-contrast perimeter grid outlines wrapping selected data nodes cleanly.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "&"], display: "Ctrl + Shift + &" },
            mac: { keys: ["Cmd", "Option", "0"], display: "⌘ + ⌥ + 0" }
        }
    },
    {
        id: "sc_remove_borders",
        action: "Strip All Outer Matrix Borders",
        category: "Text Formatting",
        description: "Wipes away structural lines enclosing bounding boxes inside designated grid partitions.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "_"], display: "Ctrl + Shift + _" },
            mac: { keys: ["Cmd", "Option", "_"], display: "⌘ + ⌥ + _" }
        }
    },
    {
        id: "sc_insert_cells",
        action: "Spawn New Matrix Coordinates Insert Dialog",
        category: "Grid Customization",
        description: "Interrupts active structural patterns to fit blank cell structures while shifting adjacent targets dynamically.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "+"], display: "Ctrl + Shift + +" },
            mac: { keys: ["Cmd", "Shift", "="], display: "⌘ + ⇧ + =" }
        }
    },
    {
        id: "sc_delete_cells",
        action: "Trigger Grid Delete Dialogue Module",
        category: "Grid Customization",
        description: "Safely excises focused cell coordinate rows/columns and pulls surrounding data paths closer.",
        mappings: {
            windows: { keys: ["Ctrl", "-"], display: "Ctrl + -" },
            mac: { keys: ["Cmd", "-"], display: "⌘ + -" }
        }
    },
    {
        id: "sc_delete_row",
        action: "Erase Targeted Entire Horizontal Rows",
        category: "Grid Customization",
        description: "Purges targeted table data records entirely across the sheet, pulling lower datasets straight upward.",
        mappings: {
            windows: { keys: ["Ctrl", "-"], display: "Ctrl + -" },
            mac: { keys: ["Cmd", "-"], display: "⌘ + -" }
        }
    },
    {
        id: "sc_select_row",
        action: "Highlight Complete Selected Row Track",
        category: "Navigation & Selection",
        description: "Extends target points horizontally across all coordinate tracks spanning infinite viewport ends.",
        mappings: {
            windows: { keys: ["Shift", "Space"], display: "Shift + Space" },
            mac: { keys: ["Shift", "Space"], display: "⇧ + Space" }
        }
    },
    {
        id: "sc_select_column",
        action: "Highlight Complete Selected Column Track",
        category: "Navigation & Selection",
        description: "Extends cursor coordinates vertically straight down from index headers to infinite boundaries.",
        mappings: {
            windows: { keys: ["Ctrl", "Space"], display: "Ctrl + Space" },
            mac: { keys: ["Ctrl", "Space"], display: "⌃ + Space" }
        }
    },
    {
        id: "sc_hide_row",
        action: "Hide Current Target Rows From View",
        category: "Grid Customization",
        description: "Sets target row heights down to zero pixels, making row data arrays hidden from view.",
        mappings: {
            windows: { keys: ["Ctrl", "9"], display: "Ctrl + 9" },
            mac: { keys: ["Cmd", "9"], display: "⌘ + 9" }
        }
    },
    {
        id: "sc_unhide_row",
        action: "Restore Hidden Selected Rows To Screen",
        category: "Grid Customization",
        description: "Restores standard sizing variables to hidden horizontal tracks passing through highlighted parameters.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "9"], display: "Ctrl + Shift + 9" },
            mac: { keys: ["Cmd", "Shift", "9"], display: "⌘ + ⇧ + 9" }
        }
    },
    {
        id: "sc_hide_column",
        action: "Hide Selected Vertical Grid Columns",
        category: "Grid Customization",
        description: "Collapses specific vertical layouts down out of sight without scrubbing memory strings.",
        mappings: {
            windows: { keys: ["Ctrl", "0"], display: "Ctrl + 0" },
            mac: { keys: ["Cmd", "0"], display: "⌘ + 0" }
        }
    },
    {
        id: "sc_unhide_column",
        action: "Expose Hidden Intersecting Columns Again",
        category: "Grid Customization",
        description: "Forces zeroed layout column tracks back into visual canvas grids clearly.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "0"], display: "Ctrl + Shift + 0" },
            mac: { keys: ["Cmd", "Shift", "0"], display: "⌘ + ⇧ + 0" }
        }
    },
    {
        id: "sc_edit_cell",
        action: "Activate Direct Inline Cell Editing Context",
        category: "Basic Editing",
        description: "Pushes focus directly into internal cell fields, locking text cursors without clicking formula bars.",
        mappings: {
            windows: { keys: ["F2"], display: "F2" },
            mac: { keys: ["Ctrl", "U"], display: "⌃ + U" }
        }
    },
    {
        id: "sc_insert_comment",
        action: "Create Traditional Text Comment Box Note",
        category: "Auditing & Debugging",
        description: "Attaches sticky text markers directly onto target nodes for external team explanations.",
        mappings: {
            windows: { keys: ["Shift", "F2"], display: "Shift + F2" },
            mac: { keys: ["Shift", "F2"], display: "⇧ + F2" }
        }
    },
    {
        id: "sc_new_thread_comment",
        action: "Initialize Modern Threaded Discussion Comment",
        category: "Auditing & Debugging",
        description: "Starts collaborative, sidebar comment lines for real-time team feedback syncs.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "K"], display: "Ctrl + Shift + K" },
            mac: { keys: ["Cmd", "Shift", "K"], display: "⌘ + ⇧ + K" }
        }
    },
    {
        id: "sc_cancel_edit",
        action: "Cancel Active Inline Editing Sequence",
        category: "Basic Editing",
        description: "Aborts active character insertions instantly, keeping original cell data safe.",
        mappings: {
            windows: { keys: ["Esc"], display: "Esc" },
            mac: { keys: ["Esc"], display: "Esc" }
        }
    },
    {
        id: "sc_line_break",
        action: "Inject Hard Line Break Inside Cell Text",
        category: "Basic Editing",
        description: "Forces a fresh carriage return line inside a single cell without dropping focus into lower records.",
        mappings: {
            windows: { keys: ["Alt", "Enter"], display: "Alt + Enter" },
            mac: { keys: ["Option", "Enter"], display: "⌥ + Enter" }
        }
    },
    {
        id: "sc_complete_and_move_down",
        action: "Submit Inputs And Shift Focus Downward",
        category: "Navigation & Selection",
        description: "Saves raw inputs into the active node and steps focus straight into the lower grid layout.",
        mappings: {
            windows: { keys: ["Enter"], display: "Enter" },
            mac: { keys: ["Return"], display: "Return" }
        }
    },
    {
        id: "sc_complete_and_move_up",
        action: "Submit Inputs And Shift Focus Upward",
        category: "Navigation & Selection",
        description: "Locks active cell variables while stepping the selection directly up one block.",
        mappings: {
            windows: { keys: ["Shift", "Enter"], display: "Shift + Enter" },
            mac: { keys: ["Shift", "Return"], display: "⇧ + Return" }
        }
    },
    {
        id: "sc_complete_and_move_right",
        action: "Submit Inputs And Step Focus Rightward",
        category: "Navigation & Selection",
        description: "Saves current text blocks and steps structural cursors into the neighboring right index.",
        mappings: {
            windows: { keys: ["Tab"], display: "Tab" },
            mac: { keys: ["Tab"], display: "Tab" }
        }
    },
    {
        id: "sc_complete_and_move_left",
        action: "Submit Inputs And Step Focus Leftward",
        category: "Navigation & Selection",
        description: "Saves cell data inputs and steps standard selection focuses backward to the left.",
        mappings: {
            windows: { keys: ["Shift", "Tab"], display: "Shift + Tab" },
            mac: { keys: ["Shift", "Tab"], display: "⇧ + Tab" }
        }
    },
    {
        id: "sc_stay_in_cell",
        action: "Submit Inputs Keeping Active Selection Fixed",
        category: "Basic Editing",
        description: "Saves value inputs into the grid target without shifting focus away from that cell location.",
        mappings: {
            windows: { keys: ["Ctrl", "Enter"], display: "Ctrl + Enter" },
            mac: { keys: ["Cmd", "Return"], display: "⌘ + Return" }
        }
    },
    {
        id: "sc_create_chart",
        action: "Generate Default Embedded Sheet Chart Object",
        category: "Data Manipulation",
        description: "Instantly converts the highlighted data range into a default chart object visualizer on the sheet.",
        mappings: {
            windows: { keys: ["Alt", "F1"], display: "Alt + F1" },
            mac: { keys: ["Alt", "F1"], display: "⌥ + F1" }
        }
    },
    {
        id: "sc_create_chart_sheet",
        action: "Generate Chart Directly On Dedicated Worksheet Tab",
        category: "Data Manipulation",
        description: "Compiles active dataset graphs and renders them full-scale onto an isolated workbook tab surface.",
        mappings: {
            windows: { keys: ["F11"], display: "F11" },
            mac: { keys: ["F11"], display: "F11" }
        }
    },
    {
        id: "sc_toggle_filter",
        action: "Toggle Data Filter Toggles On Table Header Grid",
        category: "Data Manipulation",
        description: "Injects or drops interactive drop-down structural query filters across header matrices.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "L"], display: "Ctrl + Shift + L" },
            mac: { keys: ["Cmd", "Shift", "F"], display: "⌘ + ⇧ + F" }
        }
    },
    {
        id: "sc_clear_filter",
        action: "Clear All Active Filters For Current Table",
        category: "Data Manipulation",
        description: "Resets filtered columns instantly, displaying all rows of data back on the screen.",
        mappings: {
            windows: { keys: ["Alt", "A", "C"], display: "Alt + A + C" },
            mac: { keys: ["Option", "A", "C"], display: "⌥ + A + C" }
        }
    },
    {
        id: "sc_activate_filter_menu",
        action: "Open Interactive Dropdown Filter Selection Layout",
        category: "Navigation & Selection",
        description: "Triggers the advanced sort/filter window panel when focusing header rows directly.",
        mappings: {
            windows: { keys: ["Alt", "Down"], display: "Alt + Down Arrow" },
            mac: { keys: ["Option", "Down"], display: "⌥ + Down Arrow" }
        }
    },
    {
        id: "sc_calculate_all",
        action: "Force Full Manual Recalculation Across All Sheets",
        category: "Formula Editing",
        description: "Forces a fresh calculation pass across all sheets to resolve stacked formula strings.",
        mappings: {
            windows: { keys: ["F9"], display: "F9" },
            mac: { keys: ["F9"], display: "F9" }
        }
    },
    {
        id: "sc_calculate_sheet",
        action: "Force Active Single Sheet Recalculation Loop",
        category: "Formula Editing",
        description: "Restricts full workbook recalculation, updating only the formulas inside the current active worksheet.",
        mappings: {
            windows: { keys: ["Shift", "F9"], display: "Shift + F9" },
            mac: { keys: ["Shift", "F9"], display: "⇧ + F9" }
        }
    },
    {
        id: "sc_vba_editor",
        action: "Launch Microsoft Visual Basic For Applications Editor",
        category: "Auditing & Debugging",
        description: "Opens the backend macro coding console window to write or inspect operational structural VBA scripts.",
        mappings: {
            windows: { keys: ["Alt", "F11"], display: "Alt + F11" },
            mac: { keys: ["Option", "F11"], display: "⌥ + F11" }
        }
    },
    {
        id: "sc_macro_dialog",
        action: "Launch Structural Macro Selection Dialog Window",
        category: "Auditing & Debugging",
        description: "Brings up the automated script inventory dashboard panel to run or delete recorded macro routines.",
        mappings: {
            windows: { keys: ["Alt", "F8"], display: "Alt + F8" },
            mac: { keys: ["Option", "F8"], display: "⌥ + F8" }
        }
    },
    {
        id: "sc_move_edge_up",
        action: "Jump Focus Vector To Far Top Contiguous Edge Node",
        category: "Navigation & Selection",
        description: "Snaps the selection box directly up to the final filled data block before hitting blank fields.",
        mappings: {
            windows: { keys: ["Ctrl", "Up"], display: "Ctrl + Up Arrow" },
            mac: { keys: ["Cmd", "Up"], display: "⌘ + Up Arrow" }
        }
    },
    {
        id: "sc_move_edge_down",
        action: "Jump Focus Vector To Far Bottom Contiguous Edge Node",
        category: "Navigation & Selection",
        description: "Snaps cell highlights straight down to the terminal edge of filled database blocks.",
        mappings: {
            windows: { keys: ["Ctrl", "Down"], display: "Ctrl + Down Arrow" },
            mac: { keys: ["Cmd", "Down"], display: "⌘ + Down Arrow" }
        }
    },
    {
        id: "sc_move_edge_left",
        action: "Jump Focus Vector To Far Left Contiguous Edge Node",
        category: "Navigation & Selection",
        description: "Snaps data target tracks directly leftward to the absolute boundary wall of populated ranges.",
        mappings: {
            windows: { keys: ["Ctrl", "Left"], display: "Ctrl + Left Arrow" },
            mac: { keys: ["Cmd", "Left"], display: "⌘ + Left Arrow" }
        }
    },
    {
        id: "sc_move_edge_right",
        action: "Jump Focus Vector To Far Right Contiguous Edge Node",
        category: "Navigation & Selection",
        description: "Snaps data highlights all the way to the far right boundary of contiguous dataset ranges.",
        mappings: {
            windows: { keys: ["Ctrl", "Right"], display: "Ctrl + Right Arrow" },
            mac: { keys: ["Cmd", "Right"], display: "⌘ + Right Arrow" }
        }
    },
    {
        id: "sc_select_edge_up",
        action: "Expand Highlights Vector Safely Up To Top Contiguous Edge",
        category: "Navigation & Selection",
        description: "Selects everything from the active start node all the way up to the highest boundary data block.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "Up"], display: "Ctrl + Shift + Up Arrow" },
            mac: { keys: ["Cmd", "Shift", "Up"], display: "⌘ + ⇧ + Up Arrow" }
        }
    },
    {
        id: "sc_select_edge_down",
        action: "Expand Highlights Vector Safely Down To Bottom Contiguous Edge",
        category: "Navigation & Selection",
        description: "Selects everything from the current focus position down to the very last filled cell row track.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "Down"], display: "Ctrl + Shift + Down Arrow" },
            mac: { keys: ["Cmd", "Shift", "Down"], display: "⌘ + ⇧ + Down Arrow" }
        }
    },
    {
        id: "sc_select_edge_left",
        action: "Expand Highlights Vector Safely Left To Leftmost Contiguous Edge",
        category: "Navigation & Selection",
        description: "Selects everything from the current focus point all the way to the far left data column wall.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "Left"], display: "Ctrl + Shift + Left Arrow" },
            mac: { keys: ["Cmd", "Shift", "Left"], display: "⌘ + ⇧ + Left Arrow" }
        }
    },
    {
        id: "sc_select_edge_right",
        action: "Expand Highlights Vector Safely Right To Rightmost Contiguous Edge",
        category: "Navigation & Selection",
        description: "Selects everything from the current focus point all the way to the far right data column wall.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "Right"], display: "Ctrl + Shift + Right Arrow" },
            mac: { keys: ["Cmd", "Shift", "Right"], display: "⌘ + ⇧ + Right Arrow" }
        }
    },
    {
        id: "sc_snap_home",
        action: "Snap Cursor Position to Start Column of Active Row Track",
        category: "Navigation & Selection",
        description: "Zips structural layout cursors directly back to column index A matching the current row layer.",
        mappings: {
            windows: { keys: ["Home"], display: "Home" },
            mac: { keys: ["Home"], display: "Home" }
        }
    },
    {
        id: "sc_snap_origin",
        action: "Snap Cursor Position Directly to Worksheet Absolute Origin (A1)",
        category: "Navigation & Selection",
        description: "Instantly flies the operational viewpoint context straight back to grid intersection cell A1.",
        mappings: {
            windows: { keys: ["Ctrl", "Home"], display: "Ctrl + Home" },
            mac: { keys: ["Cmd", "Home"], display: "⌘ + Home" }
        }
    },
    {
        id: "sc_snap_terminal",
        action: "Snap Cursor Position Directly to Sheet Matrix Terminal Node",
        category: "Navigation & Selection",
        description: "Jumps the view context down to the absolute bottom-right active intersection block.",
        mappings: {
            windows: { keys: ["Ctrl", "End"], display: "Ctrl + End" },
            mac: { keys: ["Cmd", "End"], display: "⌘ + End" }
        }
    },
    {
        id: "sc_expand_select_origin",
        action: "Expand Matrix Selection Area Path Back to Origin Point (A1)",
        category: "Navigation & Selection",
        description: "Draws a selection box stretching from the active cell all the way back to coordinate point A1.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "Home"], display: "Ctrl + Shift + Home" },
            mac: { keys: ["Cmd", "Shift", "Home"], display: "⌘ + ⇧ + Home" }
        }
    },
    {
        id: "sc_expand_select_terminal",
        action: "Expand Matrix Selection Area Path Down to Terminal Node",
        category: "Navigation & Selection",
        description: "Draws a selection box stretching from the active cell all the way down to the lowest active data point.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "End"], display: "Ctrl + Shift + End" },
            mac: { keys: ["Cmd", "Shift", "End"], display: "⌘ + ⇧ + End" }
        }
    },
    {
        id: "sc_page_down",
        action: "Scroll Grid Screen Viewport Directly One Window Lower",
        category: "Navigation & Selection",
        description: "Shifts the visible worksheet viewport area down by one screen height block.",
        mappings: {
            windows: { keys: ["PageDown"], display: "Page Down" },
            mac: { keys: ["PageDown"], display: "Page Down" }
        }
    },
    {
        id: "sc_page_up",
        action: "Scroll Grid Screen Viewport Directly One Window Higher",
        category: "Navigation & Selection",
        description: "Shifts the visible worksheet viewport area up by one screen height block.",
        mappings: {
            windows: { keys: ["PageUp"], display: "Page Up" },
            mac: { keys: ["PageUp"], display: "Page Up" }
        }
    },
    {
        id: "sc_page_right",
        action: "Scroll Grid Screen Viewport Directly One Window Rightward",
        category: "Navigation & Selection",
        description: "Shifts the visible worksheet viewport area rightward by one screen width block.",
        mappings: {
            windows: { keys: ["Alt", "PageDown"], display: "Alt + Page Down" },
            mac: { keys: ["Option", "PageDown"], display: "⌥ + Page Down" }
        }
    },
    {
        id: "sc_page_left",
        action: "Scroll Grid Screen Viewport Directly One Window Leftward",
        category: "Navigation & Selection",
        description: "Shifts the visible worksheet viewport area leftward by one screen width block.",
        mappings: {
            windows: { keys: ["Alt", "PageUp"], display: "Alt + Page Up" },
            mac: { keys: ["Option", "PageUp"], display: "⌥ + Page Up" }
        }
    },
    {
        id: "sc_next_sheet",
        action: "Cycle Active View Focus onto Next Sequential Worksheet Tab",
        category: "Navigation & Selection",
        description: "Steps your workbook focus one tab to the right through the sheet list.",
        mappings: {
            windows: { keys: ["Ctrl", "PageDown"], display: "Ctrl + Page Down" },
            mac: { keys: ["Ctrl", "PageDown"], display: "⌃ + Page Down" }
        }
    },
    {
        id: "sc_prev_sheet",
        action: "Cycle Active View Focus onto Prior Sequential Worksheet Tab",
        category: "Navigation & Selection",
        description: "Steps your workbook focus one tab to the left through the sheet list.",
        mappings: {
            windows: { keys: ["Ctrl", "PageUp"], display: "Ctrl + Page Up" },
            mac: { keys: ["Ctrl", "PageUp"], display: "⌃ + Page Up" }
        }
    },
    {
        id: "sc_toggle_ribbon",
        action: "Collapse or Expand Main Core Ribbon Utility Panel",
        category: "System Helpers",
        description: "Toggles the top tool ribbon display on or off to maximize your spreadsheet viewing area.",
        mappings: {
            windows: { keys: ["Ctrl", "F1"], display: "Ctrl + F1" },
            mac: { keys: ["Cmd", "Option", "R"], display: "⌘ + ⌥ + R" }
        }
    },
    {
        id: "sc_spell_check",
        action: "Initialize Language Spell Check Diagnostics Matrix",
        category: "Auditing & Debugging",
        description: "Scans active textual metadata sequences across sheet contents to find and flag typos.",
        mappings: {
            windows: { keys: ["F7"], display: "F7" },
            mac: { keys: ["F7"], display: "F7" }
        }
    },
    {
        id: "sc_thesaurus",
        action: "Launch Structural Context Synonym Thesaurus Side-Panel",
        category: "Auditing & Debugging",
        description: "Opens an inline reference pane displaying word alternatives for target labels.",
        mappings: {
            windows: { keys: ["Shift", "F7"], display: "Shift + F7" },
            mac: { keys: ["Shift", "F7"], display: "⇧ + F7" }
        }
    },
    {
        id: "sc_evaluate_formula",
        action: "Launch Incremental Formula Evaluation Debugger Wizard",
        category: "Auditing & Debugging",
        description: "Breaks down complex nested calculations into separate steps to help track down logic errors.",
        mappings: {
            windows: { keys: ["Alt", "M", "V"], display: "Alt + M + V" },
            mac: { keys: ["Option", "M", "V"], display: "⌥ + M + V" }
        }
    },
    {
        id: "sc_name_manager",
        action: "Launch Named Range Registry Manager Window",
        category: "Formula Editing",
        description: "Opens the workspace naming directory panel to build, edit, or clear system alias variables.",
        mappings: {
            windows: { keys: ["Ctrl", "F3"], display: "Ctrl + F3" },
            mac: { keys: ["Cmd", "F3"], display: "⌘ + F3" }
        }
    },
    {
        id: "sc_create_from_selection",
        action: "Mass Build Named Range Hooks from Boundary Headers",
        category: "Formula Editing",
        description: "Automatically creates named range tags using text found in header rows or columns.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "F3"], display: "Ctrl + Shift + F3" },
            mac: { keys: ["Cmd", "Shift", "F3"], display: "⌘ + ⇧ + F3" }
        }
    },
    {
        id: "sc_paste_name",
        action: "Open Paste Name Hook Reference Selector List",
        category: "Formula Editing",
        description: "Pulls up a handy picklist of all custom named ranges to quickly paste into active formulas.",
        mappings: {
            windows: { keys: ["F3"], display: "F3" },
            mac: { keys: ["F3"], display: "F3" }
        }
    },
    {
        id: "sc_trace_dependents",
        action: "Draw Graphic Vector Lines To Formula Dependent Nodes",
        category: "Auditing & Debugging",
        description: "Plots visual tracer arrows extending outward to cells that rely on the values of the active block.",
        mappings: {
            windows: { keys: ["Ctrl", "]"], display: "Ctrl + ]" },
            mac: { keys: ["Ctrl", "]"], display: "⌃ + ]" }
        }
    },
    {
        id: "sc_trace_precedents",
        action: "Draw Graphic Vector Lines To Formula Precedent Nodes",
        category: "Auditing & Debugging",
        description: "Plots visual tracer arrows tracking backward to cells that provide data to the active block.",
        mappings: {
            windows: { keys: ["Ctrl", "["], display: "Ctrl + [" },
            mac: { keys: ["Ctrl", "["], display: "⌃ + [" }
        }
    },
    {
        id: "sc_remove_arrows",
        action: "Clear All Graphic Trace Arrow Vectors Across View",
        category: "Auditing & Debugging",
        description: "Wipes away all formula tracer lines from the worksheet layout screen.",
        mappings: {
            windows: { keys: ["Alt", "M", "A", "A"], display: "Alt + M + A + A" },
            mac: { keys: ["Option", "M", "A", "A"], display: "⌥ + M + A + A" }
        }
    },
    {
        id: "sc_group_data",
        action: "Group Target Row/Column Range Tracks into Collapsible Nodes",
        category: "Data Manipulation",
        description: "Binds selected row or column blocks into collapsible outline groups for easier navigation.",
        mappings: {
            windows: { keys: ["Shift", "Alt", "Right"], display: "Shift + Alt + Right Arrow" },
            mac: { keys: ["Cmd", "Shift", "K"], display: "⌘ + ⇧ + K" }
        }
    },
    {
        id: "sc_ungroup_data",
        action: "Ungroup Target Range Tracks from Structural Outline Nodes",
        category: "Data Manipulation",
        description: "Unbinds selected collapsible sections, removing them from the sheet outline group structure.",
        mappings: {
            windows: { keys: ["Shift", "Alt", "Left"], display: "Shift + Alt + Left Arrow" },
            mac: { keys: ["Cmd", "Shift", "J"], display: "⌘ + ⇧ + J" }
        }
    },
    {
        id: "sc_hide_detail",
        action: "Collapse Outlined Group Range Elements Out of View",
        category: "Data Manipulation",
        description: "Collapses an active outline group layout section to keep secondary rows hidden out of view.",
        mappings: {
            windows: { keys: ["Alt", "A", "H"], display: "Alt + A + H" },
            mac: { keys: ["Option", "A", "H"], display: "⌥ + A + H" }
        }
    },
    {
        id: "sc_show_detail",
        action: "Expand Outlined Group Range Elements Back to View",
        category: "Data Manipulation",
        description: "Expands a collapsed outline group layout section to show all hidden inner rows again.",
        mappings: {
            windows: { keys: ["Alt", "A", "J"], display: "Alt + A + J" },
            mac: { keys: ["Option", "A", "J"], display: "⌥ + A + J" }
        }
    },
    {
        id: "sc_insert_function",
        action: "Launch Interactive Insert Function Library Wizard",
        category: "Formula Editing",
        description: "Opens the function library finder wizard to search and configure formulas step-by-step.",
        mappings: {
            windows: { keys: ["Shift", "F3"], display: "Shift + F3" },
            mac: { keys: ["Shift", "F3"], display: "⇧ + F3" }
        }
    },
    {
        id: "sc_toggle_gridlines",
        action: "Toggle Background Sheet Gridlines Display Layout",
        category: "System Helpers",
        description: "Turns background cell borders on or off across the active worksheet window layout view.",
        mappings: {
            windows: { keys: ["Alt", "W", "V", "G"], display: "Alt + W + V + G" },
            mac: { keys: ["Option", "W", "V", "G"], display: "⌥ + W + V + G" }
        }
    },
    {
        id: "sc_freeze_panes",
        action: "Toggle Freeze Panes Viewport Anchor Configuration",
        category: "System Helpers",
        description: "Locks header rows or tracking columns in place so they stay visible when scrolling down the page.",
        mappings: {
            windows: { keys: ["Alt", "W", "F", "F"], display: "Alt + W + F + F" },
            mac: { keys: ["Option", "W", "F", "F"], display: "⌥ + W + F + F" }
        }
    },
    {
        id: "sc_split_window",
        action: "Toggle Active Worksheet Screen Split Controls",
        category: "System Helpers",
        description: "Splits the screen viewport into separate scrollable areas to work on distant data parts at once.",
        mappings: {
            windows: { keys: ["Alt", "W", "S"], display: "Alt + W + S" },
            mac: { keys: ["Option", "W", "S"], display: "⌥ + W + S" }
        }
    },
    {
        id: "sc_zoom_dialog",
        action: "Launch Workspace Scale Zoom Adjustment Overlay",
        category: "System Helpers",
        description: "Opens a viewport magnification control modal to adjust sheet view scaling ratios precisely.",
        mappings: {
            windows: { keys: ["Alt", "W", "Q"], display: "Alt + W + Q" },
            mac: { keys: ["Option", "W", "Q"], display: "⌥ + W + Q" }
        }
    },
    {
        id: "sc_maximize_window",
        action: "Maximize Active Main Application Frame Boundary",
        category: "System Helpers",
        description: "Scales the main application viewport out to fill the entire physical desktop display area.",
        mappings: {
            windows: { keys: ["Ctrl", "F10"], display: "Ctrl + F10" },
            mac: { keys: ["Cmd", "Control", "F"], display: "⌘ + ⌃ + F" }
        }
    },
    {
        id: "sc_minimize_window",
        action: "Minimize Active Main Application Frame Boundary",
        category: "System Helpers",
        description: "Collapses the current application view straight down into the system taskbar tray area.",
        mappings: {
            windows: { keys: ["Ctrl", "F9"], display: "Ctrl + F9" },
            mac: { keys: ["Cmd", "M"], display: "⌘ + M" }
        }
    },
    {
        id: "sc_new_sheet_tab",
        action: "Insert Fresh Clean Worksheet Tab Matrix Object",
        category: "Grid Customization",
        description: "Spawns a new blank worksheet tab right into the active workbook file structure.",
        mappings: {
            windows: { keys: ["Shift", "F11"], display: "Shift + F11" },
            mac: { keys: ["Shift", "F11"], display: "⇧ + F11" }
        }
    },
    {
        id: "sc_flash_fill_alt",
        action: "Trigger Alternate Data Structure Flash Fill Loop",
        category: "Data Manipulation",
        description: "Runs an automated data pattern parsing script to auto-complete target field inputs instantly.",
        mappings: {
            windows: { keys: ["Ctrl", "E"], display: "Ctrl + E" },
            mac: { keys: ["Cmd", "E"], display: "⌘ + E" }
        }
    },
    {
        id: "sc_remove_duplicates",
        action: "Launch Record De-duplication Clean Tool Engine",
        category: "Data Manipulation",
        description: "Scans selected table structures to filter out and delete identical twin data records safely.",
        mappings: {
            windows: { keys: ["Alt", "A", "M"], display: "Alt + A + M" },
            mac: { keys: ["Option", "A", "M"], display: "⌥ + A + M" }
        }
    },
    {
        id: "sc_text_to_columns",
        action: "Launch Text To Columns Data Parsing Wizard Panel",
        category: "Data Manipulation",
        description: "Splits packed text blocks across separate columns using commas, tabs, or fixed spacing rules.",
        mappings: {
            windows: { keys: ["Alt", "A", "E"], display: "Alt + A + E" },
            mac: { keys: ["Option", "A", "E"], display: "⌥ + A + E" }
        }
    },
    {
        id: "sc_data_validation",
        action: "Launch Data Validation Rule Setup Dashboard",
        category: "Data Manipulation",
        description: "Sets entry rules and logic restrictions on selected cells to prevent input errors.",
        mappings: {
            windows: { keys: ["Alt", "A", "V", "V"], display: "Alt + A + V + V" },
            mac: { keys: ["Option", "A", "V", "V"], display: "⌥ + A + V + V" }
        }
    },
    {
        id: "sc_consolidate_data",
        action: "Launch Multi-Source Data Consolidation Tool Window",
        category: "Data Manipulation",
        description: "Combines and summarizes information from separate layout ranges into one master summary matrix.",
        mappings: {
            windows: { keys: ["Alt", "A", "N"], display: "Alt + A + N" },
            mac: { keys: ["Option", "A", "N"], display: "⌥ + A + N" }
        }
    },
    {
        id: "sc_refresh_all",
        action: "Force Complete Data Refresh of Interconnected Data Feeds",
        category: "Data Manipulation",
        description: "Updates all linked external data pipelines, Power Query connections, and PivotTable summaries at once.",
        mappings: {
            windows: { keys: ["Ctrl", "Alt", "F5"], display: "Ctrl + Alt + F5" },
            mac: { keys: ["Cmd", "Option", "F5"], display: "⌘ + ⌥ + F5" }
        }
    },
    {
        id: "sc_refresh_current",
        action: "Refresh Singular Isolated Connection Pipeline Node",
        category: "Data Manipulation",
        description: "Updates just the selected pivot table cache or active external data source link query.",
        mappings: {
            windows: { keys: ["Alt", "F5"], display: "Alt + F5" },
            mac: { keys: ["Option", "F5"], display: "⌥ + F5" }
        }
    },
    {
        id: "sc_pivot_wizard",
        action: "Launch Interactive PivotTable Optimization Engine Module",
        category: "Data Manipulation",
        description: "Opens the classic pivot table modeling wizard to build structured multi-dimensional summaries.",
        mappings: {
            windows: { keys: ["Alt", "N", "V"], display: "Alt + N + V" },
            mac: { keys: ["Option", "N", "V"], display: "⌥ + N + V" }
        }
    },
    {
        id: "sc_insert_hyperlink",
        action: "Launch Hyperlink Address Attachment Overlay Panel",
        category: "Basic Editing",
        description: "Attaches website links, file paths, or specific worksheet reference targets to the active cell.",
        mappings: {
            windows: { keys: ["Ctrl", "K"], display: "Ctrl + K" },
            mac: { keys: ["Cmd", "K"], display: "⌘ + K" }
        }
    },
    {
        id: "sc_clear_formats",
        action: "Wipe Layout Styling Artifacts Leaving Contents Solid",
        category: "Basic Editing",
        description: "Clears all colors, borders, and custom formatting styles from cells while leaving raw data values untouched.",
        mappings: {
            windows: { keys: ["Alt", "H", "E", "F"], display: "Alt + H + E + F" },
            mac: { keys: ["Option", "H", "E", "F"], display: "⌥ + H + E + F" }
        }
    },
    {
        id: "sc_clear_all",
        action: "Completely Purge Cell Target Matrix Data Records and Styles",
        category: "Basic Editing",
        description: "Completely wipes everything out of selected cells, removing raw values, formulas, notes, and styles all at once.",
        mappings: {
            windows: { keys: ["Alt", "H", "E", "A"], display: "Alt + H + E + A" },
            mac: { keys: ["Option", "H", "E", "A"], display: "⌥ + H + E + A" }
        }
    },
    {
        id: "sc_align_left",
        action: "Align Horizontal Content Anchors to Left Framework Margin",
        category: "Text Formatting",
        description: "Pushes text values flat against the left side margin border of the selected cells.",
        mappings: {
            windows: { keys: ["Alt", "H", "A", "L"], display: "Alt + H + A + L" },
            mac: { keys: ["Option", "H", "A", "L"], display: "⌥ + H + A + L" }
        }
    },
    {
        id: "sc_align_center",
        action: "Align Horizontal Content Anchors to Midpoint Center Line",
        category: "Text Formatting",
        description: "Centers text or numeric values exactly in the middle of your cell borders.",
        mappings: {
            windows: { keys: ["Alt", "H", "A", "C"], display: "Alt + H + A + C" },
            mac: { keys: ["Option", "H", "A", "C"], display: "⌥ + H + A + C" }
        }
    },
    {
        id: "sc_align_right",
        action: "Align Horizontal Content Anchors to Right Framework Margin",
        category: "Text Formatting",
        description: "Pushes text values flat against the right side margin border of the selected cells.",
        mappings: {
            windows: { keys: ["Alt", "H", "A", "R"], display: "Alt + H + A + R" },
            mac: { keys: ["Option", "H", "A", "R"], display: "⌥ + H + A + R" }
        }
    },
    {
        id: "sc_merge_cells",
        action: "Toggle Center-Merge Layout Pipeline Across Ranges",
        category: "Text Formatting",
        description: "Merges a row of selected cells together into one large combined block and centers the text inside it.",
        mappings: {
            windows: { keys: ["Alt", "H", "M", "C"], display: "Alt + H + M + C" },
            mac: { keys: ["Option", "H", "M", "C"], display: "⌥ + H + M + C" }
        }
    },
    {
        id: "sc_wrap_text",
        action: "Toggle Adaptive Wrap Text Content Wrapping Boundaries",
        category: "Text Formatting",
        description: "Wraps long strings onto multiple vertical lines inside a cell so everything stays fully readable.",
        mappings: {
            windows: { keys: ["Alt", "H", "W"], display: "Alt + H + W" },
            mac: { keys: ["Option", "H", "W"], display: "⌥ + H + W" }
        }
    },
    {
        id: "sc_increase_decimals",
        action: "Increase Post-Decimal Float Value Vector Scale View",
        category: "Text Formatting",
        description: "Adds an extra visible decimal digit place to the selected numbers for more precise tracking view.",
        mappings: {
            windows: { keys: ["Alt", "H", "0"], display: "Alt + H + 0" },
            mac: { keys: ["Option", "H", "0"], display: "⌥ + H + 0" }
        }
    },
    {
        id: "sc_decrease_decimals",
        action: "Decrease Post-Decimal Float Value Vector Scale View",
        category: "Text Formatting",
        description: "Hides a visible decimal place digit, rounding numbers off into a cleaner layout view.",
        mappings: {
            windows: { keys: ["Alt", "H", "9"], display: "Alt + H + 9" },
            mac: { keys: ["Option", "H", "9"], display: "⌥ + H + 9" }
        }
    },
    {
        id: "sc_conditional_formatting",
        action: "Launch Dynamic Conditional Formatting Matrix Wizard Menu",
        category: "Text Formatting",
        description: "Opens the rule setup menu to auto-style cells based on custom mathematical or logical rules.",
        mappings: {
            windows: { keys: ["Alt", "H", "L"], display: "Alt + H + L" },
            mac: { keys: ["Option", "H", "L"], display: "⌥ + H + L" }
        }
    },
    {
        id: "sc_autofit_columns",
        action: "Execute Intelligent Column Width AutoFit Logic",
        category: "Grid Customization",
        description: "Auto-widens chosen columns to perfectly match the size of their longest internal text string.",
        mappings: {
            windows: { keys: ["Alt", "H", "O", "I"], display: "Alt + H + O + I" },
            mac: { keys: ["Option", "H", "O", "I"], display: "⌥ + H + O + I" }
        }
    },
    {
        id: "sc_autofit_rows",
        action: "Execute Intelligent Row Height AutoFit Logic",
        category: "Grid Customization",
        description: "Auto-stretches row heights to perfectly fit multi-line wrapped text blocks clearly.",
        mappings: {
            windows: { keys: ["Alt", "H", "O", "A"], display: "Alt + H + O + A" },
            mac: { keys: ["Option", "H", "O", "A"], display: "⌥ + H + O + A" }
        }
    },
    {
        id: "sc_rename_sheet",
        action: "Focus Sheet Identity Tab Title Name Input Field",
        category: "Grid Customization",
        description: "Highlights the active tab label text so you can quickly type a new custom worksheet name.",
        mappings: {
            windows: { keys: ["Alt", "H", "O", "R"], display: "Alt + H + O + R" },
            mac: { keys: ["Option", "H", "O", "R"], display: "⌥ + H + O + R" }
        }
    },
    {
        id: "sc_delete_sheet",
        action: "Purge Active Tab Workspace Object Frame Out permanently",
        category: "Grid Customization",
        description: "Completely deletes the active sheet tab along with all its structural code and stored tables permanently.",
        mappings: {
            windows: { keys: ["Alt", "H", "D", "S"], display: "Alt + H + D + S" },
            mac: { keys: ["Option", "H", "D", "S"], display: "⌥ + H + D + S" }
        }
    },
    {
        id: "sc_go_to_special",
        action: "Launch Specialized Range Targeting Rule Dialog Menu",
        category: "Navigation & Selection",
        description: "Opens an advanced selection filter to instantly target formulas, blanks, constants, or data error cells.",
        mappings: {
            windows: { keys: ["Ctrl", "G"], display: "Ctrl + G -> Alt + S" },
            mac: { keys: ["Ctrl", "G"], display: "⌃ + G -> ⌥ + S" }
        }
    },
    {
        id: "sc_select_visible_only",
        action: "Highlight Visible Cells Only Dropping Hidden Ranges out",
        category: "Navigation & Selection",
        description: "Selects only the cells you can actively see on screen, completely leaving out any hidden row or column sections.",
        mappings: {
            windows: { keys: ["Alt", ";"], display: "Alt + ;" },
            mac: { keys: ["Cmd", "Shift", "*"], display: "⌘ + ⇧ + *" }
        }
    },
    {
        id: "sc_array_enter",
        action: "Commit Array Calculation Engine Formula Blocks via CSE",
        category: "Formula Editing",
        description: "Locks legacy multi-cell array calculations in place using standard Control + Shift + Enter wrapper operations.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "Enter"], display: "Ctrl + Shift + Enter" },
            mac: { keys: ["Cmd", "Shift", "Return"], display: "⌘ + ⇧ + Return" }
        }
    },
    {
        id: "sc_toggle_expand_formula_bar",
        action: "Expand Or Collapse Primary Horizontal Formula Input Bar Area",
        category: "Formula Editing",
        description: "Stretches out the top text box space horizontally to review massive, multi-nested calculation code lines.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "U"], display: "Ctrl + Shift + U" },
            mac: { keys: ["Cmd", "Shift", "U"], display: "⌘ + ⇧ + U" }
        }
    },
    {
        id: "sc_insert_copypaste_cells",
        action: "Force Insert Intersect Clipboard Cut Matrices Here",
        category: "Grid Customization",
        description: "Pastes cut or copied cells directly between existing ranges, shifting surrounding fields out of the way smoothly.",
        mappings: {
            windows: { keys: ["Ctrl", "Shift", "+"], display: "Ctrl + Shift + +" },
            mac: { keys: ["Cmd", "Shift", "="], display: "⌘ + ⇧ + =" }
        }
    },
    {
        id: "sc_show_pop_menu",
        action: "Summon System Secondary Context Mouse Click Pop-Menu",
        category: "System Helpers",
        description: "Opens the classic right-click utility context menu right at your selected cell anchor point.",
        mappings: {
            windows: { keys: ["Shift", "F10"], display: "Shift + F10" },
            mac: { keys: ["Shift", "F10"], display: "⇧ + F10" }
        }
    },
    {
        id: "sc_open_key_tips",
        action: "Expose Structural Quick Access Key Ribbon Tool Indicators",
        category: "System Helpers",
        description: "Displays letter shortcuts on the ribbon icons to let you trigger any tool completely mouse-free.",
        mappings: {
            windows: { keys: ["Alt"], display: "Alt" },
            mac: { keys: ["Option"], display: "⌥" }
        }
    },
    {
        id: "sc_move_to_next_pane",
        action: "Cycle Selection Focus Forward Across Active Pane Panels",
        category: "Navigation & Selection",
        description: "Jumps your active context focus forward between the main sheet grid, split views, or active tool panel margins.",
        mappings: {
            windows: { keys: ["F6"], display: "F6" },
            mac: { keys: ["F6"], display: "F6" }
        }
    },
    {
        id: "sc_move_to_prev_pane",
        action: "Cycle Selection Focus Backward Across Active Pane Panels",
        category: "Navigation & Selection",
        description: "Jumps your active context focus backward between the main sheet grid, split views, or active tool panel margins.",
        mappings: {
            windows: { keys: ["Shift", "F6"], display: "Shift + F6" },
            mac: { keys: ["Shift", "F6"], display: "⇧ + F6" }
        }
    },
    {
        id: "sc_scrolling_lock",
        action: "Toggle Grid Viewport Scrolling Boundary Locks On",
        category: "Navigation & Selection",
        description: "Locks your cell selection box in place so arrow keys scroll the whole page view instead of moving the cursor.",
        mappings: {
            windows: { keys: ["ScrollLock"], display: "Scroll Lock" },
            mac: { keys: ["ScrollLock"], display: "Scroll Lock" }
        }
    },
    {
        id: "sc_end_mode_arrow",
        action: "Jump Data Vectors via Modular Sequential End Modes",
        category: "Navigation & Selection",
        description: "Turns on End Mode to let you jump straight to the last filled data block in the direction of your next arrow tap.",
        mappings: {
            windows: { keys: ["End", "Arrow"], display: "End -> Arrow Key" },
            mac: { keys: ["End", "Arrow"], display: "End -> Arrow Key" }
        }
    },
    {
        id: "sc_extend_selection_mode",
        action: "Toggle Point-to-Point Range Extension Highlight Mode",
        category: "Navigation & Selection",
        description: "Turns on Extend Selection mode, locking the start cell so you can highlight large ranges just by clicking new points.",
        mappings: {
            windows: { keys: ["F8"], display: "F8" },
            mac: { keys: ["F8"], display: "F8" }
        }
    },
    {
        id: "sc_add_range_selection",
        action: "Add Non-Contiguous Separate Cell Ranges to Selection Set",
        category: "Navigation & Selection",
        description: "Allows you to select separate, non-connected cell ranges using your arrow keys and the spacebar.",
        mappings: {
            windows: { keys: ["Shift", "F8"], display: "Shift + F8" },
            mac: { keys: ["Shift", "F8"], display: "⇧ + F8" }
        }
    },
    {
        id: "sc_clear_cell_contents",
        action: "Clear Raw Cell Value Strings Leaving Formats Intact",
        category: "Basic Editing",
        description: "Wipes out text data strings and cell values instantly while keeping background colors and styles exactly as they are.",
        mappings: {
            windows: { keys: ["Delete"], display: "Delete" },
            mac: { keys: ["Delete"], display: "Delete" }
        }
    },
    {
        id: "sc_input_autocomplete",
        action: "Open Dropdown Autocomplete Picklist from Column History",
        category: "Basic Editing",
        description: "Pulls up a text picklist based on words already typed in that column to speed up repetitive data entry entries.",
        mappings: {
            windows: { keys: ["Alt", "Down"], display: "Alt + Down Arrow" },
            mac: { keys: ["Option", "Down"], display: "⌥ + Down Arrow" }
        }
    },
    {
        id: "sc_paste_values",
        action: "Paste Clipboard Payloads Restricting Data to Values Only",
        category: "Data Manipulation",
        description: "Pastes just the raw text strings or computed values from your clipboard, stripping away all formulas and styles.",
        mappings: {
            windows: { keys: ["Alt", "H", "V", "V"], display: "Alt + H + V + V" },
            mac: { keys: ["Cmd", "Shift", "V"], display: "⌘ + ⇧ + V" }
        }
    },
    {
        id: "sc_paste_formulas",
        action: "Paste Clipboard Payloads Restricting Data to Formulas Only",
        category: "Data Manipulation",
        description: "Pastes underlying calculation logic strings exactly over target ranges without carrying over any cell styling.",
        mappings: {
            windows: { keys: ["Alt", "H", "V", "F"], display: "Alt + H + V + F" },
            mac: { keys: ["Option", "Cmd", "F"], display: "⌥ + ⌘ + F" }
        }
    },
    {
        id: "sc_unfreeze_panes",
        action: "Unlock Frozen Rows and Columns from Viewport Coordinates",
        category: "System Helpers",
        description: "Unlocks frozen row or column headers, returning the sheet layout back to a standard scrolling mode layout.",
        mappings: {
            windows: { keys: ["Alt", "W", "F", "F"], display: "Alt + W + F + F" },
            mac: { keys: ["Option", "W", "F", "F"], display: "⌥ + W + F + F" }
        }
    },
    {
        id: "sc_open_options",
        action: "Launch Main Excel Application Options Configuration Pane",
        category: "System Helpers",
        description: "Opens the main application settings window panel to customize formulas, calculations, and general workspace preferences.",
        mappings: {
            windows: { keys: ["Alt", "F", "T"], display: "Alt + F + T" },
            mac: { keys: ["Cmd", ","], display: "⌘ + ," }
        }
    },
    {
        id: "sc_quick_access_1",
        action: "Trigger First Slot Quick Access Toolbar Routine Command",
        category: "System Helpers",
        description: "Instantly fires whichever custom tool command you have pinned in the very first slot of your top access toolbar layout.",
        mappings: {
            windows: { keys: ["Alt", "1"], display: "Alt + 1" },
            mac: { keys: ["Option", "1"], display: "⌥ + 1" }
        }
    },
    {
        id: "sc_quick_access_2",
        action: "Trigger Second Slot Quick Access Toolbar Routine Command",
        category: "System Helpers",
        description: "Instantly fires whichever custom tool command you have pinned in the second slot of your top access toolbar layout.",
        mappings: {
            windows: { keys: ["Alt", "2"], display: "Alt + 2" },
            mac: { keys: ["Option", "2"], display: "⌥ + 2" }
        }
    },
    {
        id: "sc_quick_access_3",
        action: "Trigger Third Slot Quick Access Toolbar Routine Command",
        category: "System Helpers",
        description: "Instantly fires whichever custom tool command you have pinned in the third slot of your top access toolbar layout.",
        mappings: {
            windows: { keys: ["Alt", "3"], display: "Alt + 3" },
            mac: { keys: ["Option", "3"], display: "⌥ + 3" }
        }
    },
    {
        id: "sc_quick_access_4",
        action: "Trigger Fourth Slot Quick Access Toolbar Routine Command",
        category: "System Helpers",
        description: "Instantly fires whichever custom tool command you have pinned in the fourth slot of your top access toolbar layout.",
        mappings: {
            windows: { keys: ["Alt", "4"], display: "Alt + 4" },
            mac: { keys: ["Option", "4"], display: "⌥ + 4" }
        }
    },
    {
        id: "sc_quick_access_5",
        action: "Trigger Fifth Slot Quick Access Toolbar Routine Command",
        category: "System Helpers",
        description: "Instantly fires whichever custom tool command you have pinned in the fifth slot of your top access toolbar layout.",
        mappings: {
            windows: { keys: ["Alt", "5"], display: "Alt + 5" },
            mac: { keys: ["Option", "5"], display: "⌥ + 5" }
        }
    },
    {
        id: "sc_what_if_analysis",
        action: "Launch What-If Data Modeling Scenario Diagnostics Menu",
        category: "Data Manipulation",
        description: "Opens the advanced planning toolkit, featuring Data Tables, Goal Seek rules, and Scenario Manager pipelines.",
        mappings: {
            windows: { keys: ["Alt", "A", "W"], display: "Alt + A + W" },
            mac: { keys: ["Option", "A", "W"], display: "⌥ + A + W" }
        }
    },
    {
        id: "sc_goal_seek",
        action: "Launch Mathematical Goal Seek Iteration Controller Panel",
        category: "Data Manipulation",
        description: "Launches the optimization wizard engine, backward calculating individual cell variables to hit exact metric values.",
        mappings: {
            windows: { keys: ["Alt", "A", "W", "G"], display: "Alt + A + W + G" },
            mac: { keys: ["Option", "A", "W", "G"], display: "⌥ + A + W + G" }
        }
    },
    {
        id: "sc_advanced_filter",
        action: "Launch Multi-Criteria Complex Advanced Filter Engine Matrix",
        category: "Data Manipulation",
        description: "Runs complex query configurations across lists using detached criteria sheets to filter custom data lines.",
        mappings: {
            windows: { keys: ["Alt", "A", "Q"], display: "Alt + A + Q" },
            mac: { keys: ["Option", "A", "Q"], display: "⌥ + A + Q" }
        }
    },
    {
        id: "sc_sort_dialog",
        action: "Launch Multi-Level Field Matrix Sorting Dialogue Window",
        category: "Data Manipulation",
        description: "Opens the custom ordering console to sort data across columns using stacked criteria lines, font colors, or icon lists.",
        mappings: {
            windows: { keys: ["Alt", "A", "S"], display: "Alt + A + S" },
            mac: { keys: ["Cmd", "Shift", "R"], display: "⌘ + ⇧ + R" }
        }
    },
    {
        id: "sc_subtotal_wizard",
        action: "Launch Automated Range Subtotal Calculation Layout Builder",
        category: "Data Manipulation",
        description: "Automatically inserts structured summary calculations and math groups right inside selected sorting tracks.",
        mappings: {
            windows: { keys: ["Alt", "A", "B"], display: "Alt + A + B" },
            mac: { keys: ["Option", "A", "B"], display: "⌥ + A + B" }
        }
    },
    {
        id: "sc_insert_pivot",
        action: "Inject Blank PivotTable Object Frame directly inside sheet",
        category: "Data Manipulation",
        description: "Initializes a blank data summary block to transform standard table structures into data pivot maps.",
        mappings: {
            windows: { keys: ["Alt", "N", "V", "T"], display: "Alt + N + V + T" },
            mac: { keys: ["Option", "N", "V", "T"], display: "⌥ + N + V + T" }
        }
    },
    {
        id: "sc_insert_slicer",
        action: "Inject Interactive Graphic Data Slicer Component Filter",
        category: "Data Manipulation",
        description: "Generates floating, interactive button filter boxes to slice through data models visually.",
        mappings: {
            windows: { keys: ["Alt", "N", "S", "F"], display: "Alt + N + S + F" },
            mac: { keys: ["Option", "N", "S", "F"], display: "⌥ + N + S + F" }
        }
    },
    {
        id: "sc_insert_timeline",
        action: "Inject Interactive Graphic Date Timeline Component Filter",
        category: "Data Manipulation",
        description: "Generates a floating chronological slider component box to filter pivot views across calendar dates visually.",
        mappings: {
            windows: { keys: ["Alt", "N", "T"], display: "Alt + N + T" },
            mac: { keys: ["Option", "N", "T"], display: "⌥ + N + T" }
        }
    },
    {
        id: "sc_insert_textbox",
        action: "Draw Floating Vector Text Container Shape Frame",
        category: "Grid Customization",
        description: "Creates an overlay text box shape that floats freely on top of the background spreadsheet grid layer.",
        mappings: {
            windows: { keys: ["Alt", "N", "X"], display: "Alt + N + X" },
            mac: { keys: ["Option", "N", "X"], display: "⌥ + N + X" }
        }
    },
    {
        id: "sc_open_power_query",
        action: "Launch Backend Power Query ETL Processing Console",
        category: "Data Manipulation",
        description: "Launches the advanced data transformation window panel to extract, clean, and map external enterprise tables.",
        mappings: {
            windows: { keys: ["Alt", "A", "P", "N"], display: "Alt + A + P + N" },
            mac: { keys: ["Option", "A", "P", "N"], display: "⌥ + A + P + N" }
        }
    },
    {
        id: "sc_font_selector",
        action: "Focus Home Ribbon Typography Font Family Selector Tab",
        category: "Text Formatting",
        description: "Highlights the ribbon typography font dropdown to change active label faces smoothly.",
        mappings: {
            windows: { keys: ["Alt", "H", "F", "F"], display: "Alt + H + F + F" },
            mac: { keys: ["Option", "H", "F", "F"], display: "⌥ + H + F + F" }
        }
    },
    {
        id: "sc_font_size",
        action: "Focus Home Ribbon Typography Font Size Number Scaler",
        category: "Text Formatting",
        description: "Highlights the ribbon text size dropdown to scale selected cell font dimensions up or down.",
        mappings: {
            windows: { keys: ["Alt", "H", "F", "S"], display: "Alt + H + F + S" },
            mac: { keys: ["Option", "H", "F", "S"], display: "⌥ + H + F + S" }
        }
    },
    {
        id: "sc_fill_color",
        action: "Open Cell Background Matrix Fill Color Palette Panel",
        category: "Text Formatting",
        description: "Pulls open the ribbon background color bucket palette to color cell background fills.",
        mappings: {
            windows: { keys: ["Alt", "H", "H"], display: "Alt + H + H" },
            mac: { keys: ["Option", "H", "H"], display: "⌥ + H + H" }
        }
    },
    {
        id: "sc_font_color",
        action: "Open Typography Font Family Color Picker Palette Panel",
        category: "Text Formatting",
        description: "Pulls open the ribbon text color palette to change foreground text shades safely.",
        mappings: {
            windows: { keys: ["Alt", "H", "F", "C"], display: "Alt + H + F + C" },
            mac: { keys: ["Option", "H", "F", "C"], display: "⌥ + H + F + C" }
        }
    },
    {
        id: "sc_border_selector",
        action: "Open Ribbon Standard Grid Border Layout Selector Tool",
        category: "Text Formatting",
        description: "Pulls open a detailed layout menu of line styles, top/bottom tracks, and custom borders.",
        mappings: {
            windows: { keys: ["Alt", "H", "B"], display: "Alt + H + B" },
            mac: { keys: ["Option", "H", "B"], display: "⌥ + H + B" }
        }
    },
    {
        id: "sc_increase_indent",
        action: "Shift Cell Content Layout Margin One Unit Rightward",
        category: "Text Formatting",
        description: "Pushes text further rightward from the cell border line, creating clear visual indentation steps.",
        mappings: {
            windows: { keys: ["Alt", "H", "6"], display: "Alt + H + 6" },
            mac: { keys: ["Option", "H", "6"], display: "⌥ + H + 6" }
        }
    },
    {
        id: "sc_decrease_indent",
        action: "Shift Cell Content Layout Margin One Unit Leftward",
        category: "Text Formatting",
        description: "Pulls text back leftward toward the cell border line, reducing visual indentation steps.",
        mappings: {
            windows: { keys: ["Alt", "H", "5"], display: "Alt + H + 5" },
            mac: { keys: ["Option", "H", "5"], display: "⌥ + H + 5" }
        }
    },
    {
        id: "sc_format_painter",
        action: "Lock Selected Cell Layout Styles via Format Painter Hook",
        category: "Basic Editing",
        description: "Copies just the visual design styles from one cell so you can quickly brush them onto new target cells.",
        mappings: {
            windows: { keys: ["Alt", "H", "F", "P"], display: "Alt + H + F + P" },
            mac: { keys: ["Option", "H", "F", "P"], display: "⌥ + H + F + P" }
        }
    },
    {
        id: "sc_custom_sort_asc",
        action: "Trigger Instant Top-To-Bottom Ascending Data Sort Loop",
        category: "Data Manipulation",
        description: "Instantly re-orders the active table rows from A to Z or lowest to highest value based on the current column track.",
        mappings: {
            windows: { keys: ["Alt", "H", "S", "S"], display: "Alt + H + S + S" },
            mac: { keys: ["Option", "H", "S", "S"], display: "⌥ + H + S + S" }
        }
    },
    {
        id: "sc_custom_sort_desc",
        action: "Trigger Instant Bottom-To-Top Descending Data Sort Loop",
        category: "Data Manipulation",
        description: "Instantly re-orders the active table rows from Z to A or highest to lowest value based on the current column track.",
        mappings: {
            windows: { keys: ["Alt", "H", "S", "O"], display: "Alt + H + S + O" },
            mac: { keys: ["Option", "H", "S", "O"], display: "⌥ + H + S + O" }
        }
    },
    {
        id: "sc_new_window",
        action: "Spawn Duplicate Viewing Instance of Present Active Workbook",
        category: "System Helpers",
        description: "Opens an extra copy of your current file in a separate window to track different sheet tabs side-by-side.",
        mappings: {
            windows: { keys: ["Alt", "W", "N"], display: "Alt + W + N" },
            mac: { keys: ["Option", "W", "N"], display: "⌥ + W + N" }
        }
    },
    {
        id: "sc_arrange_all",
        action: "Tile and Arrange All Running Workbook Viewport Windows",
        category: "System Helpers",
        description: "Tiles all your open spreadsheet windows across the screen for quick multi-file tracking.",
        mappings: {
            windows: { keys: ["Alt", "W", "A"], display: "Alt + W + A" },
            mac: { keys: ["Option", "W", "A"], display: "⌥ + W + A" }
        }
    },
    {
        id: "sc_save_workspace",
        action: "Commit Active Multi-Window Workspace Structure to Disk",
        category: "File Management",
        description: "Saves the current multi-window layout configuration so you can reload your entire workspace view later exactly as you left it.",
        mappings: {
            windows: { keys: ["Alt", "W", "W"], display: "Alt + W + W" },
            mac: { keys: ["Option", "W", "W"], display: "⌥ + W + W" }
        }
    },
    {
        id: "sc_switch_windows",
        action: "Switch Application Target Window to Alternative Active File",
        category: "System Helpers",
        description: "Pulls up a quick index list of all open Excel files to instantly jump your focus to another workbook window.",
        mappings: {
            windows: { keys: ["Alt", "W", "W", "Arrow"], display: "Alt + W + W -> Arrow" },
            mac: { keys: ["Option", "W", "W", "Arrow"], display: "⌥ + W + W -> Arrow" }
        }
    },
    {
        id: "sc_protect_sheet",
        action: "Launch Structural Active Sheet Protection Configuration Modal",
        category: "System Helpers",
        description: "Locks down cells inside the current sheet tab to stop other users from altering your formulas or layout formats.",
        mappings: {
            windows: { keys: ["Alt", "R", "P", "S"], display: "Alt + R + P + S" },
            mac: { keys: ["Option", "R", "P", "S"], display: "⌥ + R + P + S" }
        }
    },
    {
        id: "sc_protect_workbook",
        action: "Launch Structural Active Workbook Protection Configuration Modal",
        category: "System Helpers",
        description: "Password-locks the overall workbook setup to prevent unauthorized users from deleting, adding, or hiding tabs.",
        mappings: {
            windows: { keys: ["Alt", "R", "P", "W"], display: "Alt + R + P + W" },
            mac: { keys: ["Option", "R", "P", "W"], display: "⌥ + R + P + W" }
        }
    }
];