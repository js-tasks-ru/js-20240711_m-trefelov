export default class DoubleSlider {
  _onPointerDown = this._handlePointerDown.bind(this);

  _onPointerMove = this._handlePointerMove.bind(this);

  _onPointerUp = this._handlePointerUp.bind(this);

  /**
   * @type {"left" | "right" | null}
   */
  _activeThumb = null;

  /**
   * @param {Object} options
   * @param {number} options.min
   * @param {number} options.max
   * @param {(value: number) => string} options.formatValue
   * @param {Object} [options.selected]
   * @param {number} options.selected.from
   * @param {number} options.selected.to
   */
  constructor({ min, max, formatValue, selected }) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.from = selected?.from ?? min;
    this.to = selected?.to ?? max;
    this.element = this._createElement();
  }

  _createElement() {
    const wrapper = document.createElement("div");

    const { from, to, min, max, formatValue } = this;
    const minMaxDistance = max - min;
    const leftPercent = `${((from - min) / minMaxDistance) * 100}%`;
    const rightPercent = `${(1 - (to - min) / minMaxDistance) * 100}%`;

    wrapper.innerHTML = `
      <div class="range-slider">
        <span data-element="from">${formatValue(from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: ${leftPercent}; right: ${rightPercent}"></span>
          <span class="range-slider__thumb-left" style="left: ${leftPercent}"></span>
          <span class="range-slider__thumb-right" style="right: ${rightPercent}"></span>
        </div>
        <span data-element="to">${formatValue(to)}</span>
      </div>
    `;

    const element = wrapper.firstElementChild;

    this.subElements = {
      inner: element.querySelector(".range-slider__inner"),
      progress: element.querySelector(".range-slider__progress"),
      leftThumb: element.querySelector(".range-slider__thumb-left"),
      rightThumb: element.querySelector(".range-slider__thumb-right"),
      leftValue: element.querySelector("[data-element='from']"),
      rightValue: element.querySelector("[data-element='to']"),
    };

    element.addEventListener("pointerdown", this._onPointerDown);

    return element;
  }

  /**
   * @param {MouseEvent} event
   */
  _handlePointerDown({ target }) {
    const thumb = target.closest(
      ".range-slider__thumb-left, .range-slider__thumb-right"
    );

    if (!thumb) {
      return;
    }

    if (thumb === this.subElements.leftThumb) {
      this._activeThumb = "left";
    } else {
      this._activeThumb = "right";
    }

    this.element.classList.add("range-slider_dragging");

    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerup", this._onPointerUp, { once: true });
  }

  /**
   * @param {MouseEvent} event
   */
  _handlePointerMove({ clientX }) {
    if (this._activeThumb === "left") {
      this._handleLeftThumbMove(clientX);
    } else {
      this._handleRightThumbMove(clientX);
    }
  }

  _handleLeftThumbMove(clientX) {
    const { min, max, subElements, formatValue } = this;
    const { width, left } = subElements.inner.getBoundingClientRect();

    const ratio = (max - min) / width;
    const unsafeValue = min + (clientX - left) * ratio;
    const value = Math.min(Math.max(min, unsafeValue), this.to);
    const thumbPosition = left + (value - min) / ratio;

    this.from = value;
    subElements.leftValue.textContent = formatValue(Math.trunc(value));
    const percent = `${((thumbPosition - left) / width) * 100}%`;
    subElements.progress.style.left = percent;
    subElements.leftThumb.style.left = percent;
  }

  _handleRightThumbMove(clientX) {
    const { min, max, subElements, formatValue } = this;
    const { width, left, right } = subElements.inner.getBoundingClientRect();

    const ratio = (max - min) / width;
    const unsafeValue = min + (clientX - left) * ratio;
    const value = Math.max(this.from, Math.min(unsafeValue, max));
    const thumbPosition = left + (value - min) / ratio;

    this.to = value;
    subElements.rightValue.textContent = formatValue(Math.trunc(value));
    const percent = `${((right - thumbPosition) / width) * 100}%`;
    subElements.progress.style.right = percent;
    subElements.rightThumb.style.right = percent;
  }

  _handlePointerUp() {
    this._activeThumb = null;

    this.element.classList.remove("range-slider_dragging");

    document.removeEventListener("pointermove", this._onPointerMove);

    this.element.dispatchEvent(
      new CustomEvent("range-select", {
        detail: {
          from: this.from,
          to: this.to,
        },
      })
    );
  }

  destroy() {
    this.element.removeEventListener("pointerdown", this._onPointerDown);
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerup", this._onPointerUp);
    this.element.remove();
  }
}
