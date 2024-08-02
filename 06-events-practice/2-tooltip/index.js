class Tooltip {
  static _TOOLTIP_OFFSET = 16;

  /**
   * @type {Tooltip | null}
   */
  static _instance = null;

  _onPointerOver = this._handlePointerOver.bind(this);

  _onPointerMove = this._handlePointerMove.bind(this);

  _onPointerOut = this._handlePointerOut.bind(this);

  /**
   * @type {HTMLElement | null}
   */
  element = null;

  constructor() {
    Tooltip._instance ??= this;
    return Tooltip._instance;
  }

  initialize() {
    document.addEventListener("pointerover", this._onPointerOver);
    document.addEventListener("pointermove", this._onPointerMove);
    document.addEventListener("pointerout", this._onPointerOut);
  }

  /**
   * @param {MouseEvent} event
   */
  _handlePointerOver({ target, clientX: x, clientY: y }) {
    const tooltipText = target.closest("[data-tooltip]")?.dataset?.tooltip;

    if (tooltipText) {
      this.render(tooltipText, { x, y });
    }
  }

  /**
   * @param {string} tooltipText
   * @param {Object} [position]
   * @param {number} position.x
   * @param {number} position.y
   */
  render(tooltipText, { x, y } = {}) {
    const tooltipWrapper = document.createElement("div");

    tooltipWrapper.innerHTML = `
      <div class="tooltip" style="top: ${y}px; left: ${x}px;">
        ${tooltipText}
      </div>
    `;

    const tooltipElement = tooltipWrapper.firstElementChild;
    this.element = tooltipElement;
    document.body.append(tooltipElement);
  }

  /**
   * @param {MouseEvent} event
   */
  _handlePointerMove({ clientX, clientY }) {
    if (!this.element?.isConnected) {
      return;
    }

    const tooltipX = clientX + Tooltip._TOOLTIP_OFFSET;
    const tooltipY = clientY + Tooltip._TOOLTIP_OFFSET;
    this.element.style.cssText = `top: ${tooltipY}px; left: ${tooltipX}px`;
  }

  _handlePointerOut() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener("pointerover", this._onPointerOver);
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerout", this._onPointerOut);
    this.element.remove();
  }
}

export default Tooltip;
