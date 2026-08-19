export const QUIZ_DB = [
    // ==========================================
    // 1. BASIC LEVEL PATH (17 QUESTIONS)
    // ==========================================
    {
        id: "q_absolute_ref",
        category: "Basics",
        difficulty: "basic",
        question: "Which cell state configuration is targeted when a string formula reads exactly as '$A1'?",
        options: [
            "The entire cell intersection is locked permanently.",
            "The cell acts completely relative during drag-fill operations.",
            "The row changes dynamically, while the column reference remains strictly locked.",
            "The column moves across steps, while the row retains its reference lock."
        ],
        correctIndex: 2,
        explanation: "The leading '$' symbol acts as an absolute structural lock. Placing it solely before 'A' locks column navigation entirely while allowing vertical row numbers to increment dynamically during fill steps."
    },
    {
        id: "q_basic_sum",
        category: "Basics",
        difficulty: "basic",
        question: "What is the correct syntax to add the values of cells A1 through A4 together?",
        options: [
            "=SUM(A1+A4)",
            "=SUM(A1:A4)",
            "=ADD(A1:A4)",
            "=COUNT(A1-A4)"
        ],
        correctIndex: 1,
        explanation: "The colon (:) operator represents a continuous range link descriptor. Using =SUM(A1:A4) aggregates all numerical records inside that boundary cleanly."
    },
    {
        id: "q_cell_limit",
        category: "Basics",
        difficulty: "basic",
        question: "What is the maximum total row capacity boundary limit of a single standard Excel sheet canvas?",
        options: [
            "65,536 rows",
            "500,000 rows",
            "1,048,576 rows",
            "16,384 rows"
        ],
        correctIndex: 2,
        explanation: "Since the introduction of the modern Big Grid engine layouts, sheets support exactly 1,048,576 rows and 16,384 columns (ending at column label XFD)."
    },
    {
        id: "q_clear_all",
        category: "Basics",
        difficulty: "basic",
        question: "Which native keyboard execution action completely flushes out both structural formatting styles and stored record texts inside highlighted bounds?",
        options: [
            "Pressing Delete key",
            "Pressing Backspace key",
            "Using Clear All routine via Home ribbon dropdown layout",
            "Right-clicking and choosing Hide option"
        ],
        correctIndex: 2,
        explanation: "The standard Delete key only flushes raw content strings out of cell matrices, keeping original background fills or border formatting locks active. Only Clear All purges both layers at once."
    },
    {
        id: "q_count_vs_counta",
        category: "Basics",
        difficulty: "basic",
        question: "What distinguishes the COUNTA statement tool from the standard base COUNT function loop?",
        options: [
            "COUNTA targets blank coordinates exclusively.",
            "COUNT aggregates alpha-text labels, while COUNTA parses currency floats.",
            "COUNT evaluates numeric entries only, while COUNTA tracks any non-empty data blocks.",
            "There is no functional processing difference between them."
        ],
        correctIndex: 2,
        explanation: "The basic COUNT function counts cells containing numbers. COUNTA scans for any data character tokens (strings, logicals, errors, texts), ignoring only blank cells."
    },
    {
        id: "q_uppercase",
        category: "Basics",
        difficulty: "basic",
        question: "Which syntax safely forces all alphanumeric string items in column B2 to render exclusively in capital letter forms?",
        options: [
            "=UPPER(B2)",
            "=CAPITAL(B2)",
            "=PROPER(B2)",
            "=STRING.MAX(B2)"
        ],
        correctIndex: 0,
        explanation: "=UPPER() parses string arguments and converts lowercase letters to uppercase. =PROPER() only capitalizes the first character of each word block."
    },
    {
        id: "q_save_as_key",
        category: "Basics",
        difficulty: "basic",
        question: "Which keyboard hotkey function instantly triggers the 'Save As' directory targeting wizard page on Windows?",
        options: [
            "F4",
            "F12",
            "Ctrl + Shift + S",
            "Alt + S"
        ],
        correctIndex: 1,
        explanation: "Pressing F12 bypasses the standard background account dashboards and jumps directly into the physical directory targeting interface window."
    },
    {
        id: "q_flash_fill_key",
        category: "Basics",
        difficulty: "basic",
        question: "What is the explicit keyboard combination required to execute a dynamic automated Flash Fill transformation?",
        options: [
            "Ctrl + F",
            "Ctrl + E",
            "Alt + Enter",
            "Ctrl + Shift + L"
        ],
        correctIndex: 1,
        explanation: "Ctrl + E triggers the pattern detection engine, reading surrounding vertical columns to extract or format text records instantly."
    },
    {
        id: "q_average_error",
        category: "Basics",
        difficulty: "basic",
        question: "What error layout code appears if an AVERAGE query highlights an empty range holding no numeric data keys?",
        options: [
            "#NAME?",
            "#DIV/0!",
            "#VALUE!",
            "#NULL!"
        ],
        correctIndex: 1,
        explanation: "Because mathematical averages split aggregate summaries against matching element counts, analyzing zero numerical properties means dividing by 0, resulting in a #DIV/0! error token."
    },
    {
        id: "q_hide_ribbon",
        category: "Basics",
        difficulty: "basic",
        question: "Which keyboard layout shortcut toggles the visibility status of the top structural tool ribbon console?",
        options: [
            "Ctrl + F1",
            "Ctrl + F4",
            "Alt + Shift + R",
            "F5"
        ],
        correctIndex: 0,
        explanation: "Ctrl + F1 dynamically expands or collapses the command ribbon layout tabs, saving active coordinate viewport screen estate."
    },
    {
        id: "q_workbook_ext",
        category: "Basics",
        difficulty: "basic",
        question: "What is the standard native XML file extension extension applied to default macro-free Excel workbooks saved today?",
        options: [
            ".xls",
            ".xlsm",
            ".xlsx",
            ".csv"
        ],
        correctIndex: 2,
        explanation: "The default macro-free workbook extension format is .xlsx. Files containing automated macro instructions must be saved as .xlsm to keep their macro code execution blocks active."
    },
    {
        id: "q_autofit_mouse",
        category: "Basics",
        difficulty: "basic",
        question: "Where should a user double-click with their mouse cursor tool to instantly auto-fit a column layout width?",
        options: [
            "Directly on the active center coordinates of cell A1",
            "On the right border edge of the column heading layout label letter slot",
            "Inside the status bar matrix indicator path",
            "On the row number index margin markers"
        ],
        correctIndex: 1,
        explanation: "Double-clicking the divider edge line on the right side of a column heading triggers an auto-fit pass, adapting the column width to match its longest text value."
    },
    {
        id: "q_if_syntax",
        category: "Basics",
        difficulty: "basic",
        question: "What are the three structural functional positional inputs required to construct a valid logical logical =IF function?",
        options: [
            "logical_test, [value_if_true], [value_if_false]",
            "range, criteria, sum_range",
            "lookup_value, table_array, col_index",
            "expression, scenario, action"
        ],
        correctIndex: 0,
        explanation: "The structural model for an IF statement runs a target conditional evaluation argument, outputs result branch A if verified true, or executes path B if resolved false."
    },
    {
        id: "q_text_alignment",
        category: "Basics",
        difficulty: "basic",
        question: "By default layout standard behaviors, how does Excel automatically align raw text characters versus numbers inside grid locations?",
        options: [
            "Numbers align left; Text blocks align right.",
            "Text blocks align left; Numbers align right.",
            "Both components center-align automatically.",
            "Text locks to the right; Numbers center completely."
        ],
        correctIndex: 1,
        explanation: "Excel automatically left-aligns raw text values, while numbers, dates, and boolean values align to the right to maintain clear ledger structure."
    },
    {
        id: "q_autosum_hotkey",
        category: "Basics",
        difficulty: "basic",
        question: "Which keyboard combination inserts an automated AutoSum function block matching adjacent numbers instantly?",
        options: [
            "Ctrl + S",
            "Alt + =",
            "Shift + F3",
            "Alt + H + U + S"
        ],
        correctIndex: 1,
        explanation: "Pressing Alt + = builds an automated SUM formula, reading adjacent data coordinates to guess the target range boundary."
    },
    {
        id: "q_today_func",
        category: "Basics",
        difficulty: "basic",
        question: "Which formulation query stamps the current matching computer clock date string volatilely onto a sheet grid location?",
        options: [
            "=DATE()",
            "=TODAY()",
            "=NOW.DATE()",
            "=CURRENT()"
        ],
        correctIndex: 1,
        explanation: "=TODAY() takes zero arguments and returns the current system date. It recalculates dynamically every time the workbook computes values."
    },
    {
        id: "q_freeze_panes_tab",
        category: "Basics",
        difficulty: "basic",
        question: "Under which primary core tool ribbon menu tab path can you find the window Freeze Panes controls?",
        options: [
            "Home tab",
            "Insert tab",
            "View tab",
            "Page Layout tab"
        ],
        correctIndex: 2,
        explanation: "Window viewport scaling options, splitting, custom grid visibility overlays, macro side desks, and Freeze Panes menus sit under the primary View ribbon tab."
    },

    // ==========================================
    // 2. ADVANCED LEVEL PATH (17 QUESTIONS)
    // ==========================================
    {
        id: "q_vlookup_col",
        category: "Formulas",
        difficulty: "advanced",
        question: "What happens if the column index argument in a VLOOKUP formula is set to less than 1?",
        options: [
            "It returns the leftmost column value automatically.",
            "It triggers a #VALUE! error structural break.",
            "It searches column positions relative to the right side.",
            "It defaults to a standard approximate match mode."
        ],
        correctIndex: 1,
        explanation: "If the col_index_num argument evaluates to less than 1, Excel throws a #VALUE! runtime error. If it exceeds the actual bounding column count of the selection matrix, it yields #REF!."
    },
    {
        id: "q_dynamic_array_spill",
        category: "Advanced Features",
        difficulty: "advanced",
        question: "What specific error notation is generated when an array output cannot expand fully due to intersecting data block records?",
        options: [
            "#REF!",
            "#SPILL!",
            "#NUM!",
            "#OVERFLOW!"
        ],
        correctIndex: 1,
        explanation: "Modern dynamic array formulas automatically compute bounds. If an active structural asset blocks its physical expansion route path down adjacent matrices, a #SPILL! error boundary token is raised."
    },
    {
        id: "q_index_match_flex",
        category: "Formulas",
        difficulty: "advanced",
        question: "What primary computational advantage does an INDEX & MATCH nested engine combination provide over standard traditional VLOOKUP formulas?",
        options: [
            "It forces data strings into uppercase layouts automatically.",
            "It calculates results faster because it requires choosing the entire table matrix.",
            "It can scan columns leftward and dynamically adapt to new column insertion steps.",
            "It encrypts underlying formulas from user views entirely."
        ],
        correctIndex: 2,
        explanation: "INDEX and MATCH look up values across separate independent column vectors. This allows leftward column lookups and prevents formula corruption when inserting or moving columns."
    },
    {
        id: "q_xlookup_default",
        category: "Formulas",
        difficulty: "advanced",
        question: "Unlike traditional VLOOKUP patterns, what match mode parameter configuration does the modern XLOOKUP query apply by default if its match argument is left omitted?",
        options: [
            "Approximate Match mode matching next smallest values.",
            "Exact Match mode options exclusively.",
            "Wildcard character string validation parser logic.",
            "Approximate Match options returning next largest parameters."
        ],
        correctIndex: 1,
        explanation: "XLOOKUP defaults to an exact match mode (0). This removes the old requirement of adding a trailing 'FALSE' string to guarantee exact matches."
    },
    {
        id: "q_conditional_formatting_rules",
        category: "Data Analysis",
        difficulty: "advanced",
        question: "If multiple separate conditional formatting rules highlight overlapping cell addresses, which rule takes visual display priority?",
        options: [
            "The rule sitting at the bottom of the rules manager stack list.",
            "The rule sitting at the absolute top of the processing list in the rules manager.",
            "The rule that was created first historically.",
            "Excel blends colors together equally."
        ],
        correctIndex: 1,
        explanation: "The Conditional Formatting rules manager applies a top-down priority model. The rule at the absolute top of the list overrides any conflicting style parameters below it."
    },
    {
        id: "q_pivot_source_update",
        category: "Data Analysis",
        difficulty: "advanced",
        question: "What happens to an active PivotTable summary block layout when a user overwrites raw records inside its underlying source data table grid?",
        options: [
            "The PivotTable recalibrates and displays new summaries instantly.",
            "The target view values break, throwing a persistent #REF! loop.",
            "Nothing updates until a manual Data Refresh routine is triggered.",
            "The spreadsheet file locks execution threads to trigger data backups."
        ],
        correctIndex: 2,
        explanation: "PivotTable architectures cache data for performance. Modifying background source tables will not update the pivot summary layout until you trigger a manual Data Refresh operation."
    },
    {
        id: "q_pmt_negative",
        category: "Formulas",
        difficulty: "advanced",
        question: "Why does the standard financial function tool =PMT() return negative currency outcomes by default layout specs?",
        options: [
            "It indicates a logical syntax error occurred during calculations.",
            "It treats loan repayments as an outgoing financial cash outflow vector.",
            "The system requires converting interest inputs into negative percentages first.",
            "It indicates the loan model has defaulted."
        ],
        correctIndex: 1,
        explanation: "Excel's financial functions follow standard cash-flow direction rules. Outgoing money or loan repayment runs are represented as negative vectors."
    },
    {
        id: "q_text_join_delim",
        category: "Formulas",
        difficulty: "advanced",
        question: "What makes the modern TEXTJOIN expression vastly superior to old basic CONCATENATE options when assembling multi-cell ranges?",
        options: [
            "It automatically handles text block string translations.",
            "It lets you define a fixed delimiter string once and safely skip empty blank cells.",
            "It works exclusively on hidden rows.",
            "It converts numerical codes into ASCII blocks."
        ],
        correctIndex: 1,
        explanation: "TEXTJOIN lets you set a delimiter (like a comma) once for an entire range, and includes a handy boolean flag to skip empty cells automatically."
    },
    {
        id: "q_custom_filter_wildcard",
        category: "Data Analysis",
        difficulty: "advanced",
        question: "Which wildcard symbol matches exactly one single text character inside custom table filter search paths?",
        options: [
            "Asterisk (*)",
            "Question Mark (?)",
            "Tilde (~)",
            "Ampersand (&)"
        ],
        correctIndex: 1,
        explanation: "An asterisk (*) matches any sequence of characters, while a question mark (?) matches exactly one individual character slot."
    },
    {
        id: "q_sumproduct_matrix",
        category: "Formulas",
        difficulty: "advanced",
        question: "What is the structural constraint required to avoid throwing #VALUE! errors when running multi-range arrays inside a SUMPRODUCT query?",
        options: [
            "All arrays must contain only prime values.",
            "All target matrix components must share identical coordinate dimensions.",
            "The data elements must be pre-sorted in ascending patterns.",
            "The tracking ranges must stay isolated inside a single column index."
        ],
        correctIndex: 1,
        explanation: "SUMPRODUCT performs element-by-element matrix multiplication. If your input arrays do not share matching row and column lengths, the math loop fails and throws a #VALUE! error."
    },
    {
        id: "q_power_query_unpivot",
        category: "Advanced Features",
        difficulty: "advanced",
        question: "Which core Power Query transformation step turns wide, multi-column reporting tables back into vertical, normalized row records?",
        options: [
            "Transposing rows",
            "Unpivot Columns transformation tool",
            "Merge Query operation",
            "Split Column routine"
        ],
        correctIndex: 1,
        explanation: "The Unpivot Columns tool takes wide, matrix-style columns and flushes them into tabular attribute-value row records, which is perfect for database modeling."
    },
    {
        id: "q_subtotal_ignore",
        category: "Formulas",
        difficulty: "advanced",
        question: "What unique calculation superpower does the SUBTOTAL function have compared to standard aggregation options like SUM or COUNTA?",
        options: [
            "It translates formula text blocks into actual numbers.",
            "It can skip over rows that are hidden by active table filters.",
            "It calculates geometric averages automatically.",
            "It updates external database source structures directly."
        ],
        correctIndex: 1,
        explanation: "SUBTOTAL dynamically ignores rows hidden by filters. If you use function indexes above 100 (like 109 for SUM), it also skips rows that were manually hidden."
    },
    {
        id: "q_goal_seek_type",
        category: "Data Analysis",
        difficulty: "advanced",
        question: "Under which analytical toolkit classification option does the iterative Goal Seek tool sit inside the primary Data ribbon menu?",
        options: [
            "Forecast Sheet optimization profiles",
            "What-If Analysis tool dropdown engine",
            "Data Validation rules dashboard",
            "Consolidate tools stack"
        ],
        correctIndex: 0,
        explanation: "Goal Seek is a root component of the What-If Analysis toolkit, which also includes Scenario Manager and Data Tables."
    },
    {
        id: "q_duplicate_removal_rule",
        category: "Data Analysis",
        difficulty: "advanced",
        question: "When running the native 'Remove Duplicates' tool across a multi-column row selection, what criteria determines a duplicate entry?",
        options: [
            "A duplicate is flagged if a single cell match is found anywhere in the table.",
            "A row must match identical values across *all* checked columns to be removed.",
            "The tool only checks the first column index.",
            "It flags cells that share matching background colors."
        ],
        correctIndex: 1,
        explanation: "Excel flushes out data rows only if they show duplicate values across all columns checked in the configuration checklist panel."
    },
    {
        id: "q_networkdays_custom",
        category: "Formulas",
        difficulty: "advanced",
        question: "What optional third array argument can you pass to the NETWORKDAYS function to adjust calculated work timeline tracking?",
        options: [
            "A list of half-day shift parameters",
            "A range of custom holiday calendar dates to exclude from the total count",
            "An array of standard overtime hours",
            "A custom text string defining the weekend model"
        ],
        correctIndex: 1,
        explanation: "The third argument of NETWORKDAYS accepts a custom date list of company or public holidays. The engine skips these dates alongside standard weekends."
    },
    {
        id: "q_named_range_scope",
        category: "Advanced Features",
        difficulty: "advanced",
        question: "What happens if a Named Range variable is created with its scope restricted strictly to 'Sheet1' instead of the global 'Workbook' option?",
        options: [
            "The name variable is hidden and cannot be edited.",
            "Formulas on Sheet2 cannot call that name unless they include the sheet name prefix.",
            "The system throws a calculation error if the name length exceeds four letters.",
            "The named range will automatically delete itself when the file closes."
        ],
        correctIndex: 1,
        explanation: "Local sheet-scoped names can be called from other tabs only if you add the sheet name prefix (e.g., Sheet1!MyLocalRange). Global workbook-scoped names can be called directly from any sheet."
    },
    {
        id: "q_data_validation_list",
        category: "Data Analysis",
        difficulty: "advanced",
        question: "What raw separator character must be used when typing a hardcoded list of values directly into the Data Validation source input field?",
        options: [
            "Semicolon (;)",
            "Comma (,)",
            "Pipe symbol (|)",
            "Forward slash (/)"
        ],
        correctIndex: 1,
        explanation: "When typing values directly into the Data Validation list source box instead of referencing a range, separate your entries using standard commas."
    },

    // ==========================================
    // 3. EXPERT LEVEL PATH (16 QUESTIONS)
    // ==========================================
    {
        id: "q_let_efficiency",
        category: "Optimization",
        difficulty: "expert",
        question: "What primary optimization benefit is unlocked by integrating the LET function within nested calculation chains?",
        options: [
            "It circumvents calculation step auditing restrictions completely.",
            "It eliminates calculations entirely by saving raw state snapshots directly to file system disk.",
            "It calculates redundant expressions exactly once, improving compilation parsing speeds across complex files.",
            "It translates raw execution nodes to high-speed VBA native macro threads automatically."
        ],
        correctIndex: 2,
        explanation: "The LET function allows assigning user-defined programmatic variables to intermediate evaluation targets. Excel resolves those expressions only once, drastically reducing analytical execution overhead."
    },
    {
        id: "q_vba_screen_updating",
        category: "Optimization",
        difficulty: "expert",
        question: "Which programmatic VBA directive line optimizes macro loop speeds by preventing the rendering engine from drawing UI updates?",
        options: [
            "Application.RenderEngine = False",
            "Application.ScreenUpdating = False",
            "ActiveWorkbook.DisableGraphicsUpdate",
            "System.ThreadPriority = Max"
        ],
        correctIndex: 1,
        explanation: "Setting Application.ScreenUpdating = False stops intermediate screen refreshing during macro runs, which speeds up processing loops and eliminates screen flickering."
    },
    {
        id: "q_array_hash_error",
        category: "Optimization",
        difficulty: "expert",
        question: "What core architectural calculation error occurs if a developer attempts to pass a dynamic hash array reference tag (e.g. 'A1#') into a legacy function that does not support dynamic arrays?",
        options: [
            "It returns a standard #NAME? error.",
            "It truncates the data array and reads only cell A1, ignoring the rest of the spill range.",
            "It throws a #VALUE! error or crashes the evaluation loop thread.",
            "Excel automatically upgrades the legacy formula block."
        ],
        correctIndex: 1,
        explanation: "The spill operator hash token (#) points to an entire dynamic range. Passing it into legacy functions that don't support dynamic arrays often limits the formula to evaluating just the top-left cell (A1)."
    },
    {
        id: "q_lambda_recursive",
        category: "Optimization",
        difficulty: "expert",
        question: "What advanced programming technique is uniquely unlocked by using the LAMBDA function in the Excel Name Manager?",
        options: [
            "Building self-referencing, recursive custom functions without writing VBA or Office Scripts.",
            "Linking workbooks directly to low-level assembly language modules.",
            "Running multi-threaded tasks on separate external servers.",
            "Bypassing sheet protection layers without using passwords."
        ],
        correctIndex: 0,
        explanation: "Excel's LAMBDA engine supports recursion. A named LAMBDA function can call itself directly, allowing you to build complex looping functions without writing VBA code."
    },
    {
        id: "q_binary_lookup_danger",
        category: "Optimization",
        difficulty: "expert",
        question: "What critical risk do you run when forcing a binary search lookup match mode (approximate match) via VLOOKUP or XLOOKUP on an unsorted database column?",
        options: [
            "The calculation loop crashes Excel instantly.",
            "The formula evaluates fine but can return completely wrong, unpredictable data matches.",
            "Excel defaults back to an exact match lookup pass automatically.",
            "The result is forced into text string formatting styles."
        ],
        correctIndex: 1,
        explanation: "Binary search algorithms expect sorted arrays. Running a binary lookup on an unsorted range can return incorrect data matches without warning because the engine assumes the data is sorted."
    },
    {
        id: "q_power_pivot_dax",
        category: "Advanced Features",
        difficulty: "expert",
        question: "What structural calculation framework engine underpins Power Pivot data modeling calculations in Excel?",
        options: [
            "SQL Server Translation Query scripts",
            "Data Analysis Expressions (DAX) syntax language engine",
            "VBA Object Model compiler threads",
            "M Query structural translation models"
        ],
        correctIndex: 1,
        explanation: "Power Pivot uses the Data Analysis Expressions (DAX) language engine to handle data modeling and complex calculations. Power Query transforms data using the M language."
    },
    {
        id: "q_vba_implicit_instantiation",
        category: "Optimization",
        difficulty: "expert",
        question: "In VBA development, why is declaring variables using 'Dim x As New Worksheet' (implicit instantiation) considered poor optimization practice?",
        options: [
            "It locks the variable from accepting edits later.",
            "The compiler forces the object reference to stay empty.",
            "VBA must check if the object exists every time it is called, adding massive overhead inside looping scripts.",
            "It forces the system memory pointer to duplicate itself."
        ],
        correctIndex: 2,
        explanation: "Using 'As New' creates an implicitly instantiated variable. The VBA runtime must check if the object pointer is initialized every time the variable is called, which slows down execution loops."
    },
    {
        id: "q_array_transpose_limit",
        category: "Optimization",
        difficulty: "expert",
        question: "What historical limit constraint did the standard worksheet function =TRANSPOSE() encounter when manipulating large arrays in legacy Excel setups?",
        options: [
            "It couldn't flip text-based string values.",
            "It threw a #NUM! error if your target range exceeded exactly 65,536 elements.",
            "It only worked inside a single column tracker layout.",
            "It changed formulas back into raw values automatically."
        ],
        correctIndex: 1,
        explanation: "Legacy TRANSPOSE functions broke and threw a #NUM! error if your array exceeded 65,536 cells. Modern Excel engine upgrades have removed this limit."
    },
    {
        id: "q_volatile_offset_indirect",
        category: "Optimization",
        difficulty: "expert",
        question: "Why does heavy use of formulas like INDIRECT(), OFFSET(), and TODAY() cause huge performance drops in large corporate files?",
        options: [
            "They disable multithreading processing entirely.",
            "They are volatile functions that recalculate on *every single change* made anywhere in the workbook.",
            "They require background internet connections to verify time signatures.",
            "They force values to save to disk as temporary hidden files."
        ],
        correctIndex: 1,
        explanation: "Volatile functions ignore Excel's optimized calculation path tracking. They recalculate on every worksheet edit, creating massive lag in large corporate files."
    },
    {
        id: "q_m_language_case",
        category: "Advanced Features",
        difficulty: "expert",
        question: "Which structural rule applies to editing formula strings in the Power Query Advanced Editor (M Language)?",
        options: [
            "The M engine ignores letter casing entirely.",
            "The M language is strictly case-sensitive, meaning =table.selectrows() will fail if not capitalized properly.",
            "It enforces uppercase lettering across all variable names.",
            "It converts formula text blocks into SQL queries automatically."
        ],
        correctIndex: 1,
        explanation: "Power Query's M language is strictly case-sensitive. Built-in functions like Table.SelectRows must use exact capitalization rules or the execution step will fail."
    },
    {
        id: "q_user_defined_function_calc",
        category: "Optimization",
        difficulty: "expert",
        question: "What do you need to add to a custom VBA User Defined Function (UDF) to make it recalculate automatically whenever spreadsheet values change?",
        options: [
            "Set the function scope to Public Static.",
            "Add Application.Volatile inside the function code block.",
            "Wrap calculation logic inside a Do-While loop statement.",
            "Link the function to a sheet event trigger script."
        ],
        correctIndex: 1,
        explanation: "Adding Application.Volatile inside your custom UDF code tells the calculation engine to update the function on every worksheet calculation pass."
    },
    {
        id: "q_evaluate_macro_string",
        category: "Advanced Features",
        difficulty: "expert",
        question: "What advanced trick can the hidden XLM Excel 4.0 macro function =EVALUATE() perform that standard formulas cannot?",
        options: [
            "It converts text code strings (like '2+5*3') into live mathematical results.",
            "It bypasses workbook password encryption protections.",
            "It saves sheets directly to external web addresses.",
            "It reads text values inside closed files without opening them."
        ],
        correctIndex: 0,
        explanation: "The legacy XLM function =EVALUATE() parses mathematical text strings and evaluates them into live numeric results. It can still be used inside Named Ranges today."
    },
    {
        id: "q_pivottable_mdx",
        category: "Advanced Features",
        difficulty: "expert",
        question: "When connecting an Excel PivotTable directly to an external SQL Server Analysis Services (SSAS) OLAP cube, what query language does Excel use behind the scenes?",
        options: [
            "T-SQL script paths",
            "MultiDimensional Expressions (MDX)",
            "DAX query models",
            "JSON data packet requests"
        ],
        correctIndex: 1,
        explanation: "Excel communicates with multi-dimensional OLAP cubes using MultiDimensional Expressions (MDX). The pivot engine sends MDX queries behind the scenes to fetch summarized data slices."
    },
    {
        id: "q_vba_dictionary_reference",
        category: "Optimization",
        difficulty: "expert",
        question: "Which external system library must be loaded to use early-bound Dictionary objects (Scripting.Dictionary) in a VBA macro?",
        options: [
            "Microsoft Scripting Runtime",
            "Microsoft ActiveX Data Objects",
            "Microsoft VBScript Regular Expressions",
            "Excel Analysis Toolpak Engine"
        ],
        correctIndex: 0,
        explanation: "To use early-bound Dictionary types, open the VBA References panel and check 'Microsoft Scripting Runtime'. This enables full compilation checks and autocomplete support."
    },
    {
        id: "q_power_query_fast_combine",
        category: "Optimization",
        difficulty: "expert",
        question: "What primary hazard or architectural trade-off do you make when turning on 'Fast Combine' privacy levels in Power Query?",
        options: [
            "It slows down query combination processing speeds.",
            "It bypasses privacy safeguards, potentially sending sensitive data between separate external data sources.",
            "It restricts tables from loading more than 10,000 row records.",
            "It converts calculation code text back into basic text values."
        ],
        correctIndex: 1,
        explanation: "Turning on Fast Combine speeds up processing by ignoring security boundaries. However, this allows data to be shared across separate external sources, creating potential data privacy risks."
    },
    {
        id: "q_calc_iterative_count",
        category: "Optimization",
        difficulty: "expert",
        question: "What core setting must be changed in Excel's global application options to allow a formula to intentionally reference its own cell address (Circular Reference)?",
        options: [
            "Turn on Enable Iterative Calculation and set your maximum loop count limits.",
            "Set Calculation Options from Manual straight to Automatic.",
            "Turn off the automatic background error checking flag.",
            "Convert formulas into dynamic array structures."
        ],
        correctIndex: 0,
        explanation: "Excel throws a circular reference warning if a formula references its own cell. Turning on 'Enable Iterative Calculation' allows this behavior, stopping the calculation loop once it hits your maximum iteration limit."
    }
];