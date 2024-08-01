/**
 * @typedef {"string" | "number"} SortType
 *
 * @typedef {Object} HeaderConfig
 * @property {string} id
 * @property {string} title
 * @property {boolean} sortable
 * @property {SortType} [sortType]
 * @property {(data = []) => string} [template]
 *
 * @typedef {"asc" | "desc"} SortOrder
 *
 * @typedef {Object} SortableTableOptions
 * @property {Object[]} data
 * @property {Object} sorted
 * @property {string} sorted.id
 * @property {SortOrder} sorted.order
 */

/**
 * @param {SortType} type
 * @param {SortOrder} order
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
  _onHeaderCellClick = this._handleHeaderCellClick.bind(this);

  /**
   * @type {HTMLElement | null}
   */
  _element = null;

  /**
   * @param {HeaderConfig[]} headersConfig
   * @param {SortableTableOptions} options
   */
  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this._activeSorting = { ...sorted };
    this._headerConfig = [...headersConfig];

    const sortType = this._getColumnIfSortable(sorted.id)?.sortType;

    if (sortType) {
      this._data = SortableTable._sortData({ data, ...sorted, type: sortType });
    } else {
      this._data = [...data];
    }
  }

  /**
   * @param {string} id
   */
  _getColumnIfSortable(id) {
    const column = this._headerConfig.find((column) => column.id === id);

    if (column?.sortable && column.sortType) {
      return column;
    }
  }

  /**
   * @param {Object} props
   * @param {*[]} props.data
   * @param {string} props.id
   * @param {SortType} props.type
   * @param {SortOrder} props.order
   * @returns {*[]}
   */
  static _sortData({ data, id, type, order }) {
    const sortFunction = getSortFunction(type, order);
    return [...data].sort((a, b) => sortFunction(a[id], b[id]));
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

    element
      .querySelector(".sortable-table__header")
      .addEventListener("pointerdown", this._onHeaderCellClick);

    return element.firstElementChild;
  }

  _getHeaderHtml() {
    const cellsHtml = this._headerConfig
      .map((cellData) => this._getHeaderCellHtml(cellData))
      .join("\n");

    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${cellsHtml}
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
    if (this._activeSorting?.id !== id) {
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
    const rowsHtml = this._data
      .map((rowData) => this._getBodyRowHtml(rowData))
      .join("\n");

    return `
      <div data-element="body" class="sortable-table__body">
        ${rowsHtml}
      </div>
    `;
  }

  /**
   * @param {Object} rowData
   * @returns {string}
   */
  _getBodyRowHtml(rowData) {
    const cellsHtml = this._headerConfig
      .map(
        ({ template, id }) =>
          template?.(rowData[id]) ?? this._getBodyRowCellHtml(rowData[id])
      )
      .join("\n");

    return `
      <div class="sortable-table__row">
        ${cellsHtml}
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

  _handleHeaderCellClick({ target }) {
    const cell = target.closest(".sortable-table__cell[data-sortable='true']");

    if (!cell) {
      return;
    }

    const { id, order = this._activeSorting.order } = cell.dataset;

    this.sort(id, order === "asc" ? "desc" : "asc");
  }

  /**
   * @param {string} id
   * @param {SortOrder} order
   */
  sort(id, order) {
    const sortType = this._getColumnIfSortable(id)?.sortType;

    if (!sortType) {
      return;
    }

    this._activeSorting = { id, order };
    this._data = SortableTable._sortData({
      id,
      order,
      data: this._data,
      type: sortType,
    });

    const newTableElement = this._createElement();
    this._element.replaceWith(newTableElement);
    this._element = newTableElement;
  }

  destroy() {
    this.subElements.header.removeEventListener(
      "pointerdown",
      this._onHeaderCellClick
    );

    this._element.remove();
  }

  get subElements() {
    return {
      header: this.element.querySelector(".sortable-table__header"),
      body: this.element.querySelector(".sortable-table__body"),
    };
  }
}
