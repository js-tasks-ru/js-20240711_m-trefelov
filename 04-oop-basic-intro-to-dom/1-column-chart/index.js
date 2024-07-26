export default class ColumnChart {
  static CHART_HEIGHT = 50;

  /**
   * @type {HTMLElement | null}
   */
  _element = null;

  /**
   * @param {Object} [props={}]
   * @param {number[]} [props.data=[]]
   * @param {string} [props.label=""]
   * @param {number} [props.value]
   * @param {string} [props.link]
   * @param {(value: number) => string} [props.formatHeading]
   */
  constructor({ data = [], label = "", link, value, formatHeading } = {}) {
    this._values = [...data];
    this._label = label;
    this._link = link;

    if (value != null) {
      this._heading = formatHeading?.(value) ?? value.toString();
    } else {
      this._heading = null;
    }
  }

  get element() {
    this._element ??= this._createElement();
    return this._element;
  }

  _createElement() {
    const root = this._createRoot();
    const title = this._createTitle();
    const container = this._createContainer();

    root.append(title, container);
    return root;
  }

  _createRoot() {
    const { _values } = this;

    const element = document.createElement("div");
    element.className = "column-chart";

    if (_values.length === 0) {
      element.classList.add("column-chart_loading");
    }

    element.style.cssText = `--chart-height: ${this.chartHeight}`;
    return element;
  }

  get chartHeight() {
    return ColumnChart.CHART_HEIGHT;
  }

  _createTitle() {
    const { _label, _link } = this;

    const element = document.createElement("div");
    element.className = "column-chart__title";
    element.textContent = _label;

    if (_link) {
      element.insertAdjacentHTML(
        "beforeend",
        `<a href="${_link}" class="column-chart__link">View all</a>`
      );
    }

    return element;
  }

  _createContainer() {
    const container = document.createElement("div");
    container.className = "column-chart__container";

    const header = this._createHeader();
    const body = this._createBody();
    container.append(header, body);

    return container;
  }

  _createHeader() {
    const element = document.createElement("div");
    element.className = "column-chart__header";
    element.dataset.element = "header";
    element.textContent = this._heading;

    return element;
  }

  _createBody() {
    const element = document.createElement("div");
    element.className = "column-chart__chart";
    element.dataset.element = "body";

    const columns = this._chartData.map(({ value, percent }) => {
      const column = document.createElement("div");
      column.style.cssText = `--value: ${value}`;
      column.dataset.tooltip = percent;
      return column;
    });

    element.append(...columns);

    return element;
  }

  /**
   * @returns {{ value: number; percent: string }[]}
   */
  get _chartData() {
    const { _values, chartHeight } = this;

    const maxValue = _values.reduce((a, b) => Math.max(a, b), -Infinity);
    const scale = chartHeight / maxValue;

    return _values.map((value) => {
      return {
        percent: ((value / maxValue) * 100).toFixed(0) + "%",
        value: Math.floor(value * scale),
      };
    });
  }

  /**
   * @param {number[]} values
   */
  update(values) {
    this._values = [...values];

    const root = this._element?.querySelector("column-chart");

    if (!root) {
      return;
    }

    if (values.length > 0) {
      root.classList.remove("column-chart_loading");
    } else {
      root.classList.add("column-chart_loading");
    }

    const body = this._element?.querySelector(".column-chart__chart");

    if (body) {
      body.replaceWith(this._createBody());
    }
  }

  remove() {
    if (this._element) {
      this._element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
