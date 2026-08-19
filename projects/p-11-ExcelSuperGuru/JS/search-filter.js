/**
 * ==========================================================================
 * ExcelSuperGuru - Client-Side Search, Filter, and View Rendering Logic
 * ==========================================================================
 */

import { FORMULAS_DB } from '../data/formulas-db.js';

document.addEventListener('DOMContentLoaded', () => {
    FormulaSearchEngine.init();
});

const FormulaSearchEngine = (() => {
    // Shared references mapping DOM entry layouts
    const dom = {
        searchInput: document.getElementById('formulaSearch'),
        categorySelect: document.getElementById('categoryFilter'),
        complexitySelect: document.getElementById('complexityFilter'),
        gridDisplay: document.getElementById('formulaGridDisplay')
    };

    /**
     * Loops across elements generating strings to append to the template root.
     * @param {Array} records - Filtered list from FORMULAS_DB single source
     */
    const renderCards = (records) => {
        if (!dom.gridDisplay) return;
        
        if (records.length === 0) {
            dom.gridDisplay.innerHTML = `
                <div class="ui-card text-center" style="padding: 4rem 2rem;">
                    <h3 style="color: var(--text-muted);">No Formulas Match Your Criteria</h3>
                    <p>Try re-adjusting parameters or check syntax characters inside the search prompt.</p>
                </div>
            `;
            return;
        }

        dom.gridDisplay.innerHTML = records.map(formula => `
            <article class="formula-detail-card" id="${formula.id}">
                <div class="formula-header-meta">
                    <div>
                        <h2 style="color: var(--excel-green); font-size: 1.75rem; margin-bottom: 0.25rem;">${formula.name}</h2>
                        <span class="badge badge-category">${formula.category}</span>
                        <span class="badge badge-complexity">${formula.complexity}</span>
                    </div>
                </div>
                <p style="font-size: 1.05rem; margin-bottom: 1rem;">${formula.description}</p>
                
                <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Syntax Template</h4>
                <div class="syntax-block">${formula.syntax}</div>
                
                ${formula.examples.map(ex => `
                    <div class="example-box">
                        <strong style="display:block; font-size:0.9rem; margin-bottom:0.25rem; color:var(--text-primary);">Evaluated Workspace Example:</strong>
                        <code style="display:block; color:var(--excel-green); font-weight:600; margin-bottom:0.5rem;">${ex.input}</code>
                        <p style="margin:0; font-size:0.95rem;"><strong>Result Yield:</strong> <code>${ex.output}</code></p>
                        <p style="margin:0.25rem 0 0 0; font-size:0.9rem; color:var(--text-secondary);">${ex.explanation}</p>
                    </div>
                `).join('')}
                
                <div style="margin-top: 1.25rem;">
                    ${formula.tags.map(tag => `<span class="tag-pill">#${tag}</span>`).join('')}
                </div>
            </article>
        `).join('');
    };

    /**
     * Computes search query match assertions against memory data structures
     */
    const filterDataEngine = () => {
        const query = dom.searchInput ? dom.searchInput.value.toLowerCase().trim() : '';
        const selectedCat = dom.categorySelect ? dom.categorySelect.value : 'ALL';
        const selectedComp = dom.complexitySelect ? dom.complexitySelect.value : 'ALL';

        const outputData = FORMULAS_DB.filter(formula => {
            const matchesSearch = 
                formula.name.toLowerCase().includes(query) ||
                formula.description.toLowerCase().includes(query) ||
                formula.syntax.toLowerCase().includes(query) ||
                formula.tags.some(tag => tag.toLowerCase().includes(query));

            const matchesCategory = (selectedCat === 'ALL' || formula.category === selectedCat);
            const matchesComplexity = (selectedComp === 'ALL' || formula.complexity === selectedComp);

            return matchesSearch && matchesCategory && matchesComplexity;
        });

        renderCards(outputData);
    };

    /**
     * Binds functional event hooks to elements
     */
    const bindEventFramework = () => {
        if (dom.searchInput) dom.searchInput.addEventListener('input', filterDataEngine);
        if (dom.categorySelect) dom.categorySelect.addEventListener('change', filterDataEngine);
        if (dom.complexitySelect) dom.complexitySelect.addEventListener('change', filterDataEngine);
    };

    return {
        init: () => {
            if (dom.gridDisplay) {
                renderCards(FORMULAS_DB);
                bindEventFramework();
                console.log('Formula Processing Controller System Online.');
            }
        }
    };
})();

export { FormulaSearchEngine };