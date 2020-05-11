export class KeyController {
  static key: number | null;

  static onKeyUp = (event: KeyboardEvent, cb: Function): void => {
    KeyController.key = event.keyCode;
    cb(KeyController.key);
  };
}
