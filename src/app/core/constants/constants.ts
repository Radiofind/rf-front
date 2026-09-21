// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Constants {
  // inline strings

  public static readonly EMPTY_STRING: string = '';

  public static readonly TOKEN_KEY: string = 'radiofind_token';

  public static readonly UPPERCASE: string = 'uppercase';

  public static readonly LOWERCASE: string = 'lowercase';

  public static readonly NUMBER_PROPERTY: string = 'number';

  public static readonly SPECIAL_CHARACTER: string = 'specialCharacter';

  public static readonly SPACES_PROPERTY: string = 'spaces';

  public static readonly PASSWORD_MISMATCH: string = 'passwordMismatch';

  public static readonly INVALID_DATE: string = 'invalidDate';

  public static readonly SERVER_ERROR: string = 'server';

  public static readonly LOGIN: string = 'login';

  public static readonly REGISTER: string = 'register';

  public static readonly AUTH_TYPE_PROP: string = 'authType';

  public static readonly INVALID_LOGIN_PASSWORD: string = 'Invalid login or password';

  public static readonly REGISTRATION_FAILED: string = 'Registration failed, please try again';

  public static readonly INVALID_TWO_FACTOR_CODE: string = 'Invalid verification code, please try again';

  public static readonly RESEND_TWO_FACTOR_CODE_FAILED: string =
    'Failed to resend the code, please try again';

  public static readonly REQUIRED_PROPERTY: string = 'required';

  public static readonly SPLIT_DATE_BY_T: string = 'T';

  public static readonly DASH: string = '-';

  public static readonly ZERO_STRING: string = '0';

  public static readonly AUTH_PART_PATH: string = '/auth';

  public static readonly BEARER: string = 'Bearer';

  public static readonly CODE_FIELD_PLACEHOLDER: string = '0';

  public static readonly CODE_FIELD_CELL_AREA_LABEL: string = 'Digit';

  public static readonly BACKSPACE_KEY: string = 'Backspace';

  public static readonly ARROW_LEFT_KEY: string = 'ArrowLeft';

  public static readonly ARROW_RIGHT_KEY: string = 'ArrowRight';

  public static readonly CLIPBOARD_FORMAT: string = 'text';

  public static readonly MODAL_DEFAULT_CONFIRM_TEXT: string = 'Confirm';

  public static readonly MODAL_DEFAULT_CANCEL_TEXT: string = 'Cancel';

  public static readonly MODAL_PANEL_CLASS: string = 'modal-panel';

  public static readonly MODAL_CONTAINER_CLASS: string = 'modal-container';

  public static readonly MODAL_BACKDROP_CLASS: string = 'modal-backdrop';

  public static readonly MODAL_TITLE_ID_SUFFIX: string = '-title';

  public static readonly MODAL_CLOSE_ARIA_LABEL: string = 'Close modal';

  public static readonly MODAL_CLOSE_ICON_CLASS: string = 'bx bx-x';

  public static readonly MODAL_TAB_INDEX: string = '-1';

  public static readonly MODAL_MAX_WIDTH: string = 'calc(100vw - 32px)';

  public static readonly MODAL_MAX_HEIGHT: string = 'calc(100vh - 32px)';

  public static readonly MODAL_AUTO_FOCUS_TARGET: string = 'first-tabbable';

  public static readonly MODAL_SIZE_SMALL: string = '440px';

  public static readonly MODAL_SIZE_MEDIUM: string = '600px';

  public static readonly MODAL_SIZE_LARGE: string = '840px';

  public static readonly SHIELD_ICON_CLASS: string = 'bx bx-shield';

  public static readonly LOCK_ICON_CLASS: string = 'bx bx-lock-keyhole';

  public static readonly SUBMIT_ICON_CLASS: string = 'bx bx-arrow-right-stroke';

  public static readonly MAIL_ICON_CLASS: string = 'bx bx-envelope-alt';

  public static readonly EYE_ICON_CLASS: string = 'bx bx-eye';

  public static readonly EYE_SLASH_ICON_CLASS: string = 'bx bx-eye-slash';

  public static readonly TIME_SEPARATOR: string = ':';

  public static readonly CELL_FIELD: string = 'cell';

  public static readonly SPINNER_DEFAULT_SIZE: string = '24px';

  public static readonly SPINNER_DEFAULT_THICKNESS: string = '3px';

  public static readonly SPINNER_ARIA_LABEL: string = 'Loading';

  public static readonly LOADER_SPINNER_SIZE: string = '64px';

  public static readonly LOADER_SPINNER_THICKNESS: string = '5px';

  public static readonly LOADER_TEXT: string = 'Loading...';

  public static readonly LOADER_BODY_CLASS: string = 'is-loading';

  public static readonly RESEND_SPINNER_SIZE: string = '20px';

  public static readonly RESEND_SPINNER_THICKNESS: string = '2px';

  public static readonly SNACKBAR_SUCCESS_ICON_CLASS: string = 'bx bx-badge-check';

  public static readonly SNACKBAR_ERROR_ICON_CLASS: string = 'bx bx-x-circle';

  public static readonly SNACKBAR_WARNING_ICON_CLASS: string = 'bx bx-error';

  public static readonly SNACKBAR_INFO_ICON_CLASS: string = 'bx bx-info-circle';

  public static readonly SNACKBAR_CONTAINER_ARIA_LABEL: string = 'Notifications';

  public static readonly TOKEN: string = 'token';

  public static readonly ERROR_TYPE_PROP: string = 'errorType';

  public static readonly ERROR_HOME_BUTTON_TEXT: string = 'Back to Home';

  public static readonly ERROR_BACK_BUTTON_TEXT: string = 'Go Back';

  public static readonly ERROR_SECONDARY_BUTTON_CLASS: string = 'button--secondary';

  public static readonly HOME_ICON_CLASS: string = 'bx bx-home';

  public static readonly BACK_ICON_CLASS: string = 'bx bx-arrow-left-stroke';

  public static readonly PASSWORD_RESET_SUCCESSFULLY: string = 'Password reset successfully';

  public static readonly HEADER_LOGO_ALT: string = 'Logo';

  public static readonly HEADER_BRAND_TITLE: string = 'RADIOFIND';

  public static readonly HEADER_SEARCH_PLACEHOLDER: string = 'Search artists, songs, genres...';

  public static readonly HEADER_SEARCH_ARIA_LABEL: string = 'Search artists, songs, genres';

  public static readonly HEADER_CLEAR_SEARCH_ARIA_LABEL: string = 'Clear search';

  public static readonly HEADER_MESSAGES_ARIA_LABEL: string = 'Messages';

  public static readonly HEADER_NOTIFICATIONS_ARIA_LABEL: string = 'Notifications';

  public static readonly HEADER_PROFILE_ARIA_LABEL: string = 'Profile';

  public static readonly HEADER_AVATAR_ALT: string = 'User avatar';

  public static readonly HEADER_UPGRADE_BUTTON_TEXT: string = 'Upgrade to Premium';

  public static readonly HEADER_PREMIUM_BUTTON_CLASS: string = 'button--premium';

  public static readonly SEARCH_ICON_CLASS: string = 'bx bx-search';

  public static readonly CLEAR_ICON_CLASS: string = 'bx bx-x';

  public static readonly STAR_ICON_CLASS: string = 'bxf bx-star';

  public static readonly BELL_ICON_CLASS: string = 'bx bx-bell';

  public static readonly USER_ICON_CLASS: string = 'bxf bx-user';

  // magic numbers

  public static readonly ZERO: number = 0;

  public static readonly MIN_LINGTH_FORM_VALIDATION_NAME: number = 2;

  public static readonly MIN_LINGTS_FORM_VALIDATION_PASSWORD: number = 8;

  public static readonly MAX_LENGTH_FORM_ARTIST_OR_BAND_NAME: number = 50;

  public static readonly MIN_BIRTH_DATE: number = 100;

  public static readonly ONE: number = 1;

  public static readonly INVALID_DATA_MESSAGE_TIME: number = 3000;

  public static readonly DEFAULT_TEXTAREA_ROWS: number = 10;

  public static readonly DATE_PAD_LENGTH: number = 2;

  public static readonly CODE_FIELD_DEFAULT_LENGTH: number = 6;

  public static readonly NOT_FOUND_INDEX: number = -1;

  public static readonly RESEND_TIMEOUT_SECONDS: number = 45;

  public static readonly TIMER_INTERVAL_MS: number = 1000;

  public static readonly SECONDS_IN_MINUTE: number = 60;

  public static readonly TIME_PAD_LENGTH: number = 2;

  public static readonly SNACKBAR_DURATION_MS: number = 2000;

  public static readonly SNACKBAR_MAX_STACK: number = 3;

  // others

  public static readonly LOADER_BLOCKED_EVENTS: readonly string[] = [
    'keydown',
    'keypress',
    'keyup',
    'wheel',
    'touchmove',
  ];

  public static readonly EN_VALIDATOR_PATTERN: RegExp = /^[A-Za-z-]+$/;

  public static readonly UPPERCASE_VALIDATOR_PATTERN: RegExp = /[A-Z]/;

  public static readonly LOWERCASE_VALIDATOR_PATTERN: RegExp = /[a-z]/;

  public static readonly DECIMAL_VALIDATOR_PATTERN: RegExp = /\d/;

  public static readonly SPECIAL_CHARACTER_VALIDATOR_PATTERN: RegExp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

  public static readonly EN_PLUS_SPACES_AND_SYMBOLS: RegExp = /^[0-9A-Za-z\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/;

  public static readonly SPACES_VALIDATOR_PATTERN: RegExp = /\s/;

  public static readonly NOT_DIGIT_PATTERN: RegExp = /\D/g;
}
