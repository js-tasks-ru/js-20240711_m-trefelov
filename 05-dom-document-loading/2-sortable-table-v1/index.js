/**
 * @param {"number" | "string"} type
 * @param {"asc" | "desc"} order
 * @returns {(a, b) => number}
 */
function getSortFunction(type, order) {
  if (type === "number") {
    return order === "asc" ? (a, b) => a - b : (a, b) => b - a;
  }

  const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

  return order === "asc"
    ? (a, b) => collator.compare(a, b)
    : (a, b) => collator.compare(b, a);
}

export default class SortableTable {
  /**
   * @type {HTMLElement | null}
   */
  _element = null;

  /**
   * @type {{ columnId: string; order: "asc" | "desc" } | null}
   */
  _activeSorting = null;

  /**
   * @param {Object[]} headerConfig
   * @param {string} headerConfig[].id
   * @param {string} headerConfig[].title
   * @param {boolean} headerConfig[].sortable
   * @param {string} [headerConfig[].sortType]
   * @param {(data = []) => string} [headerConfig.template]
   * @param {Object[]} data
   */
  constructor(headerConfig = [], data = []) {
    this._headerConfig = [...headerConfig];
    this._data = [...data];
  }

  get element() {
    this._element ??= this._createElement();
    return this._element;
  }

  _createElement() {
    const element = document.createElement("div");
    const headerHtml = this._getHeaderHtml();
    const bodyHtml = this._getBodyHtml();

    element.innerHTML = `  
      <div class="sortable-table">
        ${headerHtml}
        ${bodyHtml}
      </div>
    `;

    return element.firstElementChild;
  }

  _getHeaderHtml() {
    const cells = this._headerConfig
      .map((data) => this._getHeaderCellHtml(data))
      .join("\n");

    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${cells}
      </div>
    `;
  }

  /**
   * @param {Object} props
   * @param {string} props.id
   * @param {string} props.title
   * @param {boolean} props.sortable
   * @returns {string}
   */
  _getHeaderCellHtml({ id, title, sortable }) {
    if (this._activeSorting?.columnId !== id) {
      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
        </div>
      `;
    }

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${this._activeSorting.order}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
  `;
  }

  _getBodyHtml() {
    const rows = this._data
      .map((rowData) => this._getBodyRowHtml(rowData))
      .join("\n");

    return `
      <div data-element="body" class="sortable-table__body">
        ${rows}
      </div>
    `;
  }

  /**
   * @param {Object} data
   * @returns {string}
   */
  _getBodyRowHtml(data) {
    const cells = this._headerConfig
      .map(
        ({ template, ...rest }) =>
          template?.([rest]) ?? this._getBodyRowCellHtml(data[rest.id])
      )
      .join("\n");

    return `
      <div class="sortable-table__row">
        ${cells}
      </div>
    `;
  }

  /**
   * @param {string} [value=""]
   * @returns {string}
   */
  _getBodyRowCellHtml(value = "") {
    return `<div class="sortable-table__cell">${value}</div>`;
  }

  /**
   * @param {string} columnId
   * @param {"asc" | "desc"} order
   */
  sort(columnId, order) {
    const fieldColumn = this._getColumnIfSortable(columnId);

    if (!fieldColumn) {
      return;
    }

    const sortFunction = getSortFunction(fieldColumn.sortType, order);
    this._activeSorting = { columnId, order };
    this._data.sort((a, b) => sortFunction(a[columnId], b[columnId]));

    const newTableElement = this._createElement();
    this._element.replaceWith(newTableElement);
    this._element = newTableElement;
  }

  /**
   * @param {string} columnId
   */
  _getColumnIfSortable(columnId) {
    const fieldColumn = this._headerConfig.find(
      (column) => column.id === columnId
    );

    if (fieldColumn?.sortable && fieldColumn.sortType) {
      return fieldColumn;
    }
  }

  get subElements() {
    return {
      header: this.element.querySelector(".sortable-table__header"),
      body: this.element.querySelector(".sortable-table__body"),
    };
  }

  destroy() {
    this._element?.remove();
  }
}
