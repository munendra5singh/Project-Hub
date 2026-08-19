/**
 * ==========================================================================
 * ExcelSuperGuru - Tiered QA Interview Architecture Model
 * ==========================================================================
 * Curated structural compilation containing expert corporate responses 
 * mapped explicitly to standardized analytical interview frameworks.
 */

export const INTERVIEW_DB = [
    // ==========================================
    // 1. BASIC LEVEL ARCHITECTURE (13 QUESTIONS)
    // ==========================================
    {
        id: "int_power_query",
        tier: "basic",
        domain: "ETL Pipelines",
        question: "What distinct role does Power Query serve compared to standard cell formula processing frameworks?",
        answer: "Power Query acts as an explicit ETL (Extract, Transform, Load) system outside the grid layer. It handles schema ingestion, structural data cleanup, row unpivoting, and source parsing steps before loading clean outputs to memory. This keeps transactional cleaning steps distinct from active financial calculation fields."
    },
    {
        id: "int_absolute_vs_relative",
        tier: "basic",
        domain: "Grid Mechanics",
        question: "Can you explain the practical operational difference between an absolute cell reference and a relative reference?",
        answer: "A relative reference (e.g., A1) alters its row and column coordinate pointers dynamically when dragged or copied across cell fields. An absolute reference (e.g., $A$1) uses string anchoring metadata locks ($) to freeze the precise coordinate intersection, preventing changes during grid fill steps."
    },
    {
        id: "int_vlookup_syntax",
        tier: "basic",
        domain: "Data Integration",
        question: "What are the four required parameters to construct a standard VLOOKUP formula, and why is the last one critical?",
        answer: "The parameters are lookup_value, table_array, col_index_num, and [range_lookup]. The last parameter is critical because omitting it defaults to TRUE (approximate match), which can return incorrect or unpredictable records if the target dataset column is not sorted in ascending order."
    },
    {
        id: "int_count_vs_counta",
        tier: "basic",
        domain: "Aggregation Functions",
        question: "What distinct cell types are evaluated when utilizing COUNT versus the COUNTA function?",
        answer: "The standard COUNT function strictly checks for cells containing valid numeric values, tracking currency strings and dates. COUNTA checks for any data character tokens (including alphanumeric texts, string values, errors, and empty text spaces), ignoring only pure blank cells."
    },
    {
        id: "int_flash_fill_mechanic",
        tier: "basic",
        domain: "Data Cleansing",
        question: "How does the Flash Fill engine operate, and how can an analyst trigger it manually?",
        answer: "Flash Fill uses predictive pattern recognition algorithms to analyze user input trends across adjacent columns and automatically populate matching records. It is triggered manually via the Data ribbon tab or through the keyboard shortcut combination Ctrl + E."
    },
    {
        id: "int_table_benefits",
        tier: "basic",
        domain: "Data Structuring",
        question: "What structural advantages are unlocked when converting a standard cell grid range into a formal Excel Table object?",
        answer: "Converting a range to a formal Table (Ctrl + T) enables dynamic data expanding properties where new rows inherit calculations automatically. It also creates explicit structured reference naming styles (e.g., Table1[@Amount]), auto-injects column filter toggles, and keeps pivot table coordinate references aligned."
    },
    {
        id: "int_remove_dupes_behavior",
        tier: "basic",
        domain: "Data Cleansing",
        question: "When executing the 'Remove Duplicates' tool across three checked columns, how does Excel determine which records to eliminate?",
        answer: "Excel evaluates duplicate status based on a row-level combined criteria match. A row record is eliminated only if its data matches another row across all three checked column properties. If any checked column holds a distinct element, the row stays intact."
    },
    {
        id: "int_paste_special_values",
        tier: "basic",
        domain: "Memory Optimization",
        question: "Why would an analyst execute a Paste Special Values command over a heavy formula range?",
        answer: "Paste Special Values flushes out the underlying calculation execution logic strings while freezing their computed outputs as hardcoded constants. This breaks formula dependencies, saves file size, and cuts down on recalculation loops before exporting sheets."
    },
    {
        id: "int_if_nested_limits",
        tier: "basic",
        domain: "Logical Control",
        question: "What is a nested IF statement, and what modern alternative helps streamline multi-condition checking arrays?",
        answer: "A nested IF places secondary IF functions inside the true/false result arguments of a root IF statement to check multiple conditions. To avoid complex nested parenthesis errors, analysts now use the modern IFS function, which evaluates sequential criteria in a single formula block."
    },
    {
        id: "int_text_formatting",
        tier: "basic",
        domain: "Data Presentation",
        question: "Why does numbers changing to string formats via apostrophes (') disrupt mathematical calculations?",
        answer: "Prefixing a number with an apostrophe forces the Excel engine to parse the digits as raw text strings instead of numeric attributes. Consequently, basic aggregation tools like SUM or AVERAGE will skip these text values, leading to skewed summary results."
    },
    {
        id: "int_text_to_columns",
        tier: "basic",
        domain: "Data Processing",
        question: "Describe the function of the 'Text to Columns' wizard tool in data onboarding workflows.",
        answer: "Text to Columns parses single columns of delimited text blocks (like CSV files separated by commas, tabs, or spaces) and splits them across separate individual column fields based on a chosen delimiter rule or fixed character width."
    },
    {
        id: "int_error_types_basic",
        tier: "basic",
        domain: "Error Auditing",
        question: "What root diagnostic mistake triggers a #NAME? error token in a worksheet location?",
        answer: "A #NAME? error appears when the calculation engine fails to recognize a string keyword. This typically happens because a function name is misspelled (e.g., =VLOOKP), an unquoted text string is left inside a formula, or a referenced Named Range is missing."
    },
    {
        id: "int_freeze_panes_utility",
        tier: "basic",
        domain: "UI Configuration",
        question: "Explain the workflow benefit of applying Freeze Panes to massive tabular sheets.",
        answer: "Freeze Panes locks chosen row headers or tracking column borders in place at the top or left side of the screen. This guarantees that column categories remain fully visible as users scroll down or across massive data rows."
    },

    // ==========================================
    // 2. INTERMEDIATE LEVEL ARCHITECTURE (12 QUESTIONS)
    // ==========================================
    {
        id: "int_index_match",
        tier: "intermediate",
        domain: "Data Architecture",
        question: "Why do enterprise analysts traditionally prefer utilizing INDEX/MATCH over legacy VLOOKUP setups?",
        answer: "INDEX/MATCH decouples horizontal lookup arrays from the target return matrix. Unlike VLOOKUP, which demands that key inputs reside strictly in the left-most index vector, INDEX/MATCH performs bi-directional scanning. Furthermore, it avoids parsing entire data blocks, targeting precise arrays to significantly lower runtime compilation overhead."
    },
    {
        id: "int_sumifs_criteria",
        tier: "intermediate",
        domain: "Analytical Modeling",
        question: "How does SUMIFS handle evaluation criteria internally, and what constraint applies to its range arguments?",
        answer: "SUMIFS applies an implicit AND logical condition across all provided criteria arrays, meaning a row is aggregated only if it satisfies every criteria rule. The primary structural constraint is that all criteria_range arrays must match the exact row and column dimensions of the root sum_range."
    },
    {
        id: "int_conditional_fmt_formula",
        tier: "intermediate",
        domain: "UI Automation",
        question: "How do custom logical formulas behave when used inside Conditional Formatting rules?",
        answer: "The formula is evaluated from the perspective of the top-left cell in your selected range. It must return a logical TRUE or FALSE value. If it returns TRUE, the style formatting applies. To highlight entire rows based on a single column's value, you must use a mixed reference style like $A1 to lock the column while allowing row numbers to increment."
    },
    {
        id: "int_pivot_cache_concept",
        tier: "intermediate",
        domain: "Memory Dynamics",
        question: "What is the Pivot Cache, and what role does it play in workbook memory usage?",
        answer: "The Pivot Cache is an optimized memory buffer that stores a copy of your source data. Excel reads from this cache instead of querying the raw data rows directly to speed up layout updates. While this improves performance, it also duplicates data records, which can significantly increase workbook file size."
    },
    {
        id: "int_subtotal_filtered",
        tier: "intermediate",
        domain: "Aggregation Functions",
        question: "What unique benefit does the SUBTOTAL function offer when analyzing datasets with hidden rows?",
        answer: "Unlike standard aggregate functions like SUM, the SUBTOTAL function can dynamically skip data rows hidden by active table filters. Using a three-digit function index (like 109 instead of 9) also tells the engine to ignore rows that were manually hidden by the user."
    },
    {
        id: "int_xlookup_advantages",
        tier: "intermediate",
        domain: "Data Integration",
        question: "What core issues does the modern XLOOKUP function solve compared to legacy lookup approaches?",
        answer: "XLOOKUP defaults to an exact match mode, removing the risk of error from omitting the trailing range argument. It supports leftward vertical lookups natively, handles vertical array returns, can run next-largest approximate matches, and includes an inline [if_not_found] handler to clean up nesting structures."
    },
    {
        id: "int_textjoin_vs_concat",
        tier: "intermediate",
        domain: "String Manipulation",
        question: "What makes the TEXTJOIN function vastly superior to the older CONCATENATE function?",
        answer: "TEXTJOIN lets you set a uniform delimiter string (like a comma or hyphen) just once for an entire cell array block. It also includes an explicit boolean parameter flag to skip empty blank cells automatically, avoiding annoying trailing delimiters in concatenated text strings."
    },
    {
        id: "int_named_range_scoping",
        tier: "intermediate",
        domain: "Data Structuring",
        question: "What is the operational difference between setting a Named Range scope to 'Workbook' versus a specific 'Worksheet' tab?",
        answer: "A workbook-scoped name is global and can be called directly from any sheet in the file. A worksheet-scoped name is local to that tab. To call a local name from a different sheet, you must add the sheet name prefix (e.g., Sheet1!MyLocalRange) or Excel will throw a #NAME? error."
    },
    {
        id: "int_pmt_sign_logic",
        tier: "intermediate",
        domain: "Financial Modeling",
        question: "Why does the standard =PMT() function output negative currency values by default?",
        answer: "Excel's financial functions follow standard accounting cash-flow direction models. Loan repayments represent an ongoing cash outflow vector from your account, so the calculation engine outputs these values as negative amounts to reflect money leaving the entity."
    },
    {
        id: "int_wildcard_filtering",
        tier: "intermediate",
        domain: "Data Processing",
        question: "How do the asterisk (*) and question mark (?) wildcards differ when filtering text values?",
        answer: "The asterisk (*) matches any string sequence of any length, including empty character paths. The question mark (?) matches exactly one individual character slot in that specific text position."
    },
    {
        id: "int_goal_seek_mechanic",
        tier: "intermediate",
        domain: "Prescriptive Analytics",
        question: "Describe how the iterative Goal Seek engine resolves back-calculating tasks.",
        answer: "Goal Seek uses back-solving numerical estimation loops to find the input value needed to hit a target formula result. You specify a target output value for a formula cell, and Goal Seek repeatedly adjusts a single linked input cell until the calculation hits that target."
    },
    {
        id: "int_error_value_token",
        tier: "intermediate",
        domain: "Error Auditing",
        question: "What specific breakdown triggers a #VALUE! error token in a worksheet cell location?",
        answer: "A #VALUE! error indicates a data type mismatch inside a calculation step. It typically happens when a formula tries to run mathematical operations using a text string character slot instead of a proper number, or when an invalid data type is passed into a function argument."
    },

    // ==========================================
    // 3. ADVANCED LEVEL ARCHITECTURE (13 QUESTIONS)
    // ==========================================
    {
        id: "int_array_formulas",
        tier: "advanced",
        domain: "Memory Dynamics",
        question: "Explain the difference in execution behavior between legacy Ctrl+Shift+Enter (CSE) calculations and modern dynamic array grids.",
        answer: "Legacy CSE calculations force Excel to iterate computing blocks via explicit multi-cell matrix instantiations or individual array loop triggers. Modern dynamic array architectures (introduced in the Excel calculation engine redesign) natively treat all formulas as arrays by default. They cleanly compute outputs into neighboring vertical or horizontal regions automatically through native structural streaming mechanics."
    },
    {
        id: "int_sumproduct_advanced",
        tier: "advanced",
        domain: "Array Matrix Mathematics",
        question: "How can SUMPRODUCT be used to mimic complex multi-criteria boolean filtering without using standard IFS functions?",
        answer: "SUMPRODUCT can multiply separate criteria conditional arrays together (e.g., (A1:A10='West')*(B1:B10='Sales')). This multiplication step converts logical TRUE/FALSE values into binary 1s and 0s. The function then multiplies these arrays by your data numbers, effectively filtering and summing the values in a single operation."
    },
    {
        id: "int_power_query_folding",
        tier: "advanced",
        domain: "Data Integration",
        question: "What is Query Folding in Power Query, and why is it crucial for optimizing data warehouse data feeds?",
        answer: "Query Folding is the process where Power Query converts its data transformation steps into a single SQL statement. It then pushes this query down to the source database to be processed there. This optimization ensures the database does the heavy lifting, preventing Excel from pulling millions of raw records over the network."
    },
    {
        id: "int_indirect_risk",
        tier: "advanced",
        domain: "Performance Optimization",
        question: "Why do senior data architects minimize or completely ban the use of the INDIRECT function in large models?",
        answer: "INDIRECT is a highly volatile function that breaks Excel's optimized dependency tracking path. It forces the engine to recalculate its code string every time an edit occurs anywhere in the workbook. It also hides cell relationships from audit tools, which slows performance and makes model tracing difficult."
    },
    {
        id: "int_binary_search_speed",
        tier: "advanced",
        domain: "Algorithmic Efficiency",
        question: "What are the performance gains and risks of using a binary search approximate match layout (parameter 1) in lookups?",
        answer: "Binary searches use a fast divide-and-conquer algorithm that searches large datasets much quicker than standard exact match scans. However, the data column *must* be sorted in ascending order. Running a binary search on unsorted data can cause the engine to return incorrect values without warning."
    },
    {
        id: "int_offset_vs_index",
        tier: "advanced",
        domain: "Memory Dynamics",
        question: "Compare the resource costs of using OFFSET versus INDEX when creating dynamic named range boundaries.",
        answer: "OFFSET is highly volatile, meaning it constantly recalculates and adds significant processing lag to large workbooks. INDEX is non-volatile; it only recalculates when the data cells it directly references change, making it a much more efficient choice for dynamic named ranges."
    },
    {
        id: "int_data_validation_custom",
        tier: "advanced",
        domain: "Logical Control",
        question: "How can you use custom logical expressions inside Data Validation to prevent users from entering duplicate values?",
        answer: "You can use a custom validation formula with a COUNTIF statement, such as =COUNTIF($A$1:$A$100, A1)<=1. This rule checks the data range in real time; if a user types a value that already exists, the count exceeds 1, returning a FALSE value that triggers an error alert."
    },
    {
        id: "int_power_pivot_dax_context",
        tier: "advanced",
        domain: "Business Intelligence",
        question: "What is the difference between Row Context and Filter Context in Excel Power Pivot DAX modeling?",
        answer: "Row Context is the concept of evaluating calculations row-by-row, which is used when creating Calculated Columns. Filter Context is the set of data filters applied by pivot table headers, slicers, or explicit DAX filter functions, which determines the data looked at by Measures."
    },
    {
        id: "int_array_spill_error",
        tier: "advanced",
        domain: "Error Auditing",
        question: "What underlying layout block triggers a #SPILL! error token, and how do you resolve it?",
        answer: "A #SPILL! error occurs when a dynamic array formula generates multiple output values but its path is blocked by other text or data in neighboring cells. To fix it, clear any data out of the spill range area to give the array room to expand fully."
    },
    {
        id: "int_conditional_formatting_lag",
        tier: "advanced",
        domain: "Performance Optimization",
        question: "Why does applying massive conditional formatting rules across entire sheet columns cause significant performance lag?",
        answer: "Conditional formatting rules behave like volatile expressions. When applied to millions of cells across entire columns, Excel is forced to constantly recalculate these rules during view scrolling, which slows down the UI rendering engine."
    },
    {
        id: "int_m_language_use",
        tier: "advanced",
        domain: "ETL Pipelines",
        question: "What is the M Language in Excel, and where does its code execute?",
        answer: "M is the functional, case-sensitive formula language used by Power Query. It handles data transformation steps behind the scenes and executes inside the isolated Power Query mashup engine before loading data rows into Excel."
    },
    {
        id: "int_circular_reference_loop",
        tier: "advanced",
        domain: "Error Auditing",
        question: "What is a Circular Reference error, and what setting allows Excel to bypass it intentionally?",
        answer: "A circular reference happens when a formula directly or indirectly references its own cell address, creating an infinite calculation loop. To allow this behavior for specific iterative models, you must turn on 'Enable Iterative Calculation' in Excel's global settings."
    },
    {
        id: "int_nested_array_limits",
        tier: "advanced",
        domain: "Memory Dynamics",
        question: "What happens if a developer tries to nest an array function inside another array calculation layout?",
        answer: "Nesting array formulas can cause Excel to evaluate a large matrix of combinations. In older engine setups, this often resulted in a #VALUE! error. In modern versions, it can run fine but can trigger heavy memory overhead if the dataset is large."
    },

    // ==========================================
    // 4. EXPERT LEVEL ARCHITECTURE (12 QUESTIONS)
    // ==========================================
    {
        id: "int_volatility",
        tier: "expert",
        domain: "Performance Optimization",
        question: "What are volatile functions, and why do they degrade workbook calculations across large cloud architectures?",
        answer: "Volatile functions (such as OFFSET, INDIRECT, NOW, and RAND) force the spreadsheet calculation engine to mark cells as dirty and re-evaluate their entire logic tree whenever ANY edit action occurs anywhere in the workbook. In extensive enterprise templates, this completely breaks optimization graphs, causing cascading recalculation loops that significantly slow UI response times."
    },
    {
        id: "int_lambda_recursion",
        tier: "expert",
        domain: "Algorithmic Efficiency",
        question: "How does the LAMBDA function allow developers to create recursive calculation routines without writing VBA code?",
        answer: "The LAMBDA function allows you to build custom functions using standard Excel formula syntax. By naming the LAMBDA formula in the Name Manager, the function can call itself within its own logic, enabling recursive loops that perform advanced computing tasks without relying on VBA."
    },
    {
        id: "int_vba_early_vs_late",
        tier: "expert",
        domain: "Automation Architecture",
        question: "Explain the architectural trade-offs between Early Binding and Late Binding when writing VBA macro automations.",
        answer: "Early Binding declares objects using explicit external library references (e.g., Dim app As New Outlook.Application). It provides autocomplete support and runs faster because references are verified at compile time, but it can break if users have different software versions. Late Binding uses a generic object declaration (CreateObject), which is slightly slower but more robust across varying runtime environments."
    },
    {
        id: "int_dax_calculate_behavior",
        tier: "expert",
        domain: "Business Intelligence",
        question: "Why is the CALCULATE function in DAX modeling considered the most powerful yet resource-heavy evaluation statement?",
        answer: "The CALCULATE function is unique because it can modify or completely overwrite the existing Filter Context of a visual. It transforms row context into filter context automatically, which can trigger complex calculation resets across large data tables if not optimized properly."
    },
    {
        id: "int_vba_screen_updating_expert",
        tier: "expert",
        domain: "Performance Optimization",
        question: "What low-level system properties must a VBA script toggle to speed up macro processing loops?",
        answer: "To speed up macros, developers set Application.ScreenUpdating = False to stop the UI from drawing intermediate updates, and Application.Calculation = xlCalculationManual to prevent Excel from running calculation loops after every individual row change."
    },
    {
        id: "int_xlm_evaluate_exploit",
        tier: "expert",
        domain: "Automation Architecture",
        question: "What unique capability does the legacy XLM function =EVALUATE() offer inside modern workbooks?",
        answer: "=EVALUATE() is a legacy Excel 4.0 macro command that can parse mathematical text expressions (like '5+10/2') and evaluate them into live numeric results. It cannot be typed into normal cells today, but it can still be executed inside Named Ranges to evaluate dynamic text formulas."
    },
    {
        id: "int_power_query_fast_combine_security",
        tier: "expert",
        domain: "Data Integration",
        question: "What security and optimization implications arise when enabling the 'Fast Combine' feature in complex data models?",
        answer: "Fast Combine speeds up processing by ignoring privacy level security boundaries between different data sources. While this improves performance, the risk is that sensitive data from one secure database could be accidentally shared with an external public query source."
    },
    {
        id: "int_vba_dictionary_hashing",
        tier: "expert",
        domain: "Memory Dynamics",
        question: "Why do expert automation engineers prefer using Scripting.Dictionary objects over standard arrays for data matching loops?",
        answer: "Scripting.Dictionary objects store data using key-value pairs that rely on fast internal hash tables. This allows the macro to look up entries instantly, offering a fast O(1) performance match step that easily outperforms scanning through standard multi-dimensional arrays."
    },
    {
        id: "int_let_garbage_collection",
        tier: "expert",
        domain: "Memory Dynamics",
        question: "How does the LET function handle memory usage and variable lifecycle tracking during complex calculations?",
        answer: "The LET function allocates temporary memory spaces to store intermediate variable results. These variables exist only while the formula executes; once the final output is calculated, Excel flushes these references from memory, preventing memory leaks in large files."
    },
    {
        id: "int_binary_search_text_danger",
        tier: "expert",
        domain: "Algorithmic Efficiency",
        question: "What specific string matching issue occurs when running binary lookups on text data columns containing mixed-case labels?",
        answer: "Binary searches rely on character code order to navigate data. Mixed-case strings or hidden space characters can disrupt this sorting order, causing the lookup engine to stop searching early and return wrong data without throwing an error."
    },
    {
        id: "int_array_hash_spill_tracking",
        tier: "expert",
        domain: "Memory Dynamics",
        question: "How does the modern calculation engine track dynamic spill anchors (#) in memory without slowing down the grid interface?",
        answer: "The updated engine uses dynamic memory maps to track the coordinates of spilled arrays. When a formula uses a spill anchor (e.g., A1#), Excel reads directly from this map instead of scanning the grid, which keeps data tracking fast even as data sizes change."
    },
    {
        id: "int_excel_multi_threading_limits",
        tier: "expert",
        domain: "Performance Optimization",
        question: "What architectural limits determine Excel's multi-threaded calculation features across large multi-sheet workbooks?",
        answer: "Excel breaks calculations down into independent task chains that run across multiple processor threads. However, formulas that rely on volatile functions, linear dependencies, or custom single-threaded VBA macros can block these parallel threads, causing calculations to drop back down to a slower single thread."
    }
];