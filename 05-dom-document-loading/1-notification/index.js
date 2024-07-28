export default class NotificationMessage {
  static DEFAULT_DURATION_MS = 5000;

  /**
   * @type {NotificationMessage | null}
   */
  static _shownNotification = null;

  /**
   * @type {HTMLElement | null}
   */
  _element = null;

  /**
   * @type {number | null}
   */
  _timeoutId = null;

  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {number} [options.duration=5000]
   * @param {"success" | "error"} [options.type="success"]
   */
  constructor(message, options) {
    this.message = message;
    this.duration =
      options?.duration ?? NotificationMessage.DEFAULT_DURATION_MS;
    this.type = options?.type ?? "success";
  }

  get element() {
    this._element ??= this._createElement();
    return this._element;
  }

  _createElement() {
    const element = document.createElement("div");
    const durationSeconds = this.duration / 1000;

    element.innerHTML = `
      <div class="notification ${this.type}" style="--value:${durationSeconds}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;

    return element.firstElementChild;
  }

  /**
   * @param {HTMLElement} [target]
   */
  show(target = document.body) {
    NotificationMessage._shownNotification?.remove();

    target.appendChild(this.element);

    NotificationMessage._shownNotification = this;

    this._timeoutId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    this._element?.remove();

    NotificationMessage._shownNotification = null;

    clearTimeout(this._timeoutId);
    this._timeoutId = null;
  }

  destroy() {
    this.remove();
  }
}
